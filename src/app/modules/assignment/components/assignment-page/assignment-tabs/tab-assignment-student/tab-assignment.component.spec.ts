import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabAssignmentComponent } from './tab-assignment.component';

describe('TabAssignmentComponent', () => {
  let component: TabAssignmentComponent;
  let fixture: ComponentFixture<TabAssignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabAssignmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
