import mongoose, { Schema, Model } from 'mongoose';

export interface IReturnLedgerDocument extends mongoose.Document {
  customerId: mongoose.Types.ObjectId;
  investmentId: mongoose.Types.ObjectId;
  landId: mongoose.Types.ObjectId;
  amount: number;
  type: 'rental_yield' | 'bonus' | 'adjustment';
  referenceDate: Date;
  payoutStatus: 'accrued' | 'verified' | 'paid';
  payoutTransactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReturnLedgerSchema = new Schema<IReturnLedgerDocument>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    investmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Investment',
      required: true,
      index: true,
    },
    landId: {
      type: Schema.Types.ObjectId,
      ref: 'Land',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: ['rental_yield', 'bonus', 'adjustment'],
      default: 'rental_yield',
    },
    referenceDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    payoutStatus: {
      type: String,
      enum: ['accrued', 'verified', 'paid'],
      default: 'accrued',
      index: true,
    },
    payoutTransactionId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

ReturnLedgerSchema.index({ customerId: 1, referenceDate: -1 });

const ReturnLedger: Model<IReturnLedgerDocument> =
  mongoose.models.ReturnLedger ||
  mongoose.model<IReturnLedgerDocument>('ReturnLedger', ReturnLedgerSchema);

export default ReturnLedger;

