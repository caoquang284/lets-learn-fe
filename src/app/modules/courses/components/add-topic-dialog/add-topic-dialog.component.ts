import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  TopicType,
  TopicTypeOption,
  getTopicTypeOptions,
  getActivityTopicOptions,
  getResourceTopicOptions,
  activityTopics,
  resourceTopics,
} from '@shared/models/topic';

export interface AddTopicDialogResult {
  topicType: TopicType;
  sectionId: string;
}

@Component({
  selector: 'app-add-topic-dialog',
  standalone: false,
  templateUrl: './add-topic-dialog.component.html',
  styleUrl: './add-topic-dialog.component.scss',
})
export class AddTopicDialogComponent {
  @Input() show = false;
  @Input() sectionId = '';
  @Output() closeDialog = new EventEmitter<void>();
  @Output() addTopic = new EventEmitter<AddTopicDialogResult>();

  selectedTopicType: TopicType | null = null;
  selectedTab: 'all' | 'activities' | 'resources' = 'all';
  topicTypes: TopicTypeOption[] = getTopicTypeOptions();

  activityTypes = activityTopics;
  resourceTypes = resourceTopics;

  get filteredTopicTypes(): TopicTypeOption[] {
    switch (this.selectedTab) {
      case 'activities':
        return this.topicTypes.filter((t) =>
          this.activityTypes.includes(t.type)
        );
      case 'resources':
        return this.topicTypes.filter((t) =>
          this.resourceTypes.includes(t.type)
        );
      default:
        return this.topicTypes;
    }
  }

  selectTab(tab: 'all' | 'activities' | 'resources') {
    this.selectedTab = tab;
    if (
      this.selectedTopicType &&
      !this.filteredTopicTypes.find((t) => t.type === this.selectedTopicType)
    ) {
      this.selectedTopicType = null;
    }
  }

  selectTopicType(topicType: TopicType) {
    this.selectedTopicType = topicType;
  }
  onClose() {
    this.selectedTopicType = null;
    this.selectedTab = 'all';
    this.closeDialog.emit();
  }

  onAddTopic() {
    if (!this.selectedTopicType || !this.sectionId) return;

    this.addTopic.emit({
      topicType: this.selectedTopicType,
      sectionId: this.sectionId,
    });

    this.onClose();
  }
}
