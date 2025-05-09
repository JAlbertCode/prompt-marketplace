import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// DELETE /api/favorites/prompts/[id] - Remove a prompt from favorites
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const promptId = params.id;

    // Check if the favorite exists
    const favorite = await prisma.favoritePrompt.findUnique({
      where: {
        userId_promptId: {
          userId: session.user.id,
          promptId,
        },
      },
    });

    if (!favorite) {
      return NextResponse.json(
        { error: "Favorite not found" },
        { status: 404 }
      );
    }

    // Remove from favorites
    await prisma.favoritePrompt.delete({
      where: {
        userId_promptId: {
          userId: session.user.id,
          promptId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing prompt from favorites:", error);
    return NextResponse.json(
      { error: "Error removing prompt from favorites" },
      { status: 500 }
    );
  }
}