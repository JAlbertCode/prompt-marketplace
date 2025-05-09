import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET /api/prompts/user - Get all prompts created by the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prompts = await prisma.prompt.findMany({
      where: {
        creatorId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        description: true,
        model: true,
        creatorFee: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            favorites: true,
            flows: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(prompts);
  } catch (error) {
    console.error("Error fetching user prompts:", error);
    return NextResponse.json(
      { error: "Error fetching user prompts" },
      { status: 500 }
    );
  }
}