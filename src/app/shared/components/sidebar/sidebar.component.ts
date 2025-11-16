import { Component, inject, OnInit } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { CircleImageComponent } from '../circle-image/circle-image.component';
import { LayoutService } from '../layout/layout.service';
import { SidebarGroupComponent } from './sidebar-group/sidebar-group.component';
import { SidebarItemCollapseComponent } from './sidebar-item-collapse/sidebar-item-collapse.component';
import { SidebarItemComponent } from './sidebar-item/sidebar-item.component';
import { GetTeacherCourses } from '@modules/courses/api/courses.api';
import { UserService } from '@shared/services/user.service';
import { Role, User } from '@shared/models/user';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit {
  layoutService = inject(LayoutService);
  userService = inject(UserService);
  isCollapsed = false;
  courses: any[] = [];
  currentUser: User | null = null;
  Role = Role;

  async ngOnInit() {
    this.layoutService.isCollapsed$.subscribe((value) => {
      this.isCollapsed = value;
    });

    this.userService.user$.subscribe(async (user) => {
      this.currentUser = user;
      if (user && user.role === Role.TEACHER) {
        this.courses = await GetTeacherCourses(user.id);
      }
    });
  }
}
