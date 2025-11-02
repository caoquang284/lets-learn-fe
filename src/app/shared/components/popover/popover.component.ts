import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-popover',
  standalone: false,
  templateUrl: './popover.component.html',
  styleUrl: './popover.component.scss',
})
export class PopoverComponent {
  @Input() isOpen = false;
  @Output() openChange = new EventEmitter<boolean>();

  constructor(private _eref: ElementRef) {}

  onTriggerClick() {
    this.openChange.emit(!this.isOpen);
    this.isOpen = !this.isOpen;
  }
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this._eref.nativeElement.contains(event.target)) {
      this.isOpen = false; // close dropdown
    }
  }
}
