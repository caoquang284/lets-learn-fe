import { Component, Input, OnInit } from '@angular/core';
import { StudentResponseService } from '@shared/services/student-response.service';
import { PageTopic } from '@shared/models/topic';

@Component({
  selector: 'tab-page',
  standalone: false,
  templateUrl: './tab-page.component.html',
  styleUrl: './tab-page.component.scss',
  providers: [StudentResponseService],
})
export class TabPageComponent implements OnInit {
  @Input({ required: true }) topic!: PageTopic;

  constructor() {}

  ngOnInit(): void {}
}
