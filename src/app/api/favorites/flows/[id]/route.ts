import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// DELETE /api/favorites/flows/[id] - Remove a flow from favorites
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const flowId = params.id;

    // Check if the favorite exists
    const favorite = await prisma.favoriteFlow.findUnique({
      where: {
        userId_flowId: {
          userId: session.user.id,
          flowId,
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
    await prisma.favoriteFlow.delete({
      where: {
        userId_flowId: {
          userId: session.user.id,
          flowId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing flow from favorites:", error);
    return NextResponse.json(
      { error: "Error removing flow from favorites" },
      { status: 500 }
    );
  }
}