import { Component, inject, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CollapsibleListService } from '@shared/components/collapsible-list/collapsible-list.service';
import { Course, Section } from '@shared/models/course';
import { Topic } from '@shared/models/topic';
import { ToastrService } from 'ngx-toastr';
import { AddTopicDialogResult } from '../../../add-topic-dialog/add-topic-dialog.component';
import { UpdateCourseImageResult } from '../../../update-course-image-dialog/update-course-image-dialog.component';
import { CreateTopicRequest, TopicService } from '@shared/services/topic.service';
import { CreateTopic } from '@modules/courses/api/topic.api';
import { CourseService } from '@shared/services/course.service';
import { UpdateCourse } from '@modules/courses/api/courses.api';

@Component({
  selector: 'tab-course',
  standalone: false,
  templateUrl: './tab-course.component.html',
  styleUrl: './tab-course.component.scss',
  providers: [CollapsibleListService],
})
export class TabCourseComponent implements OnInit {
  @Input({ required: true }) course!: Course;
  @Input() canEdit = true;
  @Output() updateSectionList = new EventEmitter<Section[]>();
  edittingSectionIds: string[] = [];

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
    this.collapsibleListService.setCanEdit(this.canEdit);
    const ids = this.course.sections.map((s) => s.id);
    this.collapsibleListService.setSectionIds(ids);
    this.collapsibleListService.editingSectionIds$.subscribe((ids) => {
      this.edittingSectionIds = ids;
    });
  }

  onCopyCourseId() {
    navigator.clipboard.writeText(this.course.id).then(() => {
      this.toastr.success('Copied to clipboard');
    });
  }

  isEditingSection(id: string): boolean {
    return this.edittingSectionIds.includes(id);
  }

  addTopic(sectionId: string, topic: Topic) {
    const currentSection = this.course.sections.find(
      (section) => section.id === sectionId
    );
    if (!currentSection) return;

    const updatedSection: Section = {
      ...currentSection,
      topics: [...currentSection.topics, topic],
    };

    this.course.sections = this.course.sections.map((section) =>
      section.id === updatedSection.id ? updatedSection : section
    );
  }

  openAddTopicDialog(sectionId: string) {
    this.selectedSectionId = sectionId;
    this.showAddTopicDialog = true;
  }

  closeAddTopicDialog() {
    this.showAddTopicDialog = false;
    this.selectedSectionId = '';
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
}