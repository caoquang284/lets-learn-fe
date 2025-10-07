import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabAssignedComponent } from './tab-assigned.component';

describe('TabAssignedComponent', () => {
  let component: TabAssignedComponent;
  let fixture: ComponentFixture<TabAssignedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabAssignedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabAssignedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
