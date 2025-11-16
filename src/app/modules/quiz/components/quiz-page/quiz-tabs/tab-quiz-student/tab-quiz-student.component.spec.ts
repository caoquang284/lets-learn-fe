import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabQuizStudentComponent } from './tab-quiz-student.component';

describe('TabQuizStudentComponent', () => {
  let component: TabQuizStudentComponent;
  let fixture: ComponentFixture<TabQuizStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabQuizStudentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabQuizStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
