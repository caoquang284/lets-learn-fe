import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'join-code-button',
  standalone: false,
  templateUrl: './join-code-button.component.html',
  styleUrl: './join-code-button.component.scss',
})
export class JoinCodeButtonComponent {
  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();

  handleClick() {
    this.openChange.emit(true);
  }
}
