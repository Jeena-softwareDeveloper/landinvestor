import mongoose, { Schema, Model } from 'mongoose';

export interface ILandDocument extends mongoose.Document {
  name: string;
  location: string;
  surveyNumber: string;
  totalArea: number;
  totalValue: number;
  availableInvestment: number;
  totalInvested: number;
  investmentPercentage: number;
  images: string[];
  documents: string[];
  description: string;
  status: 'active' | 'inactive' | 'fully_funded';
  dailyReturnConfig: {
    defaultRate: number;
    isActive: boolean;
    lastCalculated?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const LandSchema = new Schema<ILandDocument>(
  {
    name: {
      type: String,
      required: [true, 'Land name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    surveyNumber: {
      type: String,
      required: [true, 'Survey number is required'],
      unique: true,
      trim: true,
    },
    totalArea: {
      type: Number,
      required: [true, 'Total area is required'],
      min: [0, 'Area cannot be negative'],
    },
    totalValue: {
      type: Number,
      required: [true, 'Total value is required'],
      min: [0, 'Value cannot be negative'],
    },
    availableInvestment: {
      type: Number,
      required: true,
      min: [0, 'Available investment cannot be negative'],
    },
    totalInvested: {
      type: Number,
      default: 0,
      min: [0, 'Total invested cannot be negative'],
    },
    investmentPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    images: {
      type: [String],
      default: [],
    },
    documents: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive', 'fully_funded'],
        message: '{VALUE} is not a valid status',
      },
      default: 'active',
    },
    dailyReturnConfig: {
      defaultRate: {
        type: Number,
        default: 0.1,
        min: 0,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
      lastCalculated: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
LandSchema.index({ status: 1 });
LandSchema.index({ location: 1 });

// Pre-save: recalculate investment percentage
LandSchema.pre('save', function (next) {
  if (this.totalValue > 0) {
    this.investmentPercentage =
      Math.round((this.totalInvested / this.totalValue) * 10000) / 100;
  }
  if (this.availableInvestment <= 0 && this.totalInvested >= this.totalValue) {
    this.status = 'fully_funded';
  }
  next();
});

const Land: Model<ILandDocument> =
  mongoose.models.Land || mongoose.model<ILandDocument>('Land', LandSchema);

export default Land;
