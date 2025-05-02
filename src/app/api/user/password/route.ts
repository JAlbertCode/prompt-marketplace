import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// PUT /api/user/password - Update the current user's password
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    // Get the user with the hashed password
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        hashedPassword: true,
      },
    });

    if (!user || !user.hashedPassword) {
      return NextResponse.json(
        { error: "User not found or no password set" },
        { status: 404 }
      );
    }

    // Verify the current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.hashedPassword
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update the password
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        hashedPassword,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating password:", error);
    return NextResponse.json(
      { error: "Error updating password" },
      { status: 500 }
    );
  }
}