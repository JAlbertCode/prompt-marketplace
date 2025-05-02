import { PrismaClient, TransactionType } from "@prisma/client";

const prisma = new PrismaClient();

export async function getUserCredits(userId: string): Promise<number> {
  const userCredits = await prisma.userCredits.findUnique({
    where: {
      userId,
    },
    select: {
      balance: true,
    },
  });

  return userCredits?.balance || 0;
}

export async function addCredits(
  userId: string,
  amount: number,
  description: string,
  type: TransactionType
): Promise<number> {
  // Find or create user credits
  let userCredits = await prisma.userCredits.findUnique({
    where: {
      userId,
    },
  });

  if (!userCredits) {
    userCredits = await prisma.userCredits.create({
      data: {
        userId,
        balance: 0,
      },
    });
  }

  // Update the balance
  const updatedCredits = await prisma.userCredits.update({
    where: {
      userId,
    },
    data: {
      balance: {
        increment: amount,
      },
    },
  });

  // Record the transaction
  await prisma.creditTransaction.create({
    data: {
      userId,
      amount,
      description,
      type,
    },
  });

  return updatedCredits.balance;
}

export async function deductCredits(
  userId: string,
  amount: number,
  description: string,
  type: TransactionType
): Promise<number | null> {
  // Find user credits
  const userCredits = await prisma.userCredits.findUnique({
    where: {
      userId,
    },
  });

  if (!userCredits || userCredits.balance < amount) {
    return null; // Not enough credits
  }

  // Update the balance
  const updatedCredits = await prisma.userCredits.update({
    where: {
      userId,
    },
    data: {
      balance: {
        decrement: amount,
      },
    },
  });

  // Record the transaction
  await prisma.creditTransaction.create({
    data: {
      userId,
      amount: -amount, // Negative amount for deduction
      description,
      type,
    },
  });

  return updatedCredits.balance;
}

export async function calculatePromptRunCost(
  promptId: string,
  model: string
): Promise<{ systemCost: number; creatorFee: number; platformFee: number }> {
  // Get creator fee
  const prompt = await prisma.prompt.findUnique({
    where: {
      id: promptId,
    },
    select: {
      creatorFee: true,
      creatorId: true,
    },
  });

  const creatorFee = prompt?.creatorFee || 0;
  
  // Platform fee is waived if creator set a fee, otherwise it's 100 credits
  const platformFee = creatorFee > 0 ? 0 : 100;
  
  // System cost based on model
  let systemCost = 0;
  switch (model) {
    case "gpt-4":
      systemCost = 300; // $0.30 per run
      break;
    case "gpt-4o":
      systemCost = 200; // $0.20 per run
      break;
    case "gpt-image-1":
      systemCost = 500; // $0.50 per image
      break;
    default:
      systemCost = 100; // $0.10 per run for other models
  }

  return {
    systemCost,
    creatorFee,
    platformFee,
  };
}

export async function chargeForPromptRun(
  userId: string,
  promptId: string,
  model: string
): Promise<boolean> {
  const { systemCost, creatorFee, platformFee } = await calculatePromptRunCost(
    promptId,
    model
  );

  const totalCost = systemCost + creatorFee + platformFee;

  // Deduct credits from user
  const remainingBalance = await deductCredits(
    userId,
    totalCost,
    `Prompt run: ${promptId}`,
    "PROMPT_RUN"
  );

  if (remainingBalance === null) {
    return false; // Not enough credits
  }

  // If there's a creator fee, pay the creator
  if (creatorFee > 0) {
    const prompt = await prisma.prompt.findUnique({
      where: {
        id: promptId,
      },
      select: {
        creatorId: true,
        title: true,
      },
    });

    if (prompt) {
      await addCredits(
        prompt.creatorId,
        creatorFee,
        `Creator payment for prompt: ${prompt.title}`,
        "CREATOR_PAYMENT"
      );
    }
  }

  return true;
}

export async function chargeForFlowUnlock(
  userId: string,
  flowId: string
): Promise<boolean> {
  // Get flow details
  const flow = await prisma.flow.findUnique({
    where: {
      id: flowId,
    },
    select: {
      unlockFee: true,
      creatorId: true,
      title: true,
    },
  });

  if (!flow || flow.unlockFee === null) {
    return true; // Flow is free
  }

  const unlockFee = flow.unlockFee;
  const platformFee = Math.floor(unlockFee * 0.2); // 20% platform fee
  const creatorPayment = unlockFee - platformFee;
  
  // Deduct unlock fee from user
  const remainingBalance = await deductCredits(
    userId,
    unlockFee,
    `Flow unlock: ${flow.title}`,
    "FLOW_UNLOCK"
  );

  if (remainingBalance === null) {
    return false; // Not enough credits
  }

  // Pay the creator
  await addCredits(
    flow.creatorId,
    creatorPayment,
    `Creator payment for flow unlock: ${flow.title}`,
    "CREATOR_PAYMENT"
  );

  // Record the flow unlock
  await prisma.flowUnlock.create({
    data: {
      userId,
      flowId,
    },
  });

  return true;
}

export async function hasUnlockedFlow(userId: string, flowId: string): Promise<boolean> {
  // Check if the user is the creator of the flow
  const flow = await prisma.flow.findUnique({
    where: {
      id: flowId,
    },
    select: {
      creatorId: true,
      unlockFee: true,
    },
  });

  if (!flow) {
    return false; // Flow doesn't exist
  }

  // Creator always has access to their own flows
  if (flow.creatorId === userId) {
    return true;
  }

  // If flow is free, no unlock required
  if (flow.unlockFee === null) {
    return true;
  }

  // Check if user has unlocked this flow
  const unlock = await prisma.flowUnlock.findUnique({
    where: {
      userId_flowId: {
        userId,
        flowId,
      },
    },
  });

  return !!unlock;
}

export async function getUserTransactions(userId: string, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  const [transactions, total] = await Promise.all([
    prisma.creditTransaction.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.creditTransaction.count({
      where: {
        userId,
      },
    }),
  ]);

  return {
    transactions,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    },
  };
}