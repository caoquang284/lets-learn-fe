import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabCourseComponent } from './tab-course.component';

describe('TabCourseComponent', () => {
  let component: TabCourseComponent;
  let fixture: ComponentFixture<TabCourseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabCourseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
