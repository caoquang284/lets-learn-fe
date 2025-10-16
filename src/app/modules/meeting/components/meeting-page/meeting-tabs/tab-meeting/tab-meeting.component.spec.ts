import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabMeetingComponent } from './tab-meeting.component';

describe('TabMeetingComponent', () => {
  let component: TabMeetingComponent;
  let fixture: ComponentFixture<TabMeetingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TabMeetingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabMeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
