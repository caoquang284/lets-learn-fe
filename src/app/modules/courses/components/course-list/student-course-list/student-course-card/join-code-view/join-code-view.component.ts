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

@Component({
  selector: 'join-code-view',
  standalone: false,
  templateUrl: './join-code-view.component.html',
  styleUrl: './join-code-view.component.scss',
})
export class JoinCodeViewComponent implements OnInit, OnChanges {
  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();
  @Output() submitCode = new EventEmitter<string>();

  @ViewChild('inputRef') inputRef!: ElementRef<HTMLInputElement>;

  constructor() {
    if (this.open) {
      console.log(
        'JoinCodeViewComponent initialized with open state:',
        this.open
      );
    } else {
      console.log('JoinCodeViewComponent initialized with closed state');
    }
  }

  ngOnInit(): void {
    if (this.open) {
      console.log(
        'JoinCodeViewComponent initialized with open state:',
        this.open
      );
    } else {
      console.log('JoinCodeViewComponent initialized with closed state');
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['open']) {
      console.log('previous open value:', changes['open'].previousValue);
      console.log('open changed:', changes['open'].currentValue);
    }
  }

  handleClose() {
    this.openChange.emit(false);
  }

  onSubmit(e: Event) {
    e.preventDefault();
    const code = this.inputRef?.nativeElement?.value?.trim();
    if (code) {
      this.submitCode.emit(code);
    }
    this.inputRef.nativeElement.value = '';
    this.openChange.emit(false);
  }
}
