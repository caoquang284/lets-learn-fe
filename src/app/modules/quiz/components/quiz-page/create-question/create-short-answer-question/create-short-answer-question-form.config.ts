import { FormControlField } from '@shared/helper/form.helper';
import { QuestionStatus } from '@shared/models/question';
import { getGradePercentComboboxOption } from './create-short-answer-question-form.util';

export const createShortAnswerQuestionGeneralFormControls: FormControlField[] =
  [
    {
      id: 'questionName',
      label: 'Question name',
      type: 'text',
      componentType: 'input',
      placeholder: 'E.g. Is the sky blue?',
      validationMessages: {
        required: 'Question name is required',
        minlength: 'Question name must be at least 2 characters',
      },
    },
    {
      id: 'questionText',
      label: 'Question text',
      type: 'text',
      componentType: 'richtext',
      placeholder: 'E.g. Is the sky blue?',
      validationMessages: {
        required: 'Question text is required',
        minlength: 'Question text must be at least 2 characters',
      },
    },
    {
      id: 'status',
      label: 'Question status',
      type: 'text',
      componentType: 'select',
      placeholder: '',
      options: [
        { label: QuestionStatus.READY, value: QuestionStatus.READY },
        { label: QuestionStatus.DRAFT, value: QuestionStatus.DRAFT },
      ],
      descriptionOnOption: {
        [QuestionStatus.READY]: 'Ready to use in quizzes',
        [QuestionStatus.DRAFT]: 'Draft, not ready to use in quizzes',
      },
      validationMessages: {},
    },
    {
      id: 'defaultMark',
      label: 'Default mark',
      type: 'number',
      componentType: 'input',
      placeholder: 'E.g. 1',
      validationMessages: {
        required: 'Default mark is required',
        min: 'Default mark must be at least 0',
      },
    },
  ];
export const getShortAnswerQuestionAnswerFormControls = (
  index: number
): FormControlField[] => {
  return [
    {
      id: 'text',
      label: `Answer ${index + 1}`,
      type: 'text',
      componentType: 'input',
      placeholder: 'Enter an acceptable answer',
      validationMessages: {
        required: 'Answer text is required',
        minlength: 'Answer text must be at least 1 character',
      },
    },
    {
      id: 'gradePercent',
      label: 'Grade percent',
      type: 'text',
      componentType: 'select',
      placeholder: '',
      options: getGradePercentComboboxOption(),
      validationMessages: {},
    },
    {
      id: 'feedback',
      label: 'Feedback',
      type: 'text',
      componentType: 'richtext',
      placeholder: 'Tiny editor content',
      validationMessages: {},
    },
  ];
};

export const getShortAnswersQuestionAnswersFormControls = (
  numberOfChoices: number
): FormControlField[][] => {
  return Array.from({ length: numberOfChoices }, (_, index) =>
    getShortAnswerQuestionAnswerFormControls(index)
  );
};
