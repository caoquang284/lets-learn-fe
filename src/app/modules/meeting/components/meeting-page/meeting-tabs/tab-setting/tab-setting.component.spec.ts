import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabSettingComponent } from './tab-setting.component';

describe('TabSettingComponent', () => {
  let component: TabSettingComponent;
  let fixture: ComponentFixture<TabSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TabSettingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TabSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});