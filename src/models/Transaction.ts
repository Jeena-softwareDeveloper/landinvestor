import mongoose, { Schema, Model } from 'mongoose';

export interface ITransactionDocument extends mongoose.Document {
  customerId: mongoose.Types.ObjectId;
  investmentId?: mongoose.Types.ObjectId;
  type: 'deposit' | 'return_payment' | 'withdrawal' | 'refund' | 'adjustment';
  amount: number;
  upiId: string;
  upiReference: string;
  transactionDate: Date;
  paymentMethod: 'upi' | 'bank_transfer' | 'cash' | 'cheque';
  screenshotUrl: string;
  adminNotes: string;
  status: 'pending' | 'verified' | 'rejected' | 'completed';
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransactionDocument>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer is required'],
    },
    investmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Investment',
    },
    type: {
      type: String,
      enum: {
        values: ['deposit', 'return_payment', 'withdrawal', 'refund', 'adjustment'],
        message: '{VALUE} is not a valid transaction type',
      },
      required: [true, 'Transaction type is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    upiId: {
      type: String,
      default: '',
      trim: true,
    },
    upiReference: {
      type: String,
      default: '',
      trim: true,
    },
    transactionDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ['upi', 'bank_transfer', 'cash', 'cheque'],
        message: '{VALUE} is not a valid payment method',
      },
      default: 'upi',
    },
    screenshotUrl: {
      type: String,
      default: '',
    },
    adminNotes: {
      type: String,
      default: '',
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'verified', 'rejected', 'completed'],
        message: '{VALUE} is not a valid status',
      },
      default: 'pending',
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
TransactionSchema.index({ customerId: 1 });
TransactionSchema.index({ investmentId: 1 });
TransactionSchema.index({ type: 1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ transactionDate: -1 });
TransactionSchema.index({ customerId: 1, type: 1, status: 1 });

const Transaction: Model<ITransactionDocument> =
  mongoose.models.Transaction ||
  mongoose.model<ITransactionDocument>('Transaction', TransactionSchema);

export default Transaction;
