import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Category from "@/models/Category";
import Transaction from "@/models/Transaction";
import Budget from "@/models/Budget";
import RecurringTransaction from "@/models/RecurringTransaction";
import { getAuthUser } from "@/lib/auth/session";
import { seedDefaultCategories } from "@/lib/services/category.service";
import { rupeesToPaise } from "@/lib/utils/currency";
import { subMonths, subDays } from "date-fns";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const userId = new mongoose.Types.ObjectId(user.id);

    // 1. Seed categories
    await seedDefaultCategories(userId);
    const categories = await Category.find({ userId });

    const getCat = (name: string, type: "income" | "expense") => {
      return (
        categories.find((c) => c.name.toLowerCase() === name.toLowerCase() && c.type === type) ||
        categories.find((c) => c.type === type) ||
        categories[0]
      );
    };

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // 2. Clear old test data for this user to avoid clutter
    await Promise.all([
      Transaction.deleteMany({ userId }),
      Budget.deleteMany({ userId }),
      RecurringTransaction.deleteMany({ userId }),
    ]);

    // 3. Create realistic Budgets for this month
    const foodCat = getCat("Food", "expense");
    const shoppingCat = getCat("Shopping", "expense");
    const billsCat = getCat("Bills", "expense");
    const entertainmentCat = getCat("Entertainment", "expense");

    await Budget.create([
      {
        userId,
        categoryId: null,
        categoryName: "Overall Monthly Budget",
        amount: rupeesToPaise(75000), // ₹75,000
        month: currentMonth,
        year: currentYear,
        alertThreshold: 80,
      },
      {
        userId,
        categoryId: foodCat?._id,
        categoryName: "Food",
        amount: rupeesToPaise(15000), // ₹15,000
        month: currentMonth,
        year: currentYear,
        alertThreshold: 80,
      },
      {
        userId,
        categoryId: shoppingCat?._id,
        categoryName: "Shopping",
        amount: rupeesToPaise(12000), // ₹12,000
        month: currentMonth,
        year: currentYear,
        alertThreshold: 75,
      },
      {
        userId,
        categoryId: billsCat?._id,
        categoryName: "Bills",
        amount: rupeesToPaise(10000), // ₹10,000
        month: currentMonth,
        year: currentYear,
        alertThreshold: 85,
      },
    ]);

    // 4. Create Recurring Transactions
    const salaryCat = getCat("Salary", "income");
    const rentCat = getCat("Rent", "expense");

    await RecurringTransaction.create([
      {
        userId,
        amount: rupeesToPaise(85000),
        type: "income",
        categoryId: salaryCat._id,
        categoryName: salaryCat.name,
        description: "Monthly Tech Corp Salary",
        paymentMethod: "bank_transfer",
        frequency: "monthly",
        startDate: subMonths(now, 2),
        nextExecutionDate: new Date(currentYear, currentMonth - 1, 1),
        isActive: true,
      },
      {
        userId,
        amount: rupeesToPaise(22000),
        type: "expense",
        categoryId: rentCat._id,
        categoryName: rentCat.name,
        description: "Apartment Rent",
        paymentMethod: "bank_transfer",
        frequency: "monthly",
        startDate: subMonths(now, 2),
        nextExecutionDate: new Date(currentYear, currentMonth - 1, 5),
        isActive: true,
      },
      {
        userId,
        amount: rupeesToPaise(649),
        type: "expense",
        categoryId: entertainmentCat._id,
        categoryName: entertainmentCat.name,
        description: "Netflix 4K Subscription",
        paymentMethod: "credit_card",
        frequency: "monthly",
        startDate: subMonths(now, 3),
        nextExecutionDate: new Date(currentYear, currentMonth - 1, 15),
        isActive: true,
      },
    ]);

    // 5. Create Realistic Transactions across 3 months
    const sampleTxData = [
      // Current Month
      { type: "income", cat: "Salary", amt: 85000, desc: "Primary Software Engineer Salary", daysAgo: 14, method: "bank_transfer" },
      { type: "income", cat: "Freelancing", amt: 18500, desc: "React Dashboard Freelance Project", daysAgo: 8, method: "upi" },
      { type: "expense", cat: "Rent", amt: 22000, desc: "Apartment Monthly Rent", daysAgo: 10, method: "bank_transfer" },
      { type: "expense", cat: "Food", amt: 3450, desc: "Weekly Gourmet Grocery Haul", daysAgo: 12, method: "upi" },
      { type: "expense", cat: "Food", amt: 1280, desc: "Swiggy Dinner Delivery", daysAgo: 9, method: "upi" },
      { type: "expense", cat: "Food", amt: 4800, desc: "Organic Supermarket Restock", daysAgo: 4, method: "credit_card" },
      { type: "expense", cat: "Food", amt: 2900, desc: "Dining with friends", daysAgo: 1, method: "upi" },
      { type: "expense", cat: "Shopping", amt: 6499, desc: "Nike Pegasus Running Shoes", daysAgo: 6, method: "credit_card" },
      { type: "expense", cat: "Shopping", amt: 3200, desc: "Zara Winter Apparel", daysAgo: 2, method: "credit_card" },
      { type: "expense", cat: "Bills", amt: 3200, desc: "Electricity & Fiber Internet Bill", daysAgo: 11, method: "net_banking" },
      { type: "expense", cat: "Transportation", amt: 1850, desc: "Uber Rides & Metro Card Recharge", daysAgo: 5, method: "upi" },
      { type: "expense", cat: "Entertainment", amt: 1499, desc: "IMAX Movie Tickets & Snacks", daysAgo: 3, method: "credit_card" },
      { type: "expense", cat: "Healthcare", amt: 1200, desc: "Pharmacy & Vitamin Supplements", daysAgo: 7, method: "cash" },

      // Last Month
      { type: "income", cat: "Salary", amt: 85000, desc: "Tech Corp Salary", daysAgo: 44, method: "bank_transfer" },
      { type: "income", cat: "Investments", amt: 7200, desc: "Mutual Fund Dividend Payout", daysAgo: 38, method: "bank_transfer" },
      { type: "expense", cat: "Rent", amt: 22000, desc: "Apartment Rent", daysAgo: 40, method: "bank_transfer" },
      { type: "expense", cat: "Food", amt: 8900, desc: "Grocery & Dining", daysAgo: 42, method: "upi" },
      { type: "expense", cat: "Shopping", amt: 4500, desc: "Amazon Electronics", daysAgo: 36, method: "credit_card" },
      { type: "expense", cat: "Bills", amt: 2800, desc: "Utility Bills", daysAgo: 39, method: "net_banking" },
      { type: "expense", cat: "Transportation", amt: 1400, desc: "Fuel & Metro", daysAgo: 35, method: "upi" },

      // 2 Months Ago
      { type: "income", cat: "Salary", amt: 85000, desc: "Tech Corp Salary", daysAgo: 74, method: "bank_transfer" },
      { type: "expense", cat: "Rent", amt: 22000, desc: "Apartment Rent", daysAgo: 70, method: "bank_transfer" },
      { type: "expense", cat: "Food", amt: 8200, desc: "Monthly Food & Provisions", daysAgo: 68, method: "upi" },
      { type: "expense", cat: "Shopping", amt: 3100, desc: "Books & Stationeries", daysAgo: 65, method: "cash" },
      { type: "expense", cat: "Bills", amt: 2950, desc: "Electricity & Gas Bill", daysAgo: 69, method: "net_banking" },
    ];

    const transactionsToInsert = sampleTxData.map((item) => {
      const cat = getCat(item.cat, item.type as "income" | "expense");
      const txDate = subDays(now, item.daysAgo);
      return {
        userId,
        amount: rupeesToPaise(item.amt),
        type: item.type,
        categoryId: cat._id,
        categoryName: cat.name,
        description: item.desc,
        date: txDate,
        paymentMethod: item.method,
      };
    });

    await Transaction.insertMany(transactionsToInsert);

    return NextResponse.json({
      message: "Sample financial data seeded successfully!",
      transactionsCount: transactionsToInsert.length,
      budgetsCount: 4,
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
