import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type: 'application_status' | 'interview_scheduled' | 'job_posted' | 'message' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  data?: any; // Additional data for the notification
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['application_status', 'interview_scheduled', 'job_posted', 'message', 'system'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  data: Schema.Types.Mixed,
}, {
  timestamps: true,
});

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);