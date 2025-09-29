import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { SharedComponentsModule } from '@shared/components/shared-components.module';
import { SharedModule } from '@shared/shared.module';
import { FilePageComponent } from './components/file-page/file-page.component';
import { TabFileComponent } from './components/file-page/file-tabs/tab-file/tab-file.component';
import { TabSettingComponent } from './components/file-page/file-tabs/tab-setting/tab-setting.component';

@NgModule({
  declarations: [FilePageComponent,TabFileComponent,TabSettingComponent],
  imports: [SharedModule, RouterOutlet, FormsModule, SharedComponentsModule],
  exports: [],
})

export class FileModule {}

