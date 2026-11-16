import mongoose, { Schema, Model } from 'mongoose';

export interface IRentalIncomeDocument extends mongoose.Document {
  landId: mongoose.Types.ObjectId;
  period: string; // e.g. "2025-05" or "2025-Q1"
  grossIncome: number;
  operationalExpenses: number;
  netDistributableIncome: number;
  tenantDetails?: string;
  distributedAmount: number;
  status: 'collected' | 'distributed' | 'audited';
  createdAt: Date;
  updatedAt: Date;
}

const RentalIncomeSchema = new Schema<IRentalIncomeDocument>(
  {
    landId: {
      type: Schema.Types.ObjectId,
      ref: 'Land',
      required: true,
      index: true,
    },
    period: {
      type: String,
      required: true,
      trim: true,
    },
    grossIncome: {
      type: Number,
      required: true,
      min: 0,
    },
    operationalExpenses: {
      type: Number,
      default: 0,
      min: 0,
    },
    netDistributableIncome: {
      type: Number,
      required: true,
      min: 0,
    },
    tenantDetails: {
      type: String,
      default: '',
    },
    distributedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['collected', 'distributed', 'audited'],
      default: 'collected',
    },
  },
  {
    timestamps: true,
  }
);

RentalIncomeSchema.index({ landId: 1, period: 1 });

const RentalIncome: Model<IRentalIncomeDocument> =
  mongoose.models.RentalIncome ||
  mongoose.model<IRentalIncomeDocument>('RentalIncome', RentalIncomeSchema);

export default RentalIncome;

