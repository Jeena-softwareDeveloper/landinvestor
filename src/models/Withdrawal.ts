import mongoose, { Schema, Model } from 'mongoose';

export interface IWithdrawalDocument extends mongoose.Document {
  customerId: mongoose.Types.ObjectId;
  requestedAmount: number;
  availableBalance: number;
  upiId: string;
  bankDetails: {
    accountHolderName: string;
    accountNumber: string;
    bankName: string;
    ifscCode: string;
    branchName: string;
  };
  requestDate: Date;
  status: 'pending' | 'approved' | 'processing' | 'paid' | 'rejected';
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  paymentReference: string;
  paymentProof: string;
  rejectionReason: string;
  createdAt: Date;
  updatedAt: Date;
}

const WithdrawalSchema = new Schema<IWithdrawalDocument>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer is required'],
    },
    requestedAmount: {
      type: Number,
      required: [true, 'Requested amount is required'],
      min: [1, 'Amount must be at least 1'],
    },
    availableBalance: {
      type: Number,
      required: true,
      min: 0,
    },
    upiId: {
      type: String,
      default: '',
      trim: true,
    },
    bankDetails: {
      accountHolderName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      bankName: { type: String, default: '' },
      ifscCode: { type: String, default: '' },
      branchName: { type: String, default: '' },
    },
    requestDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'processing', 'paid', 'rejected'],
        message: '{VALUE} is not a valid withdrawal status',
      },
      default: 'pending',
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
    paymentReference: {
      type: String,
      default: '',
      trim: true,
    },
    paymentProof: {
      type: String,
      default: '',
    },
    rejectionReason: {
      type: String,
      default: '',
      maxlength: [500, 'Rejection reason cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
WithdrawalSchema.index({ customerId: 1 });
WithdrawalSchema.index({ status: 1 });
WithdrawalSchema.index({ requestDate: -1 });
WithdrawalSchema.index({ customerId: 1, status: 1 });

const Withdrawal: Model<IWithdrawalDocument> =
  mongoose.models.Withdrawal ||
  mongoose.model<IWithdrawalDocument>('Withdrawal', WithdrawalSchema);

export default Withdrawal;
