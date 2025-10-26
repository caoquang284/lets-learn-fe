import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { CdkConnectedOverlay } from '@angular/cdk/overlay';

@Component({
  selector: 'app-popover',
  standalone: false,
  templateUrl: './popover.component.html',
  styleUrl: './popover.component.scss',
})
export class PopoverComponent {
  @Input() isOpen = false;
  @Output() openChange = new EventEmitter<boolean>();
  @ViewChild('connectedOverlay') overlayDir?: CdkConnectedOverlay;

  constructor(private _eref: ElementRef) {}

  onTriggerClick() {
    this.openChange.emit(!this.isOpen);
    this.isOpen = !this.isOpen;
  }
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.isOpen) {
      return;
    }

    const overlayElement = this.overlayDir?.overlayRef?.overlayElement;
    const isInsideHost = this._eref.nativeElement.contains(event.target);
    const isInsideOverlay =
      overlayElement?.contains(event.target as Node) ?? false;

    if (isInsideHost || isInsideOverlay) {
      return;
    }

    this.isOpen = false;
    this.openChange.emit(false);
  }
}
