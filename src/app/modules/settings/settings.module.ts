import { NgModule } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { SettingsPageComponent } from './components/settings-page/settings-page.component';
import { TabProfileComponent } from './components/settings-page/settings-tabs/tab-profile/tab-profile.component';
import { TabPasswordComponent } from './components/settings-page/settings-tabs/tab-password/tab-password.component';

@NgModule({
  declarations: [
    SettingsPageComponent,
    TabProfileComponent,
    TabPasswordComponent,
  ],
  imports: [
    SharedModule,
    RouterOutlet
  ],
})
export class SettingsModule {}