import { Component } from '@angular/core';
import { Comment } from '@shared/models/comment';

@Component({
  selector: 'comment-list',
  standalone: false,
  templateUrl: './comment-list.component.html',
  styleUrl: './comment-list.component.scss',
})
export class CommentListComponent {
  comments: Comment[] = [];
}
