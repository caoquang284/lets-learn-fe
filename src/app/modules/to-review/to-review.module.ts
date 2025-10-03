import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SharedComponentsModule } from '@shared/components/shared-components.module';
import { SharedModule } from '@shared/shared.module';
import { ToReviewPageComponent } from './components/to-review-page/to-review-page.component';
import { ToReviewService } from './components/to-review-page/to-review.service';

const routes: Routes = [
  { path: '', component: ToReviewPageComponent },
];

@NgModule({
  declarations: [ToReviewPageComponent],
  imports: [
    SharedModule, 
    FormsModule, 
    SharedComponentsModule,
    RouterModule.forChild(routes)
  ],  providers: [
    ToReviewService
  ],
  exports: [RouterModule],
})
export class ToReviewModule {}
