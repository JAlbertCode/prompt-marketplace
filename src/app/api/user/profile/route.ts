import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET /api/user/profile - Get the current user's profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        credits: {
          select: {
            balance: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: user.createdAt,
      credits: user.credits?.balance || 0,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Error fetching user profile" },
      { status: 500 }
    );
  }
}

// PUT /api/user/profile - Update the current user's profile
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Error updating user profile" },
      { status: 500 }
    );
  }
}