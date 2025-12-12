import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  CreateAssignmentResponse,
  DeleteAssignmentResponse,
  GetAllAssignmentResponsesOfTopic,
} from '@modules/assignment/api/assignment-response.api';
import { acceptedExplorerFileTypes } from '@modules/assignment/constants/assignment.constant';
import { UploadMultipleCloudinaryFiles } from '@shared/api/cloudinary.api';
import { convertCloudinaryUrlToDownloadUrl } from '@shared/helper/cloudinary.api.helper';
import { compareTime, formatDateString } from '@shared/helper/date.helper';
import { AssignmentData } from '@shared/models/assignment';
import { CloudinaryFile } from '@shared/models/cloudinary-file';
import {
  AssignmentResponseData,
  StudentResponse,
} from '@shared/models/student-response';
import { AssignmentTopic } from '@shared/models/topic';
import { StudentResponseService } from '@shared/services/student-response.service';
import { UserService } from '@shared/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { Comment } from '@shared/models/comment';
import { getComments, createComment } from '@shared/api/comment.api';
import { User } from '@shared/models/user';
import { NotificationService } from '@shared/services/notification.service';
import { Course } from '@shared/models/course';

@Component({
  selector: 'tab-assignment-student',
  standalone: false,
  templateUrl: './tab-assignment.component.html',
  styleUrl: './tab-assignment.component.scss',
  providers: [StudentResponseService],
})
export class TabAssignmentStudentComponent implements OnInit, OnChanges {
  @Input({ required: true }) topic!: AssignmentTopic;
  @Input() course!: Course;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  acceptedFileTypes = acceptedExplorerFileTypes;
  studentResponse: StudentResponse | null = null;
  uploadedFiles: CloudinaryFile[] = [];
  hasGraded = false;
  canAddSubmission = true;

  // Comment functionality
  comments: Comment[] = [];
  newCommentText: string = '';
  currentUser: User | null = null;
  courseId: string | null = null;

  constructor(
    private userService: UserService,
    private toastr: ToastrService,
    private activatedRoute: ActivatedRoute,
    private notificationService: NotificationService
  ) {
    this.courseId = this.activatedRoute.snapshot.paramMap.get('courseId');
  }

  ngOnInit(): void {
    this.currentUser = this.userService.getUser();
    this.fetchUserAssignmentResponse();
    this.fetchComments();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['topic'] && this.topic) {
      const assignmentData = this.topic.data as AssignmentData;
      // Backend returns 'files', fallback to 'cloudinaryFiles' for backward compatibility
      this.uploadedFiles = assignmentData.files ?? assignmentData.cloudinaryFiles ?? [];
      this.updateCanSubmitStatus(this.topic);
    }
  }

  updateCanSubmitStatus(topic: AssignmentTopic) {
    const now = new Date();
    const openDate = topic.data.open ? new Date(topic.data.open) : null;
    const closeDate = topic.data.close ? new Date(topic.data.close) : null;

    if (openDate && now < openDate) {
      this.canAddSubmission = false;
    } else if (closeDate && now > closeDate) {
      this.canAddSubmission = false;
    } else {
      this.canAddSubmission = true;
    }
  }

  async fetchUserAssignmentResponse() {
    try {
      const user = this.userService.getUser();
      if (user) {
        const responses = await GetAllAssignmentResponsesOfTopic(this.topic.id);
        this.studentResponse =
          responses.find(
            (response: StudentResponse) => response.studentId === user.id
          ) || null;
        if (this.studentResponse) {
          const data = this.studentResponse.data as AssignmentResponseData;
          this.hasGraded = data.mark !== null && data.mark !== undefined;
        }
      }
    } catch (error) {
      this.toastr.error('Failed to fetch assignment response', 'Error');
    }
  }

  formatDate(date: string | null, pattern: string = 'MM/dd/yyyy HH:mm a') {
    return formatDateString(date, pattern);
  }

  openExplorer() {
    this.fileInput.nativeElement.click();
  }

  async onSelectedFile(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);

      const user = this.userService.getUser();
      if (!user) {
        this.toastr.error('User not found', 'Error');
        return;
      }

      try {
        // Upload files to Cloudinary
        this.toastr.info('Uploading files...', 'Please wait');
        const cloudinaryResponses = await UploadMultipleCloudinaryFiles(files);

        // Convert Cloudinary responses to CloudinaryFile objects
        const fileList: CloudinaryFile[] = cloudinaryResponses.map(
          (response: any, idx: number) => ({
            id: crypto.randomUUID(),
            name: files[idx].name,
            displayUrl: response.url,
            downloadUrl: convertCloudinaryUrlToDownloadUrl(response.url),
          })
        );

        const newResponse = {
          id: '',
          studentId: user.id,
          topicId: this.topic.id,
          data: {
            submittedAt: new Date().toISOString(),
            files: fileList,
            mark: null,
            note: '',
          },
        };

        console.log('Creating assignment response with data:', newResponse);
        this.studentResponse = await CreateAssignmentResponse(
          this.topic.id,
          newResponse
        );
        this.toastr.success('Assignment submitted successfully', 'Success');
      } catch (error) {
        console.error('Error submitting assignment:', error);
        if (error instanceof Error) {
          this.toastr.error(
            `Failed to submit assignment: ${error.message}`,
            'Error'
          );
        } else {
          this.toastr.error('Failed to submit assignment', 'Error');
        }
      }
    }
    this.fileInput.nativeElement.value = '';
  }

  async onRemoveSubmission() {
    if (!this.studentResponse) return;
    try {
      await DeleteAssignmentResponse(this.topic.id, this.studentResponse.id);
      this.studentResponse = null;
      this.toastr.success('Submission removed successfully', 'Success');
    } catch (error) {
      this.toastr.error('Failed to remove submission', 'Error');
    }
  }

  async fetchComments(): Promise<void> {
    if (!this.courseId || !this.topic?.id) return;
    
    try {
      this.comments = await getComments(this.courseId, this.topic.id);
    } catch (error) {
      console.error('Error fetching comments:', error);
      this.comments = [];
    }
  }

  getAuthorName(comment: Comment): string {
    return comment.user?.username || 'Unknown User';
  }

  getAvatar(comment: Comment): string {
    return comment.user?.avatar || 'https://via.placeholder.com/40/607D8B/FFFFFF?text=?';
  }

  getCurrentUserAvatar(): string {
    return this.currentUser?.avatar || 'https://via.placeholder.com/40/607D8B/FFFFFF?text=You';
  }

  async addComment(): Promise<void> {
    if (!this.newCommentText.trim() || !this.courseId || !this.topic?.id) return;
    
    try {
      const newComment = await createComment(
        this.courseId,
        this.topic.id,
        { text: this.newCommentText.trim() }
      );
      
      this.comments = [...this.comments, newComment];
      this.newCommentText = '';

      // Send notification to all course participants
      this.sendNotificationToCourseParticipants(newComment.text);
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  }

  private sendNotificationToCourseParticipants(commentText: string): void {
    if (!this.course || !this.currentUser) {
      console.warn('Cannot send notifications: course or currentUser is missing', { course: this.course, currentUser: this.currentUser });
      return;
    }

    console.log('Sending notifications for comment:', commentText);
    const title = 'New Comment';
    const message = `${this.currentUser.username} commented: "${commentText.substring(0, 50)}${commentText.length > 50 ? '...' : ''}"`;

    // Send to teacher/creator
    if (this.course.creator && this.course.creator.id !== this.currentUser.id) {
      console.log('Sending notification to creator:', this.course.creator.id);
      this.notificationService.createNotification(
        this.course.creator.id,
        title,
        message
      ).subscribe({
        next: () => console.log('✓ Notification sent to creator'),
        error: (err: any) => console.error('✗ Error sending notification to creator:', err)
      });
    }

    // Send to all students
    if (this.course.students) {
      console.log('Sending notifications to students:', this.course.students.length);
      this.course.students.forEach((student: User) => {
        if (student.id !== this.currentUser?.id) {
          console.log('Sending notification to student:', student.id);
          this.notificationService.createNotification(
            student.id,
            title,
            message
          ).subscribe({
            next: () => console.log('✓ Notification sent to student:', student.id),
            error: (err: any) => console.error('✗ Error sending notification to student:', err)
          });
        }
      });
    }
  }
}
