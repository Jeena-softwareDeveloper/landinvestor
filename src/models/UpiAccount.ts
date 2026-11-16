import mongoose, { Schema, Model } from 'mongoose';
import { UpiStatus } from '@/types';

export interface IUpiAccountDocument extends mongoose.Document {
  upiId: string;
  displayName: string;
  qrCode?: string;
  provider: string;
  status: UpiStatus;
  priority: number;
  weight: number;
  dailyTransactionLimit: number;
  dailyCollectionLimit: number;
  currentDailyCount: number;
  currentDailyAmount: number;
  totalTransactions: number;
  totalCollection: number;
  lastAssignedAt?: Date;
  lastResetDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UpiAccountSchema = new Schema<IUpiAccountDocument>(
  {
    upiId: {
      type: String,
      required: [true, 'UPI ID is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    displayName: {
      type: String,
      required: [true, 'Display name is required'],
      trim: true,
    },
    qrCode: {
      type: String,
      default: '',
    },
    provider: {
      type: String,
      required: [true, 'Provider / Bank name is required'],
      trim: true,
      default: 'Authorized Merchant Escrow',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    priority: {
      type: Number,
      default: 1, // Higher number = higher priority
      min: 1,
    },
    weight: {
      type: Number,
      default: 1,
      min: 1,
    },
    dailyTransactionLimit: {
      type: Number,
      default: 50,
      min: 1,
    },
    dailyCollectionLimit: {
      type: Number,
      default: 1000000, // ₹10,00,000 daily
      min: 1000,
    },
    currentDailyCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentDailyAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalTransactions: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCollection: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastAssignedAt: {
      type: Date,
    },
    lastResetDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

UpiAccountSchema.index({ status: 1, priority: -1 });

const UpiAccount: Model<IUpiAccountDocument> =
  mongoose.models.UpiAccount ||
  mongoose.model<IUpiAccountDocument>('UpiAccount', UpiAccountSchema);

export default UpiAccount;

