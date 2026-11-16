import mongoose, { Schema, Model } from 'mongoose';

export interface IInvestmentDocument extends mongoose.Document {
  customerId: mongoose.Types.ObjectId;
  landId: mongoose.Types.ObjectId;
  amount: number;
  startDate: Date;
  duration: number;
  returnRate: number;
  status: 'active' | 'matured' | 'cancelled';
  paymentReference: string;
  investmentPercentage: number;
  dailyAccruedReturn: number;
  monthlyAccruedReturn: number;
  totalAccruedReturn: number;
  maturityAmount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvestmentSchema = new Schema<IInvestmentDocument>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer is required'],
    },
    landId: {
      type: Schema.Types.ObjectId,
      ref: 'Land',
      required: [true, 'Land property is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Investment amount is required'],
      min: [1, 'Amount must be at least 1'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      default: Date.now,
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 month'],
    },
    returnRate: {
      type: Number,
      required: [true, 'Return rate is required'],
      min: [0, 'Return rate cannot be negative'],
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'matured', 'cancelled'],
        message: '{VALUE} is not a valid investment status',
      },
      default: 'active',
    },
    paymentReference: {
      type: String,
      default: '',
      trim: true,
    },
    investmentPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    dailyAccruedReturn: {
      type: Number,
      default: 0,
    },
    monthlyAccruedReturn: {
      type: Number,
      default: 0,
    },
    totalAccruedReturn: {
      type: Number,
      default: 0,
    },
    maturityAmount: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
InvestmentSchema.index({ customerId: 1 });
InvestmentSchema.index({ landId: 1 });
InvestmentSchema.index({ status: 1 });
InvestmentSchema.index({ customerId: 1, landId: 1 });
InvestmentSchema.index({ startDate: 1 });

// Calculate daily return on save
InvestmentSchema.pre('save', function (next) {
  if (this.amount > 0 && this.returnRate > 0) {
    this.dailyAccruedReturn =
      Math.round(this.amount * (this.returnRate / 100) * 100) / 100;
    this.monthlyAccruedReturn =
      Math.round(this.dailyAccruedReturn * 30 * 100) / 100;
    this.maturityAmount =
      Math.round(
        (this.amount + this.dailyAccruedReturn * this.duration * 30) * 100
      ) / 100;
  }
  next();
});

const Investment: Model<IInvestmentDocument> =
  mongoose.models.Investment ||
  mongoose.model<IInvestmentDocument>('Investment', InvestmentSchema);

export default Investment;
