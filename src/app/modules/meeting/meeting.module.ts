import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { SharedComponentsModule } from '@shared/components/shared-components.module';
import { SharedModule } from '@shared/shared.module';
import { MeetingPageComponent } from './components/meeting-page/meeting-page.component';
import { TabMeetingComponent } from './components/meeting-page/meeting-tabs/tab-meeting/tab-meeting.component';
import { TabSettingComponent } from './components/meeting-page/meeting-tabs/tab-setting/tab-setting.component';

@NgModule({
  declarations: [
    MeetingPageComponent, 
    TabMeetingComponent, 
    TabSettingComponent
  ],
  imports: [SharedModule, RouterOutlet, FormsModule, SharedComponentsModule],
  exports: [],
})

export class MeetingModule {}