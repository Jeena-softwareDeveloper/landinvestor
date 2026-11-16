import mongoose, { Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface ICustomerDocument extends mongoose.Document {
  customerId: string;
  fullName: string;
  mobile: string;
  email: string;
  password?: string;
  isVerified: boolean;
  emailVerified: boolean;
  mobileVerified: boolean;
  walletBalance: number;
  address: string;
  addressDetails?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  investorTier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  totalInvested: number;
  kycStatus: 'pending' | 'verified' | 'rejected';
  bankDetails: {
    accountHolderName: string;
    accountNumber: string;
    bankName: string;
    ifscCode: string;
    branchName: string;
  };
  upiId: string;
  registrationDate: Date;
  accountStatus: 'active' | 'inactive' | 'suspended';
  comparePassword(candidatePassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomerDocument>(
  {
    customerId: {
      type: String,
      unique: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [150, 'Name cannot exceed 150 characters'],
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    password: {
      type: String,
      select: false,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: true,
    },
    mobileVerified: {
      type: Boolean,
      default: true,
    },
    walletBalance: {
      type: Number,
      default: 0,
      min: [0, 'Wallet balance cannot be negative'],
    },
    address: {
      type: String,
      default: '',
      maxlength: [500, 'Address cannot exceed 500 characters'],
    },
    addressDetails: {
      street: { type: String, default: '', trim: true },
      city: { type: String, default: '', trim: true },
      state: { type: String, default: '', trim: true },
      pincode: { type: String, default: '', trim: true },
    },
    investorTier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
      default: 'bronze',
    },
    totalInvested: {
      type: Number,
      default: 0,
      min: 0,
    },
    kycStatus: {
      type: String,
      enum: {
        values: ['pending', 'verified', 'rejected'],
        message: '{VALUE} is not a valid KYC status',
      },
      default: 'pending',
    },
    bankDetails: {
      accountHolderName: { type: String, default: '', trim: true },
      accountNumber: { type: String, default: '', trim: true },
      bankName: { type: String, default: '', trim: true },
      ifscCode: { type: String, default: '', trim: true, uppercase: true },
      branchName: { type: String, default: '', trim: true },
    },
    upiId: {
      type: String,
      default: '',
      trim: true,
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
    accountStatus: {
      type: String,
      enum: {
        values: ['active', 'inactive', 'suspended'],
        message: '{VALUE} is not a valid account status',
      },
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

CustomerSchema.pre<ICustomerDocument>('save', async function () {
  if (!this.customerId) {
    const count = await mongoose.models.Customer.countDocuments();
    this.customerId = `CUST-${String(count + 1).padStart(5, '0')}`;
  }

  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});

CustomerSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

CustomerSchema.index({ mobile: 1 });
CustomerSchema.index({ accountStatus: 1 });
CustomerSchema.index({ kycStatus: 1 });

const Customer: Model<ICustomerDocument> =
  mongoose.models.Customer || mongoose.model<ICustomerDocument>('Customer', CustomerSchema);

export default Customer;
