import connectDB from '@/lib/mongodb';
import PaymentOrder from '@/models/PaymentOrder';
import PaymentTransaction from '@/models/PaymentTransaction';
import Land from '@/models/Land';
import Customer from '@/models/Customer';
import Investment from '@/models/Investment';
import AuditLog from '@/models/AuditLog';
import { TierService } from './tier.service';
import { UpiRotationService } from './upi-rotation.service';
import { UpiRotationStrategy } from '@/types';

export class PaymentOrderService {
  /**
   * Generates a unique, chronological order ID e.g. ORD-20251116-89412
   */
  public static generateOrderId(): string {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(10000 + Math.random() * 90000);
    return `ORD-${dateStr}-${rand}`;
  }

  /**
   * Creates a new pending payment order for a customer and assigns an eligible UPI merchant destination.
   */
  public static async createOrder(params: {
    customerId: string;
    landId: string;
    amount: number;
    customerNotes?: string;
    strategy?: UpiRotationStrategy;
  }) {
    await connectDB();

    const { customerId, landId, amount, customerNotes, strategy = 'round_robin' } = params;

    const land = await Land.findById(landId);
    if (!land) throw new Error('Land property not found');
    if (land.status === 'fully_funded' || land.status === 'inactive') {
      throw new Error('This land parcel is currently not open for new investments');
    }
    if (land.minInvestmentAmount && amount < land.minInvestmentAmount) {
      throw new Error(`Minimum investment for this property is ₹${land.minInvestmentAmount.toLocaleString('en-IN')}`);
    }
    if (amount > land.availableInvestment) {
      throw new Error(`Amount exceeds available land allocation of ₹${land.availableInvestment.toLocaleString('en-IN')}`);
    }

    const customer = await Customer.findById(customerId);
    if (!customer) throw new Error('Customer account not found');

    const orderId = this.generateOrderId();

    // Assign UPI merchant destination
    const assignment = await UpiRotationService.assignUpiToOrder(
      orderId,
      customerId,
      amount,
      strategy
    );

    // 15 minutes payment expiry window
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const order = await PaymentOrder.create({
      orderId,
      customerId,
      landId,
      amount,
      assignedUpiAccountId: assignment.upiAccountId,
      assignedUpiString: assignment.upiId,
      assignedUpiName: assignment.displayName,
      qrCodeUrl: assignment.qrCodeUrl,
      status: 'initiated',
      expiresAt,
      customerNotes: customerNotes || '',
    });

    return {
      order,
      upiUri: assignment.upiUri,
      qrCodeUrl: assignment.qrCodeUrl,
    };
  }

  /**
   * Customer submits UTR / Bank Reference Number after transferring money.
   */
  public static async submitUtr(params: {
    orderId: string;
    utr: string;
    paymentProof?: string;
    customerNotes?: string;
  }) {
    await connectDB();
    const { orderId, utr, paymentProof, customerNotes } = params;

    const cleanUtr = utr.trim().toUpperCase();
    if (!cleanUtr || cleanUtr.length < 6) {
      throw new Error('Please enter a valid Bank Reference / UTR Number (minimum 6 characters)');
    }

    // Check for duplicate UTR across existing verified or submitted transactions
    const duplicate = await PaymentTransaction.findOne({ utr: cleanUtr });
    if (duplicate) {
      throw new Error(`Duplicate transaction detected. UTR "${cleanUtr}" is already submitted.`);
    }

    const order = await PaymentOrder.findOne({ orderId });
    if (!order) throw new Error('Order not found');

    if (order.status === 'verified') {
      throw new Error('This order is already verified and completed');
    }

    // Create PaymentTransaction
    await PaymentTransaction.create({
      orderId: order._id,
      utr: cleanUtr,
      amount: order.amount,
      upiAccountId: order.assignedUpiAccountId,
      customerId: order.customerId,
      status: 'submitted',
      reconciliationSource: 'customer_submission',
      proofUrl: paymentProof || '',
    });

    // Update Order
    order.utr = cleanUtr;
    order.status = 'submitted';
    order.submittedAt = new Date();
    if (paymentProof) order.paymentProof = paymentProof;
    if (customerNotes) order.customerNotes = customerNotes;
    await order.save();

    return order;
  }

  /**
   * Admin verifies payment after checking merchant bank statement or webhook confirmation.
   * Concurrently activates the investment contract, updates land allocation, and logs audit.
   */
  public static async adminVerifyOrder(params: {
    orderId: string;
    adminUserId: string;
    adminNotes?: string;
  }) {
    await connectDB();
    const { orderId, adminUserId, adminNotes } = params;

    const order = await PaymentOrder.findOne({ orderId }).populate('landId customerId');
    if (!order) throw new Error('Order not found');

    if (order.status === 'verified') {
      throw new Error('This order has already been verified');
    }

    const land = await Land.findById(order.landId);
    if (!land) throw new Error('Associated land property not found');

    // Calculate return projections
    const returnRate = land.dailyReturnConfig?.defaultRate || 0.1;
    const duration = 12; // default 12-month agreement
    const dailyAccruedReturn = (order.amount * returnRate) / 100;
    const monthlyAccruedReturn = dailyAccruedReturn * 30;
    const totalAccruedReturn = dailyAccruedReturn * 365;
    const maturityAmount = order.amount + totalAccruedReturn;
    const investmentPercentage =
      land.totalValue > 0 ? parseFloat(((order.amount / land.totalValue) * 100).toFixed(4)) : 0;

    // Create the active Investment contract
    const investment = await Investment.create({
      customerId: order.customerId,
      landId: order.landId,
      amount: order.amount,
      startDate: new Date(),
      duration,
      returnRate,
      status: 'active',
      paymentReference: order.utr || order.orderId,
      investmentPercentage,
      dailyAccruedReturn,
      monthlyAccruedReturn,
      totalAccruedReturn: 0,
      maturityAmount,
      notes: `Activated from verified UPI Order ${order.orderId}`,
    });

    // Update Land investment totals
    land.totalInvested = (land.totalInvested || 0) + order.amount;
    land.availableInvestment = Math.max(0, land.totalValue - land.totalInvested);
    if (land.totalValue > 0) {
      land.investmentPercentage = Math.min(
        100,
        parseFloat(((land.totalInvested / land.totalValue) * 100).toFixed(2))
      );
    }
    if (land.availableInvestment === 0) {
      land.status = 'fully_funded';
    }
    await land.save();

    // Automatically sync customer's active investment total & upgrade their Tier Level (Bronze -> Diamond)
    try {
      await TierService.syncCustomerTier(order.customerId.toString());
    } catch (tierErr) {
      console.error('Failed to sync customer tier:', tierErr);
    }

    // Mark order verified
    order.status = 'verified';
    order.verifiedAt = new Date();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    order.verifiedBy = adminUserId as any;
    order.investmentId = investment._id as any;
    if (adminNotes) order.adminNotes = adminNotes;
    await order.save();

    // Update PaymentTransaction status
    if (order.utr) {
      await PaymentTransaction.findOneAndUpdate(
        { utr: order.utr },
        { status: 'verified', verifiedAt: new Date() }
      );
    }

    // Write immutable audit log
    await AuditLog.create({
      userId: adminUserId,
      action: 'PAYMENT_VERIFIED',
      module: 'payments',
      targetId: order._id,
      details: {
        orderId: order.orderId,
        amount: order.amount,
        utr: order.utr,
        investmentId: investment._id,
      },
    });

    return { order, investment };
  }

  /**
   * Admin rejects payment with reason.
   */
  public static async adminRejectOrder(params: {
    orderId: string;
    adminUserId: string;
    rejectionReason: string;
    adminNotes?: string;
  }) {
    await connectDB();
    const { orderId, adminUserId, rejectionReason, adminNotes } = params;

    const order = await PaymentOrder.findOne({ orderId });
    if (!order) throw new Error('Order not found');

    if (order.status === 'verified') {
      throw new Error('Cannot reject an already verified order');
    }

    order.status = 'rejected';
    order.rejectionReason = rejectionReason;
    if (adminNotes) order.adminNotes = adminNotes;
    await order.save();

    if (order.utr) {
      await PaymentTransaction.findOneAndUpdate(
        { utr: order.utr },
        { status: 'rejected' }
      );
    }

    await AuditLog.create({
      userId: adminUserId,
      action: 'PAYMENT_REJECTED',
      module: 'payments',
      targetId: order._id,
      details: {
        orderId: order.orderId,
        amount: order.amount,
        rejectionReason,
      },
    });

    return order;
  }
}

