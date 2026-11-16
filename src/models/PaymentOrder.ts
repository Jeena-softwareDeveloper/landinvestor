import mongoose, { Schema, Model } from 'mongoose';
import { PaymentOrderStatus } from '@/types';

export interface IPaymentOrderDocument extends mongoose.Document {
  orderId: string;
  customerId: mongoose.Types.ObjectId;
  landId: mongoose.Types.ObjectId;
  amount: number;
  assignedUpiAccountId: mongoose.Types.ObjectId;
  assignedUpiString: string;
  assignedUpiName: string;
  qrCodeUrl?: string;
  status: PaymentOrderStatus;
  expiresAt: Date;
  utr?: string;
  paymentProof?: string;
  customerNotes?: string;
  adminNotes?: string;
  submittedAt?: Date;
  verifiedAt?: Date;
  verifiedBy?: mongoose.Types.ObjectId;
  rejectionReason?: string;
  investmentId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentOrderSchema = new Schema<IPaymentOrderDocument>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    landId: {
      type: Schema.Types.ObjectId,
      ref: 'Land',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Order amount is required'],
      min: [1000, 'Amount must be at least ₹1,000'],
    },
    assignedUpiAccountId: {
      type: Schema.Types.ObjectId,
      ref: 'UpiAccount',
      required: true,
    },
    assignedUpiString: {
      type: String,
      required: true,
      trim: true,
    },
    assignedUpiName: {
      type: String,
      required: true,
      trim: true,
    },
    qrCodeUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: [
        'initiated',
        'pending',
        'submitted',
        'processing',
        'verified',
        'failed',
        'rejected',
        'expired',
        'refunded',
      ],
      default: 'initiated',
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    utr: {
      type: String,
      trim: true,
      uppercase: true,
    },
    paymentProof: {
      type: String,
      default: '',
    },
    customerNotes: {
      type: String,
      default: '',
    },
    adminNotes: {
      type: String,
      default: '',
    },
    submittedAt: {
      type: Date,
    },
    verifiedAt: {
      type: Date,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    investmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Investment',
    },
  },
  {
    timestamps: true,
  }
);

PaymentOrderSchema.index({ status: 1, createdAt: -1 });
PaymentOrderSchema.index({ utr: 1 }, { sparse: true });

const PaymentOrder: Model<IPaymentOrderDocument> =
  mongoose.models.PaymentOrder ||
  mongoose.model<IPaymentOrderDocument>('PaymentOrder', PaymentOrderSchema);

export default PaymentOrder;

