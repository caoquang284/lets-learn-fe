import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  CreateSection,
  GetSection,
  UpdateSection,
} from '@modules/courses/api/section.api';
import { UpdateCourse } from '@modules/courses/api/courses.api';
import { CreateTopic, DeleteTopic } from '@modules/courses/api/topic.api';
import { CollapsibleListService } from '@shared/components/collapsible-list/collapsible-list.service';
import { Course, Section } from '@shared/models/course';
import { Topic } from '@shared/models/topic';
import { CourseService } from '@shared/services/course.service';
import {
  CreateTopicRequest,
  TopicService,
} from '@shared/services/topic.service';
import { ToastrService } from 'ngx-toastr';
import { AddTopicDialogResult } from '../../../add-topic-dialog/add-topic-dialog.component';
import { UpdateCourseImageResult } from '../../../update-course-image-dialog/update-course-image-dialog.component';

@Component({
  selector: 'tab-course',
  standalone: false,
  templateUrl: './tab-course.component.html',
  styleUrl: './tab-course.component.scss',
  providers: [CollapsibleListService],
})
export class TabCourseComponent implements OnInit, OnChanges {
  @Input({ required: true }) course!: Course;
  @Input() canEdit = true;
  @Output() updateSectionList = new EventEmitter<Section[]>();
  @Output() cancelChange = new EventEmitter();

  showAddTopicDialog = false;
  selectedSectionId = '';
  showUpdateImageDialog = false;
  loadingToUpdateSection = false;
  loadingToAddSection = false;
  sections: Section[] = [];

  constructor(
    private collapsibleListService: CollapsibleListService,
    private toastr: ToastrService,
    private topicService: TopicService,
    private courseService: CourseService
  ) {}

  ngOnInit(): void {
    this.InitData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['course'] && changes['course'].currentValue) {
      this.course = changes['course'].currentValue;
      this.InitData();
    }
  }

  InitData() {
    this.collapsibleListService.setCanEdit(this.canEdit);
    const ids = this.course.sections.map((s) => s.id);
    this.collapsibleListService.setSectionIds(ids);
    this.sections = this.course.sections
      .map((s) => s)
      .sort((a, b) => a.position - b.position);
    console.log('Initialized sections: ', this.sections);
  }

  onCopyCourseId() {
    navigator.clipboard.writeText(this.course.id).then(() => {
      this.toastr.success('Copied to clipboard');
    });
  }
  onCustomizeCourse() {
    this.showUpdateImageDialog = true;
  }

  isEditingSection(id: string): boolean {
    return this.collapsibleListService.isEditingSection(id);
  }

  // Dialog methods
  openAddTopicDialog(sectionId: string) {
    this.selectedSectionId = sectionId;
    this.showAddTopicDialog = true;
  }

  closeAddTopicDialog() {
    this.showAddTopicDialog = false;
    this.selectedSectionId = '';
  }

  closeUpdateImageDialog() {
    this.showUpdateImageDialog = false;
  }

  async onUpdateImage(result: UpdateCourseImageResult) {
    if (result && result.success) {
      try {
        this.course.imageUrl = result.imageUrl;
        await UpdateCourse(this.course);
        this.toastr.success(result.message);
      } catch (error: any) {
        this.toastr.error(error.message || 'Failed to update course image');
      }
    }
  }

  async onAddNewTopic(result: AddTopicDialogResult) {
    const createRequest: CreateTopicRequest = {
      sectionId: result.sectionId,
      type: result.topicType,
    };

    const section = this.course.sections.find(
      (s) => s.id === createRequest.sectionId
    );
    if (!section) return;

    try {
      const newTopic = this.topicService.getNewTopic(createRequest);
      const createdTopic = await CreateTopic(newTopic, this.course.id) as Topic;
      
      const updatedSection = this.courseService.updateSectionByAddingTopic(
        section,
        createdTopic
      );
      const updatedSections =
        this.courseService.updateSectionListByUpdatingSection(
          this.course,
          updatedSection
        );
      this.updateSectionList.emit(updatedSections);
      this.toastr.success('New topic added successfully');
    } catch (error: any) {
      this.toastr.error(error.message || 'Failed to add new topic');
    }
  }

  async onAddNewSection() {
    const newSection = this.courseService.getNewSection(this.course);
    this.loadingToAddSection = true;
    await CreateSection(newSection)
      .then((res) => {
        this.updateSectionList.emit([...this.course.sections, res]);
        this.toastr.success('New section added successfully');
      })
      .catch((error) => {
        this.toastr.error(error.message);
      })
      .finally(() => {
        this.loadingToAddSection = false;
      });
  }

  async handleUpdateSectionSuccess(sectionId: string) {
    await GetSection(sectionId)
      .then((section) => {
        const updatedSections =
          this.courseService.updateSectionListByUpdatingSection(
            this.course,
            section
          );
        this.updateSectionList.emit(updatedSections);
        this.toastr.success('Section updated successfully');
      })
      .finally(() => {
        console.log(this.collapsibleListService.getAllStates());
      });
  }

  async updateSection(sectionId: string) {
    const section = this.course.sections.find((s) => s.id === sectionId);
    if (!section) {
      this.toastr.error('Section not found');
      return;
    }
    this.loadingToUpdateSection = true;
    console.log('Updating section: ', section);
    await UpdateSection(section)
      .then((updatedSection) => {
        this.handleUpdateSectionSuccess(updatedSection.id);
      })
      .catch((error) => {
        this.toastr.error(error.message);
      })
      .finally(() => {
        this.loadingToUpdateSection = false;
      });
  }

  onCancelChange() {
    this.cancelChange.emit();
  }

  onUpdateSectionTitle(sectionId: string, newTitle: string) {
    const updatedSection = this.sections.map((section) => {
      if (section.id === sectionId) {
        return { ...section, title: newTitle };
      }
      return section;
    });
    this.updateSectionList.emit(updatedSection);
  }

  async onDeleteTopic(topicId: string, sectionId: string) {
    const section = this.course.sections.find((s) => s.id === sectionId);
    if (!section) return;

    try {
      await DeleteTopic(topicId, this.course.id);
      const updatedSection = this.courseService.updateSectionByDeletingTopic(
        section,
        topicId
      );
      const updatedSections =
        this.courseService.updateSectionListByUpdatingSection(
          this.course,
          updatedSection
        );
      this.updateSectionList.emit(updatedSections);
      this.toastr.success('Topic deleted successfully');
    } catch (error: any) {
      this.toastr.error(error.message || 'Failed to delete topic');
    }
  }
}
