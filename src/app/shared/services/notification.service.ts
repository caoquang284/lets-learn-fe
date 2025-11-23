import { Injectable } from '@angular/core';
import { GET, POST, PATCH, DELETE } from '@shared/api/utils.api';
import { Notification } from '@shared/models/notification';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor() {}

  getNotifications(): Observable<Notification[]> {
    return from(GET('/notification')).pipe(
      map((res: any[]) =>
        (res || []).map((item) => ({
          id: item.id,
          title: item.title,
          message: item.message,
          // backend returns LocalDateTime/ISO — format as readable string
          timestamp: item.timestamp ? new Date(item.timestamp).toLocaleString() : '',
          isRead: !!item.isRead,
        }))
      )
    );
  }

  markAsRead(id: string, isRead: boolean): Observable<Notification> {
    return from(PATCH(`/notification/${id}/read`, { isRead })).pipe(
      map((item: any) => ({
        id: item.id,
        title: item.title,
        message: item.message,
        timestamp: item.timestamp ? new Date(item.timestamp).toLocaleString() : '',
        isRead: !!item.isRead,
      }))
    );
  }

  deleteNotification(id: string): Observable<void> {
    return from(DELETE(`/notification/${id}`));
  }

  createNotification(
    userId: string,
    title: string,
    message: string
  ): Observable<Notification> {
    const body = { userId, title, message };
    return from(POST('/notification', body)).pipe(
      map((item: any) => ({
        id: item.id,
        title: item.title,
        message: item.message,
        timestamp: item.timestamp ? new Date(item.timestamp).toLocaleString() : '',
        isRead: !!item.isRead,
      }))
    );
  }
}
