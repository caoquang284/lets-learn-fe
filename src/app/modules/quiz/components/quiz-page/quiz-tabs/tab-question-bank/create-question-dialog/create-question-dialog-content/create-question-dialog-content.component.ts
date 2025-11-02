import { Component, inject, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DialogService } from '@shared/services/dialog.service';
import { CreateQuestionDialogData } from '../create-question-dialog.component';
import { QuestionType } from '@shared/models/question';
import {
  questionIconMap,
  questionTypeDescriptionMap,
} from '@modules/quiz/constants/quiz.constant';

@Component({
  selector: 'create-question-dialog-content',
  standalone: false,
  templateUrl: './create-question-dialog-content.component.html',
  styleUrl: './create-question-dialog-content.component.scss',
})
export class CreateQuestionDialogContentComponent implements OnInit {
  readonly dialogRef = inject(
    MatDialogRef<CreateQuestionDialogContentComponent>
  );
  private dialogService = inject(DialogService<CreateQuestionDialogData>);

  questionTypes: QuestionType[] = [
    QuestionType.CHOICE,
    QuestionType.TRUE_FALSE,
    QuestionType.SHORT_ANSWER,
  ];
  selectedQuestionType: QuestionType = QuestionType.CHOICE;

  constructor() {
    this.dialogService.isClosed$.subscribe((isClosed) => {
      if (isClosed) this.closeDialog('');
    });
  }

  ngOnInit(): void {
    this.dialogService.setData({ questionType: this.selectedQuestionType });
  }

  closeDialog(result: any) {
    this.dialogRef.close(result);
  }

  onCancel(): void {
    this.dialogService.onCancel();
  }

  onConfirm(): void {
    this.dialogService.onConfirm();
  }

  selectQuestionType(questionType: QuestionType): void {
    this.selectedQuestionType = questionType;
    this.dialogService.setData({ questionType });
  }

  getIconKey(type: QuestionType) {
    return questionIconMap[type];
  }

  getQuestionTypeDescription(type: QuestionType): string {
    return questionTypeDescriptionMap[type] || '';
  }
}
