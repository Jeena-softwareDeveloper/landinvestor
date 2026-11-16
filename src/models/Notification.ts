import mongoose, { Schema, Model } from 'mongoose';

export interface INotificationDocument extends mongoose.Document {
  recipientType: 'customer' | 'admin';
  recipientId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'payment' | 'investment' | 'return' | 'withdrawal' | 'system';
  read: boolean;
  link?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    recipientType: {
      type: String,
      enum: ['customer', 'admin'],
      required: true,
      index: true,
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['payment', 'investment', 'return', 'withdrawal', 'system'],
      default: 'system',
    },
    read: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

NotificationSchema.index({ recipientId: 1, read: 1, createdAt: -1 });

const Notification: Model<INotificationDocument> =
  mongoose.models.Notification ||
  mongoose.model<INotificationDocument>('Notification', NotificationSchema);

export default Notification;

