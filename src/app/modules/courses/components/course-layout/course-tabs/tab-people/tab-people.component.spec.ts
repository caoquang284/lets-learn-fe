import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabPeopleComponent } from './tab-people.component';

describe('TabPeopleComponent', () => {
  let component: TabPeopleComponent;
  let fixture: ComponentFixture<TabPeopleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabPeopleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabPeopleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
