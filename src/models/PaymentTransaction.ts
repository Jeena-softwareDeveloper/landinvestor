import mongoose, { Schema, Model } from 'mongoose';

export interface IPaymentTransactionDocument extends mongoose.Document {
  orderId: mongoose.Types.ObjectId;
  utr: string;
  amount: number;
  upiAccountId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  status: 'submitted' | 'verified' | 'rejected';
  reconciliationSource: 'customer_submission' | 'manual_entry' | 'gateway_webhook';
  proofUrl?: string;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentTransactionSchema = new Schema<IPaymentTransactionDocument>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'PaymentOrder',
      required: true,
      index: true,
    },
    utr: {
      type: String,
      required: [true, 'UTR Reference is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    upiAccountId: {
      type: Schema.Types.ObjectId,
      ref: 'UpiAccount',
      required: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    status: {
      type: String,
      enum: ['submitted', 'verified', 'rejected'],
      default: 'submitted',
    },
    reconciliationSource: {
      type: String,
      enum: ['customer_submission', 'manual_entry', 'gateway_webhook'],
      default: 'customer_submission',
    },
    proofUrl: {
      type: String,
      default: '',
    },
    verifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

PaymentTransactionSchema.index({ status: 1 });

const PaymentTransaction: Model<IPaymentTransactionDocument> =
  mongoose.models.PaymentTransaction ||
  mongoose.model<IPaymentTransactionDocument>('PaymentTransaction', PaymentTransactionSchema);

export default PaymentTransaction;

