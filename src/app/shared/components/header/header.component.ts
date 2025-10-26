import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutService } from '../layout/layout.service';
import { BreadcrumbService } from '@shared/services/breadcrumb.service';
import { BreadcrumbItem } from '../breadcrumb/breadcrumb.component';
import { User } from '@shared/models/user';
import { UserService } from '@shared/services/user.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  router = inject(Router);
  breadcrumbItems: BreadcrumbItem[] = [];
  showAccountPopover = false;
  showNotificationPopover = false;
  currentUser: User | null = null;
  notifications: NotificationItem[] = [
    {
      id: 1,
      title: 'New course published',
      message: 'Your course "Intro to Angular" is live. Check it out!',
      timestamp: '2 minutes ago',
      isRead: false,
    },
    {
      id: 2,
      title: 'Assignment submitted',
      message: 'Anna Nguyen submitted Homework 2 for Web Development.',
      timestamp: '8 minutes ago',
      isRead: false,
    },
    {
      id: 3,
      title: 'Reminder',
      message: 'Prepare slides for Friday workshop with the mentor team.',
      timestamp: '22 minutes ago',
      isRead: false,
    },
    {
      id: 4,
      title: 'Comment added',
      message: 'David Tran left feedback on Chapter 4 of your course.',
      timestamp: '35 minutes ago',
      isRead: true,
    },
    {
      id: 5,
      title: 'New follower',
      message: 'Jane Le just followed your instructor profile.',
      timestamp: '1 hour ago',
      isRead: true,
    },
    {
      id: 6,
      title: 'Quiz graded',
      message: 'Auto-grading is complete for Quiz 3 in React Basics.',
      timestamp: '2 hours ago',
      isRead: true,
    },
    {
      id: 7,
      title: 'Support ticket',
      message: 'Support team replied to your request about billing.',
      timestamp: '3 hours ago',
      isRead: false,
    },
    {
      id: 8,
      title: 'Class starting soon',
      message: 'Live session for Backend Fundamentals begins in 15 minutes.',
      timestamp: '4 hours ago',
      isRead: true,
    },
    {
      id: 9,
      title: 'Payment received',
      message: 'Your payout for April has been processed successfully.',
      timestamp: '6 hours ago',
      isRead: true,
    },
    {
      id: 10,
      title: 'System update',
      message: 'We will deploy a platform update tonight at 11:00 PM.',
      timestamp: 'Yesterday',
      isRead: false,
    },
  ];
  activeNotificationTab: NotificationTab = 'all';
  activeNotificationMenuId: number | null = null;

  constructor(
    private layoutService: LayoutService,
    private breadcrumbService: BreadcrumbService,
    private userService: UserService
  ) {
    this.breadcrumbService.breadcrumbs$.subscribe((items) => {
      this.breadcrumbItems = items;
    });
    this.userService.user$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  ngOnInit(): void {}

  onMenuClick() {
    this.layoutService.toggleSidebar();
  }
  onCreateCourse() {
    this.router.navigate(['/courses/new-course']);
  }
  onAccoutPopoverVisibleChange(isVisible: boolean) {
    this.showAccountPopover = isVisible;
  }
  onNotificationPopoverVisibleChange(isVisible: boolean) {
    this.showNotificationPopover = isVisible;
    if (!isVisible) {
      this.activeNotificationMenuId = null;
    }
  }

  get unreadCount(): number {
    return this.notifications.filter((notification) => !notification.isRead)
      .length;
  }

  get filteredNotifications(): NotificationItem[] {
    if (this.activeNotificationTab === 'all') {
      return this.notifications;
    }
    return this.notifications.filter((notification) => !notification.isRead);
  }

  setNotificationTab(tab: NotificationTab) {
    this.activeNotificationTab = tab;
    this.activeNotificationMenuId = null;
  }

  toggleNotificationMenu(notificationId: number) {
    this.activeNotificationMenuId =
      this.activeNotificationMenuId === notificationId ? null : notificationId;
  }

  markNotification(notificationId: number, isRead: boolean) {
    this.notifications = this.notifications.map((notification) =>
      notification.id === notificationId
        ? { ...notification, isRead }
        : notification
    );
    this.activeNotificationMenuId = null;
  }

  deleteNotification(notificationId: number) {
    this.notifications = this.notifications.filter(
      (notification) => notification.id !== notificationId
    );
    this.activeNotificationMenuId = null;
  }

  @HostListener('document:click')
  closeActiveNotificationMenu() {
    if (this.activeNotificationMenuId !== null) {
      this.activeNotificationMenuId = null;
    }
  }
}

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

type NotificationTab = 'all' | 'unread';
