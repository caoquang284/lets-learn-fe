import { Injectable } from '@angular/core';
import { GET, POST, PATCH, DELETE } from '@shared/api/utils.api';
import { Notification } from '@shared/models/notification';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor() {}

  getNotifications(): Promise<Notification[]> {
    return GET('/notification').then((res: any[]) =>
      (res || []).map((item) => ({
        id: item.id,
        title: item.title,
        message: item.message,
        // backend returns ISO / LocalDateTime — format as readable string
        timestamp: item.timestamp ? new Date(item.timestamp).toLocaleString() : '',
        isRead: !!item.isRead,
      }))
    );
  }

  markAsRead(id: string, isRead: boolean): Promise<Notification> {
    return PATCH(`/notification/${id}/read`, { isRead });
  }

  deleteNotification(id: string): Promise<void> {
    return DELETE(`/notification/${id}`);
  }

  createNotification(userId: string, title: string, message: string): Promise<Notification> {
    const body = { userId, title, message };
    return POST('/notification', body);
  }
}
