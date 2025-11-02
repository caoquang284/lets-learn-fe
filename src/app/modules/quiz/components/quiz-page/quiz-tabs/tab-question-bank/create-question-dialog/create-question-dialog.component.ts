import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from '@shared/services/dialog.service';
import { CreateQuestionDialogContentComponent } from './create-question-dialog-content/create-question-dialog-content.component';
import { QuestionType } from '@shared/models/question';

export interface CreateQuestionDialogData {
  questionType: QuestionType;
}

@Component({
  selector: 'create-question-dialog',
  standalone: false,
  templateUrl: './create-question-dialog.component.html',
  styleUrl: './create-question-dialog.component.scss',
})
export class CreateQuestionDialogComponent {
  readonly dialog = inject(MatDialog);

  constructor(private dialogService: DialogService<CreateQuestionDialogData>) {}

  ngOnInit(): void {
    this.dialogService.isOpen$.subscribe((isOpen) => {
      if (isOpen) this.openDialog();
    });
  }

  openDialog(): void {
    this.dialog.open(CreateQuestionDialogContentComponent);
  }
}
