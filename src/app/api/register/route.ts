import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validations/auth.schema";
import { seedDefaultCategories } from "@/lib/services/category.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = registerSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: validatedData.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, password } = validatedData.data;

    await connectToDatabase();

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      currency: "INR",
      defaultMonthlyBudget: 5000000, // ₹50,000
    });

    // Seed default income and expense categories for this user
    await seedDefaultCategories(newUser._id);

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create user account" },
      { status: 500 }
    );
  }
}
