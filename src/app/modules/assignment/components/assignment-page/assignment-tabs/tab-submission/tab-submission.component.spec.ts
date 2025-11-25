import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabSubmissionComponent } from './tab-submission.component';

describe('TabSubmissionComponent', () => {
  let component: TabSubmissionComponent;
  let fixture: ComponentFixture<TabSubmissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabSubmissionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabSubmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
