export interface NotificationPayload {
  notification_type: string;
  firebaseChId: string;
  channel_id: string;
  title: string;
  body: string;
}
