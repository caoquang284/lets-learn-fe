import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { FileTopic } from '@shared/models/topic';

@Component({
  selector: 'tab-file',
  standalone: false,
  templateUrl: './tab-file.component.html',
  styleUrls: ['./tab-file.component.scss'],
})
export class TabFileComponent implements OnInit, OnChanges {
  @Input({ required: true }) topic!: FileTopic;

  hasFile: boolean = false;
  fileUrl: string | null = null;
  fileName: string | null = null;

  constructor() {}
  ngOnInit(): void {
    // Get file from topic data
    this.fileUrl =
      this.topic?.data?.file?.downloadUrl ||
      this.topic?.data?.file?.displayUrl ||
      null;
    this.fileName = this.topic?.data?.file?.name || null;
    this.hasFile = !!this.fileUrl;
  }

  ngOnChanges(): void {
    // Update when topic changes
    this.fileUrl =
      this.topic?.data?.file?.downloadUrl ||
      this.topic?.data?.file?.displayUrl ||
      null;
    this.fileName = this.topic?.data?.file?.name || null;
    this.hasFile = !!this.fileUrl;
  }
}
