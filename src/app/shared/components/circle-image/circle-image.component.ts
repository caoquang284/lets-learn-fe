import { Component, Input } from '@angular/core';

@Component({
  selector: 'circle-image',
  standalone: false,
  templateUrl: './circle-image.component.html',
  styleUrl: './circle-image.component.scss',
})
export class CircleImageComponent {
  @Input() src: string | null = null;
  @Input() defaultImage: string = 'image';
  @Input() alt: string = 'User avatar';
}
