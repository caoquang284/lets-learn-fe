import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { SharedComponentsModule } from '@shared/components/shared-components.module';
import { SharedModule } from '@shared/shared.module';
import { PagePageComponent } from './components/page-page/page-page.component';
import { TabPageComponent } from './components/page-page/page-tabs/tab-page/tab-page.component';
import { TabSettingComponent } from './components/page-page/page-tabs/tab-setting/tab-setting.component';

@NgModule({
  declarations: [PagePageComponent, TabPageComponent, TabSettingComponent],
  imports: [SharedModule, RouterOutlet, FormsModule, SharedComponentsModule],
  exports: [],
})
export class PageModule {}
