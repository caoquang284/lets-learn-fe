import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from '@shared/services/dialog.service';
import { QuestionType } from '@shared/models/question';
import { UpdateQuestionDialogContentComponent } from './update-question-dialog-content/update-question-dialog-content.component';
export interface UpdateQuestionDialogData {
  questionType: QuestionType;
}

@Component({
  selector: 'update-question-dialog',
  standalone: false,
  templateUrl: './update-question-dialog.component.html',
  styleUrl: './update-question-dialog.component.scss',
})
export class UpdateQuestionDialogComponent {
  readonly dialog = inject(MatDialog);

  constructor(private dialogService: DialogService<UpdateQuestionDialogData>) {}

  ngOnInit(): void {
    this.dialogService.isOpen$.subscribe((isOpen) => {
      if (isOpen) this.openDialog();
    });
  }

  openDialog(): void {
    this.dialog.open(UpdateQuestionDialogContentComponent);
  }
}
