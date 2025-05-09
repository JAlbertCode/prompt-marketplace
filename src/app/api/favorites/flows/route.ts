import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET /api/favorites/flows - Get all favorite flows for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const favoriteFlows = await prisma.favoriteFlow.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        flow: {
          select: {
            id: true,
            title: true,
            description: true,
            unlockFee: true,
            isPublished: true,
            createdAt: true,
            creator: {
              select: {
                id: true,
                name: true,
                image: true,
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
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const flows = favoriteFlows.map((favorite) => favorite.flow);
    return NextResponse.json(flows);
  } catch (error) {
    console.error("Error fetching favorite flows:", error);
    return NextResponse.json(
      { error: "Error fetching favorite flows" },
      { status: 500 }
    );
  }
}

// POST /api/favorites/flows - Add a flow to favorites
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { flowId } = body;

    if (!flowId) {
      return NextResponse.json(
        { error: "Flow ID is required" },
        { status: 400 }
      );
    }

    // Check if the flow exists
    const flow = await prisma.flow.findUnique({
      where: {
        id: flowId,
      },
    });

    if (!flow) {
      return NextResponse.json(
        { error: "Flow not found" },
        { status: 404 }
      );
    }

    // Check if already favorited
    const existingFavorite = await prisma.favoriteFlow.findUnique({
      where: {
        userId_flowId: {
          userId: session.user.id,
          flowId,
        },
      },
    });

    if (existingFavorite) {
      return NextResponse.json(
        { error: "Flow already in favorites" },
        { status: 400 }
      );
    }

    // Add to favorites
    await prisma.favoriteFlow.create({
      data: {
        userId: session.user.id,
        flowId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding flow to favorites:", error);
    return NextResponse.json(
      { error: "Error adding flow to favorites" },
      { status: 500 }
    );
  }
}