import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabDoneComponent } from './tab-done.component';

describe('TabDoneComponent', () => {
  let component: TabDoneComponent;
  let fixture: ComponentFixture<TabDoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabDoneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabDoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
