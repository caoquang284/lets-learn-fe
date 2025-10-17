import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MeetingRoomComponent } from '@modules/meeting/components/meeting-room/meeting-room.component';

const routes: Routes = [
  {
    path: ':topicId/room',
    component: MeetingRoomComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MeetingRoomRoutingModule {}
