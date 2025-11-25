import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmittedViewComponent } from './submitted-view.component';

describe('SubmittedViewComponent', () => {
  let component: SubmittedViewComponent;
  let fixture: ComponentFixture<SubmittedViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmittedViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmittedViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
