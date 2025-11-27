import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import {
  MatDatetimepickerModule,
  MatNativeDatetimeModule,
} from '@mat-datetimepicker/core';
import { ButtonComponent } from './button/button.component';
import { CardComponent } from './card/card.component';
import { CircleImageComponent } from './circle-image/circle-image.component';
import { CollapsibleListComponent } from './collapsible-list/collapsible-list.component';
import { CollapsibleSectionComponent } from './collapsible-section/collapsible-section.component';
import { ComboboxComponent } from './combobox/combobox.component';
import { ConfirmMessageComponent } from './confirm-message/confirm-message.component';
import { DateTimePickerComponent } from './date-time-picker/date-time-picker.component';
import { FormInputComponent } from './form-input/form-input.component';
import { FormButtonComponent } from './form-button/form-button.component';
import { FormWarningComponent } from './form-warning/form-warning.component';
import { HeaderComponent } from './header/header.component';
import { LayoutComponent } from './layout/layout.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TabListComponent } from './tab-list/tab-list.component';
import { TopicPageLayoutComponent } from './topic-page-layout/topic-page-layout.component';
import { TopicComponent } from './topic/topic.component';

import { RouterOutlet } from '@angular/router';
import { CommentInputComponent } from './comment-list/comment-input/comment-input.component';
import { CommentListComponent } from './comment-list/comment-list.component';
import { CommentComponent } from './comment-list/comment/comment.component';
import { ConfirmMessageContentComponent } from './confirm-message/confirm-message-content/confirm-message-content.component';
import { DonutChartComponent } from './charts/donut-chart/donut-chart.component';
import { DropdownComponent } from './dropdown/dropdown.component';
import { FormFieldComponent } from './form-field/form-field.component';
import { SettingRowComponent } from './setting-row/setting-row.component';
import { SidebarGroupComponent } from './sidebar/sidebar-group/sidebar-group.component';
import { SidebarItemCollapseComponent } from './sidebar/sidebar-item-collapse/sidebar-item-collapse.component';
import { SidebarItemComponent } from './sidebar/sidebar-item/sidebar-item.component';
import { TabComponent } from './tab-list/tab/tab.component';
import { TimerComponent } from './timer/timer.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { RankLogoComponent } from './ranking/rank-logo/rank-logo.component';
import { RankAComponent } from './ranking/rank-logo/rank-a.component';
import { RankBComponent } from './ranking/rank-logo/rank-b.component';
import { RankCComponent } from './ranking/rank-logo/rank-c.component';
import { RankSComponent } from './ranking/rank-logo/rank-s.component';
import { RankItemComponent } from './ranking/rank-item/rank-item.component';
import { ColorItemComponent } from './ranking/color-item/color-item.component';
import { StatCardComponent } from './stat-card/stat-card.component';
import { MatIconModule } from '@angular/material/icon';
import { LineChartComponent } from './charts/line-chart/line-chart.component';
import { BarChartComponent } from './charts/bar-chart/bar-chart.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { PopoverComponent } from './popover/popover.component';
import { AccountPopoverComponent } from './header/account-popover/account-popover.component';
import { AlertComponent } from './alert/alert.component';
import { RichTextEditorComponent } from './rich-text-editor/rich-text-editor.component';
import { NgxEditorModule } from 'ngx-editor';

@NgModule({
  declarations: [
    ButtonComponent,
    CardComponent,
    CircleImageComponent,
    CollapsibleListComponent,
    CollapsibleSectionComponent,
    ComboboxComponent,
    FormWarningComponent,
    ConfirmMessageComponent,
    ConfirmMessageContentComponent,
    DateTimePickerComponent,
    FormInputComponent,
    FormButtonComponent,
    HeaderComponent,
    LayoutComponent,
    SidebarComponent,
    SidebarItemCollapseComponent,
    SidebarItemComponent,
    SidebarGroupComponent,
    TabComponent,
    TabListComponent,
    TimerComponent,
    TopicComponent,
    TopicPageLayoutComponent,
    FormFieldComponent,
    SettingRowComponent,
    CommentListComponent,
    CommentInputComponent,
    CommentComponent,
    DropdownComponent,
    DonutChartComponent,
    LineChartComponent,
    BarChartComponent,
    BreadcrumbComponent,
    FileUploadComponent,
    RankLogoComponent,
    RankAComponent,
    RankBComponent,
    RankCComponent,
    RankSComponent,
    RankItemComponent,
    ColorItemComponent,
    StatCardComponent,
    PopoverComponent,
    AccountPopoverComponent,
    AlertComponent,
    RichTextEditorComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    MatDatepickerModule,
    MatMomentDateModule,
    MatDatetimepickerModule,
    MatNativeDatetimeModule,
    RouterOutlet,
    MatExpansionModule,
    MatCheckboxModule,
    FormsModule,
    MatIconModule,
    OverlayModule,
    NgxEditorModule,
  ],
  exports: [
    FormWarningComponent,
    FormInputComponent,
    FormButtonComponent,
    CardComponent,
    MatCheckboxModule,
    HeaderComponent,
    SidebarComponent,
    MatExpansionModule,
    LayoutComponent,
    CircleImageComponent,
    ButtonComponent,
    ComboboxComponent,
    TabListComponent,
    CollapsibleSectionComponent,
    TopicComponent,
    CollapsibleListComponent,
    TopicPageLayoutComponent,
    DateTimePickerComponent,
    ConfirmMessageComponent,
    TimerComponent,
    TabComponent,
    FormFieldComponent,
    SettingRowComponent,
    CommentListComponent,
    CommentInputComponent,
    DropdownComponent,
    DonutChartComponent,
    BarChartComponent,
    LineChartComponent,
    FileUploadComponent,
    RankLogoComponent,
    RankAComponent,
    RankBComponent,
    RankCComponent,
    RankSComponent,
    RankItemComponent,
    ColorItemComponent,
    StatCardComponent,
    PopoverComponent,
    AccountPopoverComponent,
    AlertComponent,
    RichTextEditorComponent,
  ],
})
export class SharedComponentsModule {}
