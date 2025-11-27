import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Editor, Toolbar } from 'ngx-editor';

@Component({
  selector: 'app-rich-text-editor',
  standalone: false,
  templateUrl: './rich-text-editor.component.html',
  styleUrls: ['./rich-text-editor.component.scss'],
})
export class RichTextEditorComponent implements OnInit, OnDestroy {
  @Input() form!: FormGroup;
  @Input() controlName!: string;
  @Input() placeholder: string = '';

  editor!: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic', 'underline', 'strike', 'code'],
    ['blockquote', 'ordered_list', 'bullet_list', 'link', 'image'],
    [
      'text_color',
      'background_color',
      'align_left',
      'align_center',
      'align_right',
      'align_justify',
    ],
    ['undo', 'redo'],
  ];

  ngOnInit(): void {
    this.editor = new Editor();
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }
}
