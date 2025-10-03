import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabPasswordComponent } from './tab-password.component';

describe('TabPasswordComponent', () => {
  let component: TabPasswordComponent;
  let fixture: ComponentFixture<TabPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabPasswordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
