import mongoose, { Schema, Model } from 'mongoose';
import { UpiRotationStrategy } from '@/types';

export interface IUpiAssignmentLogDocument extends mongoose.Document {
  orderId: string;
  upiAccountId: mongoose.Types.ObjectId;
  upiId: string;
  customerId: mongoose.Types.ObjectId;
  amount: number;
  strategyUsed: UpiRotationStrategy;
  timestamp: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const UpiAssignmentLogSchema = new Schema<IUpiAssignmentLogDocument>(
  {
    orderId: {
      type: String,
      required: true,
      index: true,
    },
    upiAccountId: {
      type: Schema.Types.ObjectId,
      ref: 'UpiAccount',
      required: true,
    },
    upiId: {
      type: String,
      required: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    strategyUsed: {
      type: String,
      enum: ['round_robin', 'weighted', 'least_used', 'priority'],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

UpiAssignmentLogSchema.index({ timestamp: -1 });

const UpiAssignmentLog: Model<IUpiAssignmentLogDocument> =
  mongoose.models.UpiAssignmentLog ||
  mongoose.model<IUpiAssignmentLogDocument>('UpiAssignmentLog', UpiAssignmentLogSchema);

export default UpiAssignmentLog;

