import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Land from '@/models/Land';
import Customer from '@/models/Customer';
import Investment from '@/models/Investment';
import Transaction from '@/models/Transaction';
import DailyReturn from '@/models/DailyReturn';
import Withdrawal from '@/models/Withdrawal';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const reportType = searchParams.get('type') || 'land_investment';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const landId = searchParams.get('landId') || '';
    const customerId = searchParams.get('customerId') || '';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any[] = [];
    let summary: any = {};

    switch (reportType) {
      case 'land_investment': {
        const query: any = {};
        if (landId && landId !== 'all') query._id = landId;
        const lands = await Land.find(query).lean();
        data = lands.map((l) => ({
          Name: l.name,
          Location: l.location,
          SurveyNumber: l.surveyNumber,
          TotalAreaSqFt: l.totalArea,
          TotalValue: l.totalValue,
          TotalInvested: l.totalInvested,
          AvailableInvestment: l.availableInvestment,
          FundedPercentage: `${l.investmentPercentage.toFixed(2)}%`,
          Status: l.status,
        }));
        summary = {
          totalLands: lands.length,
          totalValue: lands.reduce((s, l) => s + l.totalValue, 0),
          totalInvested: lands.reduce((s, l) => s + l.totalInvested, 0),
        };
        break;
      }

      case 'customer_investment': {
        const query: any = {};
        if (customerId && customerId !== 'all') query.customerId = customerId;
        const investments = await Investment.find(query)
          .populate('customerId', 'fullName customerId mobile')
          .populate('landId', 'name surveyNumber')
          .lean();

        data = investments.map((inv: any) => ({
          CustomerID: inv.customerId?.customerId,
          CustomerName: inv.customerId?.fullName,
          LandName: inv.landId?.name,
          SurveyNumber: inv.landId?.surveyNumber,
          Amount: inv.amount,
          ReturnRate: `${inv.returnRate}%/day`,
          StartDate: inv.startDate ? new Date(inv.startDate).toLocaleDateString() : '-',
          DurationMonths: inv.duration,
          DailyReturn: inv.dailyAccruedReturn,
          TotalAccrued: inv.totalAccruedReturn,
          Status: inv.status,
        }));
        summary = {
          totalInvestments: investments.length,
          totalAmount: investments.reduce((s, i) => s + i.amount, 0),
        };
        break;
      }

      case 'daily_returns': {
        const query: any = {};
        if (customerId && customerId !== 'all') query.customerId = customerId;
        if (landId && landId !== 'all') query.landId = landId;
        if (startDate || endDate) {
          query.date = {};
          if (startDate) query.date.$gte = new Date(startDate);
          if (endDate) query.date.$lte = new Date(endDate);
        }
        const returns = await DailyReturn.find(query)
          .populate('customerId', 'fullName customerId')
          .populate('landId', 'name')
          .sort({ date: -1 })
          .limit(500)
          .lean();

        data = returns.map((r: any) => ({
          Date: new Date(r.date).toLocaleDateString(),
          Customer: r.customerId?.fullName,
          Land: r.landId?.name,
          InvestmentPrincipal: r.investmentAmount,
          DailyReturnAmount: r.dailyReturnAmount,
          Status: r.status,
        }));
        summary = {
          totalAccrued: returns.reduce((s, r) => s + r.dailyReturnAmount, 0),
          recordCount: returns.length,
        };
        break;
      }

      case 'transactions': {
        const query: any = {};
        if (customerId && customerId !== 'all') query.customerId = customerId;
        if (startDate || endDate) {
          query.transactionDate = {};
          if (startDate) query.transactionDate.$gte = new Date(startDate);
          if (endDate) query.transactionDate.$lte = new Date(endDate);
        }
        const txs = await Transaction.find(query)
          .populate('customerId', 'fullName customerId')
          .sort({ transactionDate: -1 })
          .lean();

        data = txs.map((tx: any) => ({
          Date: new Date(tx.transactionDate).toLocaleDateString(),
          Customer: tx.customerId?.fullName,
          Type: tx.type,
          Amount: tx.amount,
          ReferenceUTR: tx.upiReference,
          Method: tx.paymentMethod,
          Status: tx.status,
          Notes: tx.adminNotes || '',
        }));
        summary = {
          totalTransactions: txs.length,
          totalAmount: txs.reduce((s, t) => s + t.amount, 0),
        };
        break;
      }

      case 'withdrawals': {
        const query: any = {};
        if (customerId && customerId !== 'all') query.customerId = customerId;
        const wds = await Withdrawal.find(query)
          .populate('customerId', 'fullName customerId upiId')
          .sort({ requestDate: -1 })
          .lean();

        data = wds.map((w: any) => ({
          RequestDate: new Date(w.requestDate).toLocaleDateString(),
          Customer: w.customerId?.fullName,
          RequestedAmount: w.requestedAmount,
          AvailableBalance: w.availableBalance,
          UPI: w.upiId,
          Status: w.status,
          PaymentReference: w.paymentReference || '-',
        }));
        summary = {
          totalWithdrawals: wds.length,
          totalPaid: wds
            .filter((w) => w.status === 'paid')
            .reduce((s, w) => s + w.requestedAmount, 0),
          totalPending: wds
            .filter((w) => w.status === 'pending')
            .reduce((s, w) => s + w.requestedAmount, 0),
        };
        break;
      }

      case 'liability': {
        // Outstanding Liability Report: Accrued returns pending payout + pending withdrawals
        const [pendingReturns, pendingWds, activeInvestments] = await Promise.all([
          DailyReturn.aggregate([
            { $match: { status: { $in: ['accrued', 'verified'] } } },
            { $group: { _id: null, total: { $sum: '$dailyReturnAmount' } } },
          ]),
          Withdrawal.aggregate([
            { $match: { status: 'pending' } },
            { $group: { _id: null, total: { $sum: '$requestedAmount' } } },
          ]),
          Investment.aggregate([
            { $match: { status: 'active' } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
          ]),
        ]);

        const accruedReturnsLiability = pendingReturns[0]?.total || 0;
        const pendingWithdrawalLiability = pendingWds[0]?.total || 0;
        const activePrincipalLiability = activeInvestments[0]?.total || 0;

        data = [
          {
            LiabilityCategory: 'Accrued Daily Returns (Pending Verification / Payout)',
            Amount: accruedReturnsLiability,
            RiskLevel: 'High Priority Current Liability',
          },
          {
            LiabilityCategory: 'Pending Customer Withdrawal Requests',
            Amount: pendingWithdrawalLiability,
            RiskLevel: 'Immediate Cashflow Requirement',
          },
          {
            LiabilityCategory: 'Active Land Principal Holdings (At Maturity)',
            Amount: activePrincipalLiability,
            RiskLevel: 'Long-term Capital Commitment',
          },
        ];

        summary = {
          totalImmediateLiability: accruedReturnsLiability + pendingWithdrawalLiability,
          totalPrincipalUnderManagement: activePrincipalLiability,
        };
        break;
      }

      default: {
        data = [];
      }
    }

    return NextResponse.json({
      success: true,
      reportType,
      data,
      summary,
    });
  } catch (error: any) {
    console.error('Generate export report error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Report generation failed' },
      { status: 500 }
    );
  }
}
