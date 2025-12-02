import { apiConnector } from '@/services/apiConnector';
import { notificationEndpoints } from '@/services/api';

export const getNotifications = (page = 1, limit = 20) => {
  return apiConnector('GET', notificationEndpoints.GET_NOTIFICATIONS, null, null, { page, limit });
};

export const getUnreadCount = () => {
  return apiConnector('GET', notificationEndpoints.GET_COUNT);
};

export const markNotificationAsRead = (id: string) => {
  return apiConnector('PUT', notificationEndpoints.MARK_AS_READ(id));
};

export const markAllNotificationsAsRead = () => {
  return apiConnector('PUT', notificationEndpoints.MARK_ALL_READ);
};
