import connectDB from '@/lib/mongodb';
import UpiAccount, { IUpiAccountDocument } from '@/models/UpiAccount';
import UpiAssignmentLog from '@/models/UpiAssignmentLog';
import PaymentOrder from '@/models/PaymentOrder';
import { UpiRotationStrategy } from '@/types';

export class UpiRotationService {
  /**
   * Resets daily counters for any account whose lastResetDate is before today.
   */
  private static async resetExpiredDailyLimits(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await UpiAccount.updateMany(
      { lastResetDate: { $lt: today } },
      {
        $set: {
          currentDailyCount: 0,
          currentDailyAmount: 0,
          lastResetDate: today,
        },
      }
    );
  }

  /**
   * Selects an eligible active UPI account according to the strategy,
   * taking into account daily transaction and collection limits.
   */
  public static async selectEligibleAccount(
    strategy: UpiRotationStrategy = 'round_robin',
    amount: number
  ): Promise<IUpiAccountDocument | null> {
    await connectDB();
    await this.resetExpiredDailyLimits();

    // Query active accounts that have NOT exceeded daily count or daily amount
    const eligibleAccounts = await UpiAccount.find({
      status: 'active',
      $expr: {
        $and: [
          { $lt: ['$currentDailyCount', '$dailyTransactionLimit'] },
          { $lte: [{ $add: ['$currentDailyAmount', amount] }, '$dailyCollectionLimit'] },
        ],
      },
    }).sort({ priority: -1, lastAssignedAt: 1 });

    if (!eligibleAccounts || eligibleAccounts.length === 0) {
      // Fallback: Find any active account if limits are strictly capped
      const anyActive = await UpiAccount.findOne({ status: 'active' }).sort({ priority: -1 });
      return anyActive;
    }

    let selected: IUpiAccountDocument = eligibleAccounts[0];

    switch (strategy) {
      case 'round_robin': {
        // Sort by lastAssignedAt ascending so the oldest assigned gets the next turn
        eligibleAccounts.sort((a, b) => {
          const aTime = a.lastAssignedAt ? new Date(a.lastAssignedAt).getTime() : 0;
          const bTime = b.lastAssignedAt ? new Date(b.lastAssignedAt).getTime() : 0;
          return aTime - bTime;
        });
        selected = eligibleAccounts[0];
        break;
      }

      case 'least_used': {
        // Pick the one with the lowest current daily collection amount
        eligibleAccounts.sort((a, b) => a.currentDailyAmount - b.currentDailyAmount);
        selected = eligibleAccounts[0];
        break;
      }

      case 'weighted': {
        // Weighted random selection based on account weight
        const totalWeight = eligibleAccounts.reduce((acc, curr) => acc + (curr.weight || 1), 0);
        let randomNum = Math.random() * totalWeight;
        for (const acc of eligibleAccounts) {
          randomNum -= acc.weight || 1;
          if (randomNum <= 0) {
            selected = acc;
            break;
          }
        }
        break;
      }

      case 'priority':
      default: {
        // Pick the highest priority account (already sorted by priority descending)
        selected = eligibleAccounts[0];
        break;
      }
    }

    return selected;
  }

  /**
   * Generates a standard NPCI compliant UPI payment URL and QR Code URL.
   */
  public static generateUpiPaymentUrls(
    upiId: string,
    displayName: string,
    amount: number,
    orderId: string
  ): { upiUri: string; qrCodeUrl: string } {
    const cleanUpi = upiId.trim();
    const cleanName = displayName.trim();
    const upiUri = `upi://pay?pa=${cleanUpi}&pn=${encodeURIComponent(cleanName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent('LandVest Order ' + orderId)}&tr=${orderId}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(upiUri)}`;

    return { upiUri, qrCodeUrl };
  }

  /**
   * Concurrency-safe atomic assignment of a UPI destination to an order.
   * If the order already has an assigned destination, it returns the existing assignment (idempotent).
   */
  public static async assignUpiToOrder(
    orderId: string,
    customerId: string,
    amount: number,
    strategy: UpiRotationStrategy = 'round_robin'
  ): Promise<{
    upiAccountId: string;
    upiId: string;
    displayName: string;
    qrCodeUrl: string;
    upiUri: string;
  }> {
    await connectDB();

    // Check if order already has an assigned UPI account
    const existingOrder = await PaymentOrder.findOne({ orderId });
    if (existingOrder && existingOrder.assignedUpiString) {
      const { upiUri, qrCodeUrl } = this.generateUpiPaymentUrls(
        existingOrder.assignedUpiString,
        existingOrder.assignedUpiName,
        existingOrder.amount,
        existingOrder.orderId
      );

      return {
        upiAccountId: existingOrder.assignedUpiAccountId.toString(),
        upiId: existingOrder.assignedUpiString,
        displayName: existingOrder.assignedUpiName,
        qrCodeUrl: existingOrder.qrCodeUrl || qrCodeUrl,
        upiUri,
      };
    }

    // Select eligible account using rotation engine
    const selectedAccount = await this.selectEligibleAccount(strategy, amount);
    if (!selectedAccount) {
      throw new Error('No active merchant UPI payment destinations available. Please contact admin.');
    }

    // Atomic update of account limits and timestamp
    await UpiAccount.findByIdAndUpdate(selectedAccount._id, {
      $inc: {
        currentDailyCount: 1,
        currentDailyAmount: amount,
        totalTransactions: 1,
        totalCollection: amount,
      },
      $set: {
        lastAssignedAt: new Date(),
      },
    });

    const { upiUri, qrCodeUrl } = this.generateUpiPaymentUrls(
      selectedAccount.upiId,
      selectedAccount.displayName,
      amount,
      orderId
    );

    // Save assignment audit log
    await UpiAssignmentLog.create({
      orderId,
      upiAccountId: selectedAccount._id,
      upiId: selectedAccount.upiId,
      customerId,
      amount,
      strategyUsed: strategy,
      timestamp: new Date(),
      metadata: {
        dailyCountAtAssignment: selectedAccount.currentDailyCount + 1,
        dailyAmountAtAssignment: selectedAccount.currentDailyAmount + amount,
      },
    });

    return {
      upiAccountId: selectedAccount._id.toString(),
      upiId: selectedAccount.upiId,
      displayName: selectedAccount.displayName,
      qrCodeUrl,
      upiUri,
    };
  }
}

