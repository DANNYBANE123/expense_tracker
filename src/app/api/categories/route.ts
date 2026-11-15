import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Category from "@/models/Category";
import { getAuthUser } from "@/lib/auth/session";
import { categorySchema } from "@/lib/validations/category.schema";
import { seedDefaultCategories } from "@/lib/services/category.service";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Ensure default categories exist
    await seedDefaultCategories(user.id);

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    const query: any = { userId: new mongoose.Types.ObjectId(user.id) };
    if (type && type !== "all") {
      query.type = type;
    }

    const categories = await Category.find(query).sort({ type: 1, name: 1 }).lean();

    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = categorySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation error", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const { name, type, color, icon } = validated.data;

    // Check if category name already exists for this user and type
    const existing = await Category.findOne({
      userId: user.id,
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      type,
    });

    if (existing) {
      return NextResponse.json(
        { error: `A ${type} category named "${name}" already exists` },
        { status: 409 }
      );
    }

    const newCategory = await Category.create({
      userId: new mongoose.Types.ObjectId(user.id),
      name: name.trim(),
      type,
      color: color || "#6366f1",
      icon: icon || "Tag",
      isDefault: false,
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
