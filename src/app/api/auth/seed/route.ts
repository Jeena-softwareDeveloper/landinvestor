import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Land from '@/models/Land';
import Customer from '@/models/Customer';
import Investment from '@/models/Investment';
import Transaction from '@/models/Transaction';
import DailyReturn from '@/models/DailyReturn';
import Withdrawal from '@/models/Withdrawal';
import AuditLog from '@/models/AuditLog';

export async function POST() {
  try {
    await connectDB();

    // 1. Seed or update Admin User
    let admin = await User.findOne({ email: 'admin@landvest.com' });
    if (!admin) {
      admin = new User({
        name: 'Super Administrator',
        email: 'admin@landvest.com',
        password: 'password123',
        role: 'admin',
        isActive: true,
      });
      await admin.save();
    }

    // 2. Check if lands exist, if not seed
    const landCount = await Land.countDocuments();
    let seededLands: any[] = [];
    if (landCount === 0) {
      const landsData = [
        {
          name: 'Green Meadows Agro Estate',
          location: 'Devanahalli, Bengaluru, Karnataka',
          surveyNumber: 'SY-142/2A',
          totalArea: 43560, // 1 Acre in sqft
          totalValue: 25000000, // ₹2.5 Cr
          availableInvestment: 10000000,
          totalInvested: 15000000,
          investmentPercentage: 60,
          images: [
            'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?w=800&auto=format&fit=crop',
          ],
          documents: ['survey_report.pdf', 'title_deed_clearance.pdf'],
          description:
            'Prime fertile agricultural land with active eucalyptus and teak plantation yielding regular harvesting lease income.',
          status: 'active',
          dailyReturnConfig: {
            defaultRate: 0.08, // 0.08% per day (~2.4% / month)
            isActive: true,
          },
        },
        {
          name: 'Silver Valley Commercial Belt',
          location: 'Shamshabad Outer Ring Road, Hyderabad, Telangana',
          surveyNumber: 'SY-88/4B',
          totalArea: 87120, // 2 Acres
          totalValue: 50000000, // ₹5 Cr
          availableInvestment: 20000000,
          totalInvested: 30000000,
          investmentPercentage: 60,
          images: [
            'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&auto=format&fit=crop',
          ],
          documents: ['government_sanction.pdf'],
          description:
            'Strategic commercial corridor land leased to logistic and warehouse container yards.',
          status: 'active',
          dailyReturnConfig: {
            defaultRate: 0.1, // 0.1% per day (~3% / month)
            isActive: true,
          },
        },
        {
          name: 'Palm Grove Orchard & Resort Zone',
          location: 'Wayanad High Ranges, Kerala',
          surveyNumber: 'SY-203/1C',
          totalArea: 65340, // 1.5 Acres
          totalValue: 35000000, // ₹3.5 Cr
          availableInvestment: 0,
          totalInvested: 35000000,
          investmentPercentage: 100,
          images: [
            'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop',
          ],
          documents: ['eco_tourism_license.pdf'],
          description:
            'Fully subscribed agro-tourism retreat generating premium weekend rental hospitality returns.',
          status: 'fully_funded',
          dailyReturnConfig: {
            defaultRate: 0.09,
            isActive: true,
          },
        },
        {
          name: 'Crystal Horizon Industrial Park',
          location: 'Sanand Industrial Area, Ahmedabad, Gujarat',
          surveyNumber: 'SY-312/5',
          totalArea: 130680, // 3 Acres
          totalValue: 75000000, // ₹7.5 Cr
          availableInvestment: 55000000,
          totalInvested: 20000000,
          investmentPercentage: 26.67,
          images: [
            'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop',
          ],
          documents: ['industrial_na_order.pdf', 'fire_noc.pdf'],
          description:
            'Heavy industrial NA approved plotted parcel ready for long-term lease to auto component manufacturers.',
          status: 'active',
          dailyReturnConfig: {
            defaultRate: 0.12,
            isActive: true,
          },
        },
      ];
      seededLands = await Land.insertMany(landsData);
    } else {
      seededLands = await Land.find();
    }

    // 3. Seed Customers if empty
    const customerCount = await Customer.countDocuments();
    let seededCustomers: any[] = [];
    if (customerCount === 0) {
      const customersData = [
        {
          customerId: 'CUST-10001',
          fullName: 'Rajesh Kumar Sharma',
          mobile: '9845012345',
          email: 'rajesh.sharma@example.com',
          address: '42, 4th Cross, Indiranagar, Bengaluru, KA',
          kycStatus: 'verified',
          bankDetails: {
            accountHolderName: 'Rajesh Kumar Sharma',
            accountNumber: '50100234567890',
            ifscCode: 'HDFC0000053',
            bankName: 'HDFC Bank',
          },
          upiId: 'rajesh.sharma@okhdfcbank',
          accountStatus: 'active',
        },
        {
          customerId: 'CUST-10002',
          fullName: 'Priya Narayanan',
          mobile: '9876543210',
          email: 'priya.narayanan@example.com',
          address: '15/B, Anna Nagar West, Chennai, TN',
          kycStatus: 'verified',
          bankDetails: {
            accountHolderName: 'Priya Narayanan',
            accountNumber: '91802003456781',
            ifscCode: 'UTIB0000123',
            bankName: 'Axis Bank',
          },
          upiId: 'priyan@axisbank',
          accountStatus: 'active',
        },
        {
          customerId: 'CUST-10003',
          fullName: 'Vikramaditya Mehta',
          mobile: '9820011223',
          email: 'vikram.mehta@example.com',
          address: '702, Sea Green Heights, Worli, Mumbai, MH',
          kycStatus: 'verified',
          bankDetails: {
            accountHolderName: 'Vikramaditya Mehta',
            accountNumber: '00210400012345',
            ifscCode: 'ICIC0000021',
            bankName: 'ICICI Bank',
          },
          upiId: 'vmehta@icici',
          accountStatus: 'active',
        },
        {
          customerId: 'CUST-10004',
          fullName: 'Ananya Deshmukh',
          mobile: '9923456789',
          email: 'ananya.deshmukh@example.com',
          address: '24, Model Colony, Shivajinagar, Pune, MH',
          kycStatus: 'pending',
          bankDetails: {
            accountHolderName: 'Ananya Deshmukh',
            accountNumber: '32014567890',
            ifscCode: 'SBIN0001234',
            bankName: 'State Bank of India',
          },
          upiId: 'ananya@oksbi',
          accountStatus: 'active',
        },
      ];
      seededCustomers = await Customer.insertMany(customersData);
    } else {
      seededCustomers = await Customer.find();
    }

    // 4. Seed Investments if empty
    const investmentCount = await Investment.countDocuments();
    let seededInvestments: any[] = [];
    if (investmentCount === 0 && seededLands.length > 0 && seededCustomers.length > 0) {
      const investmentsData = [
        {
          customerId: seededCustomers[0]._id,
          landId: seededLands[0]._id,
          amount: 5000000, // ₹50 Lakhs
          startDate: new Date('2024-01-15'),
          duration: 24, // 24 months
          returnRate: 0.08, // 0.08% / day
          status: 'active',
          paymentReference: 'UPI/401568912301/HDFC',
          investmentPercentage: 20,
          dailyAccruedReturn: 4000,
          monthlyAccruedReturn: 120000,
          totalAccruedReturn: 720000,
          maturityAmount: 7880000,
          notes: 'Standard lease allocation for plot section A',
        },
        {
          customerId: seededCustomers[1]._id,
          landId: seededLands[1]._id,
          amount: 10000000, // ₹1 Cr
          startDate: new Date('2024-02-01'),
          duration: 36,
          returnRate: 0.1,
          status: 'active',
          paymentReference: 'NEFT/AXIS/9988221100',
          investmentPercentage: 20,
          dailyAccruedReturn: 10000,
          monthlyAccruedReturn: 300000,
          totalAccruedReturn: 1800000,
          maturityAmount: 20800000,
          notes: 'Commercial logistics yard parcel',
        },
        {
          customerId: seededCustomers[2]._id,
          landId: seededLands[0]._id,
          amount: 10000000, // ₹1 Cr
          startDate: new Date('2024-03-10'),
          duration: 12,
          returnRate: 0.08,
          status: 'active',
          paymentReference: 'RTGS/ICIC/87654321',
          investmentPercentage: 40,
          dailyAccruedReturn: 8000,
          monthlyAccruedReturn: 240000,
          totalAccruedReturn: 1200000,
          maturityAmount: 12880000,
          notes: 'High-yield agro parcel allocation',
        },
      ];
      seededInvestments = await Investment.insertMany(investmentsData);
    } else {
      seededInvestments = await Investment.find();
    }

    // 5. Seed Transactions if empty
    const txCount = await Transaction.countDocuments();
    if (txCount === 0 && seededCustomers.length > 0 && seededInvestments.length > 0) {
      const transactionsData = [
        {
          customerId: seededCustomers[0]._id,
          investmentId: seededInvestments[0]._id,
          type: 'deposit',
          amount: 5000000,
          upiId: 'rajesh.sharma@okhdfcbank',
          upiReference: 'UPI401568912301',
          transactionDate: new Date('2024-01-15'),
          paymentMethod: 'upi',
          adminNotes: 'Verified against HDFC statement #4812',
          status: 'completed',
          verifiedBy: admin._id,
          verifiedAt: new Date('2024-01-15'),
        },
        {
          customerId: seededCustomers[1]._id,
          investmentId: seededInvestments[1]._id,
          type: 'deposit',
          amount: 10000000,
          upiId: 'priyan@axisbank',
          upiReference: 'NEFT9988221100',
          transactionDate: new Date('2024-02-01'),
          paymentMethod: 'bank_transfer',
          adminNotes: 'Axis Bank RTGS verified',
          status: 'completed',
          verifiedBy: admin._id,
          verifiedAt: new Date('2024-02-01'),
        },
        {
          customerId: seededCustomers[0]._id,
          investmentId: seededInvestments[0]._id,
          type: 'return_payment',
          amount: 120000,
          upiId: 'rajesh.sharma@okhdfcbank',
          upiReference: 'UPI408912345678',
          transactionDate: new Date('2024-02-15'),
          paymentMethod: 'upi',
          adminNotes: 'Monthly rental return payout',
          status: 'completed',
          verifiedBy: admin._id,
          verifiedAt: new Date('2024-02-15'),
        },
        {
          customerId: seededCustomers[2]._id,
          type: 'deposit',
          amount: 2500000,
          upiId: 'vmehta@icici',
          upiReference: 'UPI556677889900',
          transactionDate: new Date(),
          paymentMethod: 'upi',
          adminNotes: 'Pending bank receipt reconciliation',
          status: 'pending',
        },
      ];
      await Transaction.insertMany(transactionsData);
    }

    // 6. Seed Daily Returns if empty
    const returnCount = await DailyReturn.countDocuments();
    if (returnCount === 0 && seededInvestments.length > 0) {
      const today = new Date();
      const returnsData: any[] = [];
      // Generate last 5 days of returns
      for (let i = 0; i < 5; i++) {
        const returnDate = new Date();
        returnDate.setDate(today.getDate() - i);

        seededInvestments.forEach((inv) => {
          returnsData.push({
            investmentId: inv._id,
            customerId: inv.customerId,
            landId: inv.landId,
            date: returnDate,
            investmentAmount: inv.amount,
            returnRate: inv.returnRate,
            dailyReturnAmount: (inv.amount * inv.returnRate) / 100,
            status: i === 0 ? 'accrued' : i === 1 ? 'verified' : 'paid',
            paidAt: i > 1 ? returnDate : undefined,
            verifiedBy: i > 0 ? admin._id : undefined,
          });
        });
      }
      await DailyReturn.insertMany(returnsData);
    }

    // 7. Seed Withdrawals if empty
    const withdrawalCount = await Withdrawal.countDocuments();
    if (withdrawalCount === 0 && seededCustomers.length > 0) {
      const withdrawalsData = [
        {
          customerId: seededCustomers[0]._id,
          requestedAmount: 150000,
          availableBalance: 420000,
          upiId: 'rajesh.sharma@okhdfcbank',
          bankDetails: seededCustomers[0].bankDetails,
          requestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          status: 'pending',
          notes: 'Customer requested accrued rental income withdrawal',
        },
        {
          customerId: seededCustomers[1]._id,
          requestedAmount: 300000,
          availableBalance: 850000,
          upiId: 'priyan@axisbank',
          bankDetails: seededCustomers[1].bankDetails,
          requestDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          status: 'paid',
          approvedBy: admin._id,
          approvedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          paymentReference: 'NEFT/AXIS/WD-889911',
          paymentProof: 'payment_advice_889911.pdf',
        },
      ];
      await Withdrawal.insertMany(withdrawalsData);
    }

    // 8. Add Audit Log
    await AuditLog.create({
      userId: admin._id,
      action: 'SYSTEM_SEEDED',
      module: 'system',
      details: { message: 'Database initialized with demo enterprise dataset' },
    });

    return NextResponse.json({
      success: true,
      message: 'System database successfully seeded with realistic enterprise land investment data!',
      admin: {
        email: 'admin@landvest.com',
        defaultPassword: 'password123',
      },
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Seeding failed' },
      { status: 500 }
    );
  }
}
