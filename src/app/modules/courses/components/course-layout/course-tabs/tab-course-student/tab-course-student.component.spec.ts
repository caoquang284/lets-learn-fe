import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabCourseStudentComponent } from './tab-course-student.component';

describe('TabCourseStudentComponent', () => {
  let component: TabCourseStudentComponent;
  let fixture: ComponentFixture<TabCourseStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabCourseStudentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabCourseStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
