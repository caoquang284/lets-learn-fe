import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEditorModule } from 'ngx-editor';

@NgModule({
  imports: [CommonModule, NgxEditorModule],
  exports: [NgxEditorModule],
})
export class MeetingRichTextModule {}
