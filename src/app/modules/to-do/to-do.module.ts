import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SharedComponentsModule } from '@shared/components/shared-components.module';
import { SharedModule } from '@shared/shared.module';
import { ToDoPageComponent } from './components/to-do-page/to-do-page.component';
import { TabAssignedComponent } from './components/to-do-page/to-do-tabs/tab-assigned/tab-assigned.component';
import { TabOverdueComponent } from './components/to-do-page/to-do-tabs/tab-overdue/tab-overdue.component';
import { TabDoneComponent } from './components/to-do-page/to-do-tabs/tab-done/tab-done.component';
import { ToDoService } from './components/to-do-page/to-do.service';

const routes: Routes = [
  { path: '', component: ToDoPageComponent },
];

@NgModule({
  declarations: [
    ToDoPageComponent,
    TabAssignedComponent,
    TabOverdueComponent,
    TabDoneComponent
  ],
  imports: [
    SharedModule, 
    FormsModule, 
    SharedComponentsModule,
    RouterModule.forChild(routes)
  ],
  providers: [ToDoService],
  exports: [RouterModule],
})
export class ToDoModule {}
