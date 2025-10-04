import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'joining-code-card',
  standalone: false,
  templateUrl: './joining-code-card.component.html',
  styleUrl: './joining-code-card.component.scss',
})
export class JoiningCodeComponent {
  @Input() disabled = false;
  @Output() submitCode = new EventEmitter<string>();

  isOpen = false;

  handleOpenChange(open: boolean) {
    this.isOpen = open;
  }

  handleSubmitCode(code: string) {
    this.submitCode.emit(code);
  }
}
