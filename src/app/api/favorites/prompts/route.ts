import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET /api/favorites/prompts - Get all favorite prompts for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const favoritePrompts = await prisma.favoritePrompt.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        prompt: {
          select: {
            id: true,
            title: true,
            description: true,
            model: true,
            creatorFee: true,
            isPublished: true,
            createdAt: true,
            creator: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const prompts = favoritePrompts.map((favorite) => favorite.prompt);
    return NextResponse.json(prompts);
  } catch (error) {
    console.error("Error fetching favorite prompts:", error);
    return NextResponse.json(
      { error: "Error fetching favorite prompts" },
      { status: 500 }
    );
  }
}

// POST /api/favorites/prompts - Add a prompt to favorites
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { promptId } = body;

    if (!promptId) {
      return NextResponse.json(
        { error: "Prompt ID is required" },
        { status: 400 }
      );
    }

    // Check if the prompt exists
    const prompt = await prisma.prompt.findUnique({
      where: {
        id: promptId,
      },
    });

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt not found" },
        { status: 404 }
      );
    }

    // Check if already favorited
    const existingFavorite = await prisma.favoritePrompt.findUnique({
      where: {
        userId_promptId: {
          userId: session.user.id,
          promptId,
        },
      },
    });

    if (existingFavorite) {
      return NextResponse.json(
        { error: "Prompt already in favorites" },
        { status: 400 }
      );
    }

    // Add to favorites
    await prisma.favoritePrompt.create({
      data: {
        userId: session.user.id,
        promptId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding prompt to favorites:", error);
    return NextResponse.json(
      { error: "Error adding prompt to favorites" },
      { status: 500 }
    );
  }
}