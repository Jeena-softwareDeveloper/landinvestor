import mongoose, { Schema, Model } from 'mongoose';

export interface IDailyReturnDocument extends mongoose.Document {
  investmentId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  landId: mongoose.Types.ObjectId;
  date: Date;
  investmentAmount: number;
  returnRate: number;
  dailyReturnAmount: number;
  status: 'accrued' | 'verified' | 'paid';
  paidAt?: Date;
  verifiedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const DailyReturnSchema = new Schema<IDailyReturnDocument>(
  {
    investmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Investment',
      required: [true, 'Investment is required'],
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer is required'],
    },
    landId: {
      type: Schema.Types.ObjectId,
      ref: 'Land',
      required: [true, 'Land is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    investmentAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    returnRate: {
      type: Number,
      required: true,
      min: 0,
    },
    dailyReturnAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: {
        values: ['accrued', 'verified', 'paid'],
        message: '{VALUE} is not a valid status',
      },
      default: 'accrued',
    },
    paidAt: {
      type: Date,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes
DailyReturnSchema.index({ investmentId: 1, date: 1 }, { unique: true });
DailyReturnSchema.index({ customerId: 1 });
DailyReturnSchema.index({ landId: 1 });
DailyReturnSchema.index({ date: -1 });
DailyReturnSchema.index({ status: 1 });
DailyReturnSchema.index({ customerId: 1, date: -1 });

const DailyReturn: Model<IDailyReturnDocument> =
  mongoose.models.DailyReturn ||
  mongoose.model<IDailyReturnDocument>('DailyReturn', DailyReturnSchema);

export default DailyReturn;
