import { Component, HostListener, inject, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutService } from '../layout/layout.service';
import { BreadcrumbService } from '@shared/services/breadcrumb.service';
import { BreadcrumbItem } from '../breadcrumb/breadcrumb.component';
import { User } from '@shared/models/user';
import { UserService } from '@shared/services/user.service';
import { NotificationService } from '@shared/services/notification.service';
import { NotificationItem } from '@shared/models/notification';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit, OnDestroy {
  router = inject(Router);
  breadcrumbItems: BreadcrumbItem[] = [];
  showAccountPopover = false;
  showNotificationPopover = false;
  currentUser: User | null = null;
  notifications: NotificationItem[] = [];
  activeNotificationTab: NotificationTab = 'all';
  activeNotificationMenuId: string | null = null;
  private refreshIntervalId: any = null;

  constructor(
    private layoutService: LayoutService,
    private breadcrumbService: BreadcrumbService,
    private userService: UserService
    ,
    private notificationService: NotificationService
  ) {
    this.breadcrumbService.breadcrumbs$.subscribe((items) => {
      this.breadcrumbItems = items;
    });
    this.userService.user$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  ngOnInit(): void {
    this.loadNotifications();
    // auto-refresh every 30s
    this.refreshIntervalId = setInterval(() => this.loadNotifications(), 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
      this.refreshIntervalId = null;
    }
  }

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
    return this.notifications.filter((notification) => !notification.isRead).length;
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

  toggleNotificationMenu(notificationId: string | number) {
    const id = String(notificationId);
    this.activeNotificationMenuId = this.activeNotificationMenuId === id ? null : id;
  }

  markNotification(notificationId: string | number, isRead: boolean) {
    const id = String(notificationId);
    this.notificationService
      .markAsRead(id, isRead)
      .then((updated) => {
        this.notifications = this.notifications.map((notification) =>
          String(notification.id) === String(updated.id)
            ? { ...notification, isRead: updated.isRead }
            : notification
        );
      })
      .catch((err) => console.error('Failed to mark notification', err))
      .finally(() => {
        this.activeNotificationMenuId = null;
      });
  }

  deleteNotification(notificationId: string | number) {
    const id = String(notificationId);
    this.notificationService
      .deleteNotification(id)
      .then(() => {
        this.notifications = this.notifications.filter(
          (notification) => String(notification.id) !== id
        );
      })
      .catch((err) => console.error('Failed to delete notification', err))
      .finally(() => {
        this.activeNotificationMenuId = null;
      });
  }

  loadNotifications() {
    this.notificationService
      .getNotifications()
      .then((data) => {
        this.notifications = data;
        this.updateFilteredNotifications();
      })
      .catch((err) => console.error('Failed to load notifications', err));
  }

  updateFilteredNotifications() {
    // kept for compatibility with previous calls — computed getter handles filtering
    this.activeNotificationMenuId = this.activeNotificationMenuId;
  }

  @HostListener('document:click')
  closeActiveNotificationMenu() {
    if (this.activeNotificationMenuId !== null) {
      this.activeNotificationMenuId = null;
    }
  }
}

// NotificationItem type is imported from shared models

type NotificationTab = 'all' | 'unread';
