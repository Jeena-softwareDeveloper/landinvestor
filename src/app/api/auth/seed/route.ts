import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import Land from '@/models/Land';
import Customer from '@/models/Customer';
import Investment from '@/models/Investment';
import Transaction from '@/models/Transaction';
import DailyReturn from '@/models/DailyReturn';
import Withdrawal from '@/models/Withdrawal';
import AuditLog from '@/models/AuditLog';
import UpiAccount from '@/models/UpiAccount';
import PaymentOrder from '@/models/PaymentOrder';
import PaymentTransaction from '@/models/PaymentTransaction';

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

    // 2. Seed Merchant UPI Accounts
    const upiCount = await UpiAccount.countDocuments();
    let seededUpi: any[] = [];
    if (upiCount === 0) {
      const upiData = [
        {
          upiId: 'landvest.merchant1@icici',
          displayName: 'LandVest Agro Escrow A',
          qrCode: '',
          provider: 'ICICI Merchant Banking',
          status: 'active',
          priority: 3,
          weight: 2,
          dailyTransactionLimit: 50,
          dailyCollectionLimit: 10000000,
          currentDailyCount: 3,
          currentDailyAmount: 750000,
          totalTransactions: 28,
          totalCollection: 14200000,
          lastResetDate: new Date(),
        },
        {
          upiId: 'landvest.merchant2@hdfc',
          displayName: 'LandVest Commercial SmartHub B',
          qrCode: '',
          provider: 'HDFC SmartHub Escrow',
          status: 'active',
          priority: 2,
          weight: 2,
          dailyTransactionLimit: 50,
          dailyCollectionLimit: 10000000,
          currentDailyCount: 1,
          currentDailyAmount: 500000,
          totalTransactions: 19,
          totalCollection: 9800000,
          lastResetDate: new Date(),
        },
        {
          upiId: 'landvest.merchant3@axis',
          displayName: 'LandVest Prime Estates C',
          qrCode: '',
          provider: 'Axis Pay Merchant Gateway',
          status: 'active',
          priority: 1,
          weight: 1,
          dailyTransactionLimit: 30,
          dailyCollectionLimit: 5000000,
          currentDailyCount: 0,
          currentDailyAmount: 0,
          totalTransactions: 12,
          totalCollection: 4600000,
          lastResetDate: new Date(),
        },
      ];
      seededUpi = await UpiAccount.insertMany(upiData);
    } else {
      seededUpi = await UpiAccount.find();
    }

    // 3. Seed Lands
    const landCount = await Land.countDocuments();
    let seededLands: any[] = [];
    if (landCount === 0) {
      const landsData = [
        {
          name: 'Green Meadows Agro Estate',
          location: 'Devanahalli, Bengaluru, Karnataka',
          surveyNumber: 'SY-142/2A',
          totalArea: 43560,
          totalValue: 25000000, // ₹2.5 Cr
          availableInvestment: 10000000,
          totalInvested: 15000000,
          investmentPercentage: 60,
          minInvestmentAmount: 50000,
          coverImage:
            'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&auto=format&fit=crop',
          ],
          documents: ['survey_report.pdf', 'title_deed_clearance.pdf', 'rera_acknowledgement.pdf'],
          description:
            'Prime fertile agricultural land with active eucalyptus and organic crops yielding certified lease revenue with institutional tenant agreements.',
          status: 'active',
          publicApproved: true,
          featured: true,
          rentalIncomeModel: {
            projectedAnnualYield: 14.4,
            distributionFrequency: 'monthly',
            tenantType: 'Agro Organics India Ltd',
            leaseDurationYears: 5,
          },
          dailyReturnConfig: {
            defaultRate: 0.08,
            isActive: true,
          },
        },
        {
          name: 'Silver Valley Commercial Belt',
          location: 'Shamshabad Outer Ring Road, Hyderabad, Telangana',
          surveyNumber: 'SY-88/4B',
          totalArea: 87120,
          totalValue: 50000000, // ₹5 Cr
          availableInvestment: 20000000,
          totalInvested: 30000000,
          investmentPercentage: 60,
          minInvestmentAmount: 100000,
          coverImage:
            'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&auto=format&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop',
          ],
          documents: ['government_sanction.pdf', 'encumbrance_certificate.pdf'],
          description:
            'Strategic commercial corridor land leased to container yards and logistics sorting hubs with locked 3-year escalation clauses.',
          status: 'active',
          publicApproved: true,
          featured: true,
          rentalIncomeModel: {
            projectedAnnualYield: 15.6,
            distributionFrequency: 'monthly',
            tenantType: 'OmniLogistics Express',
            leaseDurationYears: 6,
          },
          dailyReturnConfig: {
            defaultRate: 0.1,
            isActive: true,
          },
        },
        {
          name: 'Palm Grove Orchard & Resort Zone',
          location: 'Wayanad High Ranges, Kerala',
          surveyNumber: 'SY-203/1C',
          totalArea: 65340,
          totalValue: 35000000,
          availableInvestment: 0,
          totalInvested: 35000000,
          investmentPercentage: 100,
          minInvestmentAmount: 50000,
          coverImage:
            'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&auto=format&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&auto=format&fit=crop',
          ],
          documents: ['eco_tourism_license.pdf'],
          description:
            'Fully subscribed agro-tourism retreat generating weekend hospitality revenue managed by seasoned luxury retreat operators.',
          status: 'fully_funded',
          publicApproved: true,
          featured: false,
          rentalIncomeModel: {
            projectedAnnualYield: 13.2,
            distributionFrequency: 'monthly',
            tenantType: 'Hillcrest Retreats LLP',
            leaseDurationYears: 7,
          },
          dailyReturnConfig: {
            defaultRate: 0.09,
            isActive: true,
          },
        },
        {
          name: 'Crystal Horizon Industrial Park',
          location: 'Sanand Industrial Area, Ahmedabad, Gujarat',
          surveyNumber: 'SY-312/5',
          totalArea: 130680,
          totalValue: 75000000,
          availableInvestment: 55000000,
          totalInvested: 20000000,
          investmentPercentage: 26.67,
          minInvestmentAmount: 200000,
          coverImage:
            'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop',
          ],
          documents: ['industrial_na_order.pdf', 'fire_noc.pdf'],
          description:
            'Heavy industrial NA approved plotted parcel ready for long-term lease to auto component manufacturers and tier-1 assembly suppliers.',
          status: 'active',
          publicApproved: true,
          featured: true,
          rentalIncomeModel: {
            projectedAnnualYield: 16.8,
            distributionFrequency: 'monthly',
            tenantType: 'Precision Auto Tech',
            leaseDurationYears: 10,
          },
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

    // 4. Seed Customers with password: customer123
    const customerPasswordHash = await bcrypt.hash('customer123', 12);
    const customerCount = await Customer.countDocuments();
    let seededCustomers: any[] = [];
    if (customerCount === 0) {
      const customersData = [
        {
          customerId: 'CUST-10001',
          fullName: 'Rajesh Kumar Sharma',
          mobile: '9845012345',
          email: 'rajesh@example.com',
          password: customerPasswordHash,
          isVerified: true,
          mobileVerified: true,
          emailVerified: true,
          walletBalance: 24000,
          address: '42, 4th Cross, Indiranagar, Bengaluru, KA',
          kycStatus: 'verified',
          bankDetails: {
            accountHolderName: 'Rajesh Kumar Sharma',
            accountNumber: '50100234567890',
            bankName: 'HDFC Bank',
            ifscCode: 'HDFC0000053',
            branchName: 'Indiranagar',
          },
          upiId: 'rajesh.sharma@okhdfcbank',
          accountStatus: 'active',
        },
        {
          customerId: 'CUST-10002',
          fullName: 'Priya Nambiar',
          mobile: '9740123456',
          email: 'priya@example.com',
          password: customerPasswordHash,
          isVerified: true,
          mobileVerified: true,
          emailVerified: true,
          walletBalance: 58000,
          address: '15, Marine Drive, Kochi, KL',
          kycStatus: 'verified',
          bankDetails: {
            accountHolderName: 'Priya Nambiar',
            accountNumber: '918020034567890',
            bankName: 'Axis Bank',
            ifscCode: 'UTIB0000123',
            branchName: 'Kochi Main',
          },
          upiId: 'priyan@axisbank',
          accountStatus: 'active',
        },
        {
          customerId: 'CUST-10003',
          fullName: 'Vikramaditya Mehta',
          mobile: '9920123456',
          email: 'vikram@example.com',
          password: customerPasswordHash,
          isVerified: true,
          mobileVerified: true,
          emailVerified: true,
          walletBalance: 12000,
          address: '88, Worli Sea Face, Mumbai, MH',
          kycStatus: 'verified',
          bankDetails: {
            accountHolderName: 'Vikramaditya Mehta',
            accountNumber: '001105001234',
            bankName: 'ICICI Bank',
            ifscCode: 'ICIC0000011',
            branchName: 'Worli',
          },
          upiId: 'vmehta@icici',
          accountStatus: 'active',
        },
      ];
      seededCustomers = await Customer.insertMany(customersData);
    } else {
      // Ensure existing customers have password set if missing
      await Customer.updateMany(
        { $or: [{ password: '' }, { password: { $exists: false } }] },
        { $set: { password: customerPasswordHash, isVerified: true } }
      );
      seededCustomers = await Customer.find();
    }

    // 5. Seed Investments if empty
    const investmentCount = await Investment.countDocuments();
    let seededInvestments: any[] = [];
    if (investmentCount === 0 && seededLands.length > 0 && seededCustomers.length > 0) {
      const investmentsData = [
        {
          customerId: seededCustomers[0]._id,
          landId: seededLands[0]._id,
          amount: 5000000,
          startDate: new Date('2024-01-15'),
          duration: 24,
          returnRate: 0.08,
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
          amount: 10000000,
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
      ];
      seededInvestments = await Investment.insertMany(investmentsData);
    } else {
      seededInvestments = await Investment.find();
    }

    // 6. Seed Sample Payment Orders if empty
    const orderCount = await PaymentOrder.countDocuments();
    if (orderCount === 0 && seededCustomers.length > 0 && seededLands.length > 0 && seededUpi.length > 0) {
      const sampleOrders = [
        {
          orderId: 'ORD-20251116-44102',
          customerId: seededCustomers[0]._id,
          landId: seededLands[0]._id,
          amount: 250000,
          assignedUpiAccountId: seededUpi[0]._id,
          assignedUpiString: seededUpi[0].upiId,
          assignedUpiName: seededUpi[0].displayName,
          status: 'submitted',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          utr: 'UPI401568912301',
          customerNotes: 'Transferred via Google Pay to ICICI Escrow',
          submittedAt: new Date(),
        },
        {
          orderId: 'ORD-20251116-98214',
          customerId: seededCustomers[1]._id,
          landId: seededLands[1]._id,
          amount: 500000,
          assignedUpiAccountId: seededUpi[1]._id,
          assignedUpiString: seededUpi[1].upiId,
          assignedUpiName: seededUpi[1].displayName,
          status: 'initiated',
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      ];
      await PaymentOrder.insertMany(sampleOrders);

      // Add corresponding PaymentTransaction
      await PaymentTransaction.create({
        orderId: (await PaymentOrder.findOne({ orderId: 'ORD-20251116-44102' }))?._id,
        utr: 'UPI401568912301',
        amount: 250000,
        upiAccountId: seededUpi[0]._id,
        customerId: seededCustomers[0]._id,
        status: 'submitted',
        reconciliationSource: 'customer_submission',
      });
    }

    // 7. Seed Daily Returns
    const returnCount = await DailyReturn.countDocuments();
    if (returnCount === 0 && seededInvestments.length > 0) {
      const today = new Date();
      const returnsData: any[] = [];
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

    // 8. Add Audit Log
    await AuditLog.create({
      userId: admin._id,
      action: 'SYSTEM_SEEDED_V2',
      module: 'system',
      details: { message: 'Database initialized with 3-app architecture, UPI rotation & customer auth' },
    });

    return NextResponse.json({
      success: true,
      message: 'Platform seeded successfully with 3-app architecture & demo dataset!',
      credentials: {
        admin: { email: 'admin@landvest.com', password: 'password123' },
        customer: { email: 'rajesh@example.com', password: 'customer123' },
      },
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
