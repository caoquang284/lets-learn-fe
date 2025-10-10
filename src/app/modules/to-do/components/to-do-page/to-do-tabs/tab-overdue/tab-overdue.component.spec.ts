import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabOverdueComponent } from './tab-overdue.component';

describe('TabOverdueComponent', () => {
  let component: TabOverdueComponent;
  let fixture: ComponentFixture<TabOverdueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabOverdueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabOverdueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
