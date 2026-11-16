import mongoose, { Schema, Model } from 'mongoose';

export interface ICustomerDocument extends mongoose.Document {
  customerId: string;
  fullName: string;
  mobile: string;
  email: string;
  address: string;
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
      match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian mobile number'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    address: {
      type: String,
      default: '',
      maxlength: [500, 'Address cannot exceed 500 characters'],
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
      accountHolderName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      bankName: { type: String, default: '' },
      ifscCode: { type: String, default: '' },
      branchName: { type: String, default: '' },
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

// Indexes
CustomerSchema.index({ mobile: 1 });
CustomerSchema.index({ kycStatus: 1 });
CustomerSchema.index({ accountStatus: 1 });
CustomerSchema.index({ fullName: 'text' });

// Auto-generate customerId
CustomerSchema.pre('save', async function (next) {
  if (!this.customerId) {
    const count = await mongoose.model('Customer').countDocuments();
    this.customerId = `CUST${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

const Customer: Model<ICustomerDocument> =
  mongoose.models.Customer ||
  mongoose.model<ICustomerDocument>('Customer', CustomerSchema);

export default Customer;
