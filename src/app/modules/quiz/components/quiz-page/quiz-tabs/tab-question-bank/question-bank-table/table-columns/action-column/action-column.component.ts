import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DropdownOption } from '@shared/components/dropdown/dropdown.component';
import { QuestionElement } from '../../question-bank-table.component';
import { openAlertDialog } from '@shared/helper/alert.helper';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionType } from '@shared/models/question';

@Component({
  selector: 'action-column',
  standalone: false,
  templateUrl: './action-column.component.html',
  styleUrl: './action-column.component.scss',
})
export class ActionColumnComponent implements OnInit {
  @Input({ required: true }) rowData!: QuestionElement;
  @Output() addToQuiz = new EventEmitter<string>();
  courseId: string = '';
  rowOptions: DropdownOption[] = [
    {
      label: 'Edit',
      value: 'edit',
    },
    {
      label: 'Add to Quiz',
      value: 'add-to-quiz',
    },
  ];

  constructor(
    private toastr: ToastrService,
    private dialog: MatDialog,
    private router: Router,
    private activedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.courseId = this.activedRoute.snapshot.paramMap.get('courseId') || '';
  }

  onEditRow(id: string): void {
    let type = 'choice';
    if (this.rowData.type === QuestionType.CHOICE) {
      type = 'true_false';
    } else if (this.rowData.type === QuestionType.TRUE_FALSE) {
      type = 'short_answer';
    }
    this.router.navigate([
      `courses/${this.courseId}/question/${type}/${id}/edit`,
    ]);
  }

  async onDeleteRow(id: string): Promise<void> {
    const confirmed = await openAlertDialog(
      this.dialog,
      'Delete Question',
      'Are you sure you want to delete this question?',
      'Delete',
      'Cancel',
      true
    );
    if (confirmed) {
      this.toastr.success('Delete action confirmed', 'Success');
    }
  }

  onAddToQuiz(id: string) {
    this.addToQuiz.emit(id);
  }

  onDropdownSelect(option: DropdownOption): void {
    if (option.value === 'edit') {
      this.onEditRow(this.rowData.id);
    }
    if (option.value === 'delete') {
      this.onDeleteRow(this.rowData.id);
    }
    if (option.value === 'add-to-quiz') {
      this.onAddToQuiz(this.rowData.id);
    }
  }
}
