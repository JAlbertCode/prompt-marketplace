import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET /api/flows/user - Get all flows created by the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const flows = await prisma.flow.findMany({
      where: {
        creatorId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        description: true,
        unlockFee: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            favorites: true,
            unlocks: true,
            prompts: true,
          },
        },
        prompts: {
          select: {
            order: true,
            prompt: {
              select: {
                id: true,
                title: true,
                model: true,
              },
            },
          },
          orderBy: {
            order: "asc",
          },
          take: 3, // Just get the first few prompts for preview
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(flows);
  } catch (error) {
    console.error("Error fetching user flows:", error);
    return NextResponse.json(
      { error: "Error fetching user flows" },
      { status: 500 }
    );
  }
}