import { Injectable } from '@angular/core';
import {
  ChoiceQuestion,
  Question,
  QuestionChoice,
  QuestionType,
  ShortAnswerQuestion,
  TrueFalseQuestion,
} from '@shared/models/question';

@Injectable({ providedIn: 'root' })
export class QuestionService {
  constructor() {}

  getChoices(question: Question) {
    let choices: QuestionChoice[] = [];
    if (question.type == QuestionType.CHOICE) {
      // Handle both nested data structure and flat structure from API
      const data = question.data as ChoiceQuestion;
      const flatChoices = (question as any).choices;
      if (data?.choices) {
        choices = [...data.choices];
      } else if (flatChoices) {
        choices = [...flatChoices];
      }
    } else if (question.type == QuestionType.SHORT_ANSWER) {
      const data = question.data as ShortAnswerQuestion;
      const flatChoices = (question as any).choices;
      if (data?.choices) {
        choices = [...data.choices];
      } else if (flatChoices) {
        choices = [...flatChoices];
      }
    }

    return choices;
  }

  convertToHashAnswer(question: Question, answer: string | string[]): string {
    if (question.type === QuestionType.CHOICE) {
      // Handle both nested data structure and flat structure from API
      const data = question.data as ChoiceQuestion;
      const flatMultiple = (question as any).multiple;
      const flatChoices = (question as any).choices;
      
      const choices = data?.choices || flatChoices || [];
      const multiple = data?.multiple ?? flatMultiple ?? false;
      
      const choiceQuestion: ChoiceQuestion = { choices, multiple };
      
      if (multiple) {
        answer = answer as string[];
        return this.convertMultipleChoiceAnswerToHashAnswer(choiceQuestion, answer);
      }
      return this.convertSingleChoiceAnswerToHashAnswer(choiceQuestion, answer as string);
    }
    return answer as string;
  }
  parseFromHashAnswer(question: Question, answer: string): string | string[] {
    if (question.type === QuestionType.CHOICE) {
      // Handle both nested data structure and flat structure from API
      const data = question.data as ChoiceQuestion;
      const flatMultiple = (question as any).multiple;
      const flatChoices = (question as any).choices;
      
      const choices = data?.choices || flatChoices || [];
      const multiple = data?.multiple ?? flatMultiple ?? false;
      
      const choiceQuestion: ChoiceQuestion = { choices, multiple };
      
      if (multiple) {
        return this.parseMultipleChoiceAnswerFromHashAnswer(choiceQuestion, answer);
      }
      return this.parseSingleChoiceAnswerFromHashAnswer(choiceQuestion, answer);
    }
    return answer;
  }

  convertSingleChoiceAnswerToHashAnswer(
    question: ChoiceQuestion,
    choiceId: string
  ): string {
    const choices = question.choices;
    const index = choices.findIndex((choice) => choice.id === choiceId);
    if (index === -1) return '';
    return index.toString();
  }
  parseSingleChoiceAnswerFromHashAnswer(
    question: ChoiceQuestion,
    answer: string
  ): string {
    if (!answer) return '';
    const choices = question.choices;
    const index = parseInt(answer, 10);
    if (isNaN(index) || index < 0 || index >= choices.length) return '';
    return choices[index].id;
  }
  convertMultipleChoiceAnswerToHashAnswer(
    question: ChoiceQuestion,
    choiceIds: string[]
  ): string {
    const choices = question.choices;
    let res = '';
    choices.forEach((choice) => {
      const isSelected = choiceIds.includes(choice.id);
      res += isSelected ? '1' : '0';
    });
    return res;
  }
  parseMultipleChoiceAnswerFromHashAnswer(
    question: ChoiceQuestion,
    answer: string
  ): string[] {
    const choices = question.choices;
    const res: string[] = [];
    for (let i = 0; i < choices.length; i++) {
      if (answer[i] === '1') {
        res.push(choices[i].id);
      }
    }
    return res;
  }

  getMultipleChoiceQuestionMark = (question: Question, choiceIds: string[]) => {
    let markPercent = 0;
    const choices = this.getChoices(question);

    choices.forEach((choice) => {
      if (choiceIds.includes(choice.id)) markPercent += choice.gradePercent;
    });

    return Math.round(question.defaultMark * (markPercent / 100));
  };
  getSingleChoiceQuestionMark = (question: Question, choiceId: string) => {
    const choices = this.getChoices(question);
    const choice = choices.find((c) => c.id === choiceId);
    if (!choice) return 0;
    return Math.round(question.defaultMark * (choice.gradePercent / 100));
  };
  getShortAnswerQuestionMark = (question: Question, answer: string) => {
    const choices = this.getChoices(question);
    const choice = choices.find((c) => c.text === answer);
    if (!choice) return 0;
    return Math.round(question.defaultMark * (choice.gradePercent / 100));
  };
  getTrueFalseQuestionMark = (question: Question, answer: string) => {
    if (answer !== '1' && answer !== '0') return 0;
    const data = question.data as TrueFalseQuestion;
    if (!data) return 0;
    const correctAnswer = data.correctAnswer;
    const userAnswer = answer === '1';
    return userAnswer === correctAnswer ? question.defaultMark : 0;
  };

  getQuestionMark = (question: Question, answer: string | string[]) => {
    if (question.type === QuestionType.CHOICE) {
      // Handle both nested data structure and flat structure from API
      const data = question.data as ChoiceQuestion;
      const flatMultiple = (question as any).multiple;
      const multiple = data?.multiple ?? flatMultiple ?? false;
      
      if (multiple) {
        return this.getMultipleChoiceQuestionMark(question, answer as string[]);
      } else {
        return this.getSingleChoiceQuestionMark(question, answer as string);
      }
    } else if (question.type === QuestionType.SHORT_ANSWER) {
      return this.getShortAnswerQuestionMark(question, answer as string);
    } else if (question.type === QuestionType.TRUE_FALSE) {
      return this.getTrueFalseQuestionMark(question, answer as string);
    }
    return 0;
  };
}
