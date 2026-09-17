-- 035_add_notification_delivery_status.sql
ALTER TABLE notifications ADD COLUMN emailDeliveryStatus TEXT DEFAULT 'NONE';
ALTER TABLE notifications ADD COLUMN emailError TEXT;
