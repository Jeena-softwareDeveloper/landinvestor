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
  minInvestmentAmount: number;
  coverImage: string;
  images: string[];
  documents: string[];
  description: string;
  status: 'active' | 'inactive' | 'fully_funded';
  publicApproved: boolean;
  featured: boolean;
  rentalIncomeModel: {
    projectedAnnualYield: number; // percentage, e.g. 14.5%
    distributionFrequency: 'daily' | 'monthly' | 'quarterly';
    tenantType: string;
    leaseDurationYears: number;
  };
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
    minInvestmentAmount: {
      type: Number,
      default: 50000,
      min: [1000, 'Minimum investment amount cannot be less than ₹1,000'],
    },
    coverImage: {
      type: String,
      default: '',
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
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive', 'fully_funded'],
        message: '{VALUE} is not a valid land status',
      },
      default: 'active',
    },
    publicApproved: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    rentalIncomeModel: {
      projectedAnnualYield: { type: Number, default: 12.0 },
      distributionFrequency: {
        type: String,
        enum: ['daily', 'monthly', 'quarterly'],
        default: 'monthly',
      },
      tenantType: { type: String, default: 'Agro-processing & Organic Farming' },
      leaseDurationYears: { type: Number, default: 5 },
    },
    dailyReturnConfig: {
      defaultRate: {
        type: Number,
        default: 0.1,
        min: [0, 'Rate cannot be negative'],
        max: [10, 'Daily rate cannot exceed 10%'],
      },
      baseRatePercentage: {
        type: Number,
        default: 0.1,
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

LandSchema.pre<ILandDocument>('save', function () {
  if (this.totalValue > 0) {
    this.investmentPercentage = Math.min(
      100,
      parseFloat(((this.totalInvested / this.totalValue) * 100).toFixed(2))
    );
    this.availableInvestment = Math.max(0, this.totalValue - this.totalInvested);

    if (this.availableInvestment === 0 && this.status === 'active') {
      this.status = 'fully_funded';
    }
  }
});

LandSchema.index({ status: 1 });
LandSchema.index({ publicApproved: 1 });
LandSchema.index({ featured: 1 });

const Land: Model<ILandDocument> =
  mongoose.models.Land || mongoose.model<ILandDocument>('Land', LandSchema);

export default Land;
