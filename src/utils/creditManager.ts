import { PrismaClient, TransactionType } from "@prisma/client";
import { getModelById } from "@/lib/models/modelRegistry";

const prisma = new PrismaClient();

/**
 * Credit System Constants
 * 
 * 1 credit = $0.000001
 * Therefore, $1 = 1,000,000 credits
 * 
 * All pricing uses whole-number credits (no decimals)
 */

/**
 * Calculate the platform markup based on the inference cost
 * @param inferenceCost Base inference cost in credits
 * @param hasCreatorFee Whether there is a creator fee
 * @returns Platform markup in credits
 */
export function calculatePlatformMarkup(inferenceCost: number, hasCreatorFee: boolean = false): number {
  // If there's a creator fee, platform gets 20% of that instead of markup
  if (hasCreatorFee) {
    return 0;
  }
  
  // Platform gets 10% markup on all model costs when there's no creator fee
  return Math.floor(inferenceCost * 0.10);
}

/**
 * Retrieve user's credit balance
 * @param userId User ID
 * @returns Number of credits available
 */
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

/**
 * Add credits to user's account and record the transaction
 * @param userId User ID
 * @param amount Amount of credits to add
 * @param description Transaction description
 * @param type Transaction type
 * @returns New balance
 */
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

/**
 * Deduct credits from user's account and record the transaction
 * @param userId User ID
 * @param amount Amount of credits to deduct
 * @param description Transaction description
 * @param type Transaction type
 * @returns New balance or null if insufficient credits
 */
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

/**
 * Calculate the cost of running a prompt
 * @param promptId Prompt ID
 * @param modelId Model ID
 * @param promptLength Optional prompt length (short, medium, long)
 * @param promptText Optional prompt text to estimate length if promptLength not provided
 * @returns Cost breakdown
 */
export async function calculatePromptRunCost(
  promptId: string,
  modelId: string,
  promptLength?: 'short' | 'medium' | 'long',
  promptText?: string
): Promise<{ inferenceCost: number; creatorFee: number; platformMarkup: number; totalCost: number }> {
  // Get creator fee
  const prompt = await prisma.prompt.findUnique({
    where: {
      id: promptId,
    },
    select: {
      creatorFee: true,
      creatorId: true,
      content: true,
    },
  });

  const creatorFee = prompt?.creatorFee || 0;
  
  // Get model info
  const model = getModelById(modelId);
  if (!model) {
    throw new Error(`Model ${modelId} not found`);
  }
  
  // Determine prompt length if not provided
  let effectivePromptLength = promptLength || 'medium';
  
  if (!promptLength && promptText) {
    // Estimate length from provided text
    effectivePromptLength = estimatePromptLength(promptText);
  } else if (!promptLength && prompt?.content) {
    // Estimate length from prompt content
    effectivePromptLength = estimatePromptLength(prompt.content);
  }
  
  // Get inference cost based on prompt length from model cost table
  const inferenceCost = model.cost[effectivePromptLength];
  
  // Calculate platform markup - only apply if no creator fee
  const hasCreatorFee = creatorFee > 0;
  const platformMarkup = calculatePlatformMarkup(inferenceCost, hasCreatorFee);
  
  // Total cost
  const totalCost = inferenceCost + creatorFee + platformMarkup;

  return {
    inferenceCost,
    creatorFee,
    platformMarkup,
    totalCost,
  };
}

/**
 * Estimate prompt length based on text content
 * @param text The text content to analyze
 * @returns The estimated prompt length category
 */
export function estimatePromptLength(text: string): 'short' | 'medium' | 'long' {
  const charCount = text.length;
  
  if (charCount < 1500) {
    return 'short';
  } else if (charCount < 6000) {
    return 'medium';
  } else {
    return 'long';
  }
}

/**
 * Charge user for running a prompt and distribute fees
 * @param userId User ID
 * @param promptId Prompt ID
 * @param modelId Model ID
 * @param promptLength Optional prompt length (short, medium, long)
 * @param promptText Optional prompt text to estimate length if promptLength not provided
 * @returns Success status and cost breakdown
 */
export async function chargeForPromptRun(
  userId: string,
  promptId: string,
  modelId: string,
  promptLength?: 'short' | 'medium' | 'long',
  promptText?: string
): Promise<{success: boolean, costBreakdown?: {inferenceCost: number, creatorFee: number, platformMarkup: number, totalCost: number}}> {
  try {
    const { inferenceCost, creatorFee, platformMarkup, totalCost } = await calculatePromptRunCost(
      promptId,
      modelId,
      promptLength,
      promptText
    );

    // Deduct credits from user
    const remainingBalance = await deductCredits(
      userId,
      totalCost,
      `Prompt run: ${promptId} using model: ${modelId}`,
      "PROMPT_RUN"
    );

    if (remainingBalance === null) {
      return { success: false }; // Not enough credits
    }

    // If there's a creator fee, pay the creator (80% to creator, 20% to platform)
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
        // Calculate creator portion (80% of the fee)
        const creatorPortion = Math.floor(creatorFee * 0.8);
        
        await addCredits(
          prompt.creatorId,
          creatorPortion,
          `Creator payment for prompt: ${prompt.title}`,
          "CREATOR_PAYMENT"
        );
        
        // The platform fee is already kept as part of the transaction
      }
    }

    // Record the prompt run with cost details
    await prisma.promptRun.create({
      data: {
        userId,
        promptId,
        model: modelId,
        cost: totalCost,
        inferenceCost,
        creatorFee,
        platformFee: platformMarkup,
        promptLength: promptLength || estimatePromptLength(promptText || '')
      }
    });

    return { 
      success: true, 
      costBreakdown: {
        inferenceCost,
        creatorFee,
        platformMarkup,
        totalCost
      } 
    };
  } catch (error) {
    console.error('Error charging for prompt run:', error);
    return { success: false };
  }
}

/**
 * Calculate the cost of running a flow
 * @param flowId Flow ID
 * @returns Cost breakdown
 */
export async function calculateFlowRunCost(
  flowId: string
): Promise<{ stepCosts: Array<{ stepId: string; inferenceCost: number; creatorFee: number; platformMarkup: number; totalStepCost: number }>; totalCost: number }> {
  // Get flow details with steps
  const flow = await prisma.flow.findUnique({
    where: {
      id: flowId,
    },
    include: {
      steps: {
        include: {
          prompt: true,
        },
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  if (!flow) {
    return { stepCosts: [], totalCost: 0 };
  }

  const stepCosts = await Promise.all(
    flow.steps.map(async (step) => {
      // Calculate cost for each step
      const { inferenceCost, creatorFee, platformMarkup, totalCost } = await calculatePromptRunCost(
        step.promptId,
        step.model || "gpt-4o" // Default to gpt-4o if not specified
      );

      return {
        stepId: step.id,
        inferenceCost,
        creatorFee,
        platformMarkup,
        totalStepCost: totalCost,
      };
    })
  );

  // Sum up all step costs
  const totalCost = stepCosts.reduce((sum, step) => sum + step.totalStepCost, 0);

  return {
    stepCosts,
    totalCost,
  };
}

/**
 * Charge user for running a flow and distribute fees
 * @param userId User ID
 * @param flowId Flow ID
 * @returns Success status
 */
export async function chargeForFlowRun(
  userId: string,
  flowId: string
): Promise<boolean> {
  const { stepCosts, totalCost } = await calculateFlowRunCost(flowId);

  if (totalCost === 0) {
    return true; // No charge for empty flows
  }

  // Deduct total cost from user
  const remainingBalance = await deductCredits(
    userId,
    totalCost,
    `Flow run: ${flowId}`,
    "FLOW_RUN"
  );

  if (remainingBalance === null) {
    return false; // Not enough credits
  }

  // Process each step payment
  for (const stepCost of stepCosts) {
    const step = await prisma.flowStep.findUnique({
      where: {
        id: stepCost.stepId,
      },
      include: {
        prompt: true,
      },
    });

    if (step && step.prompt && step.prompt.creatorFee > 0) {
      // Pay the creator their fee (80% to creator, 20% to platform)
      const creatorPortion = Math.floor(step.prompt.creatorFee * 0.8);
      
      await addCredits(
        step.prompt.creatorId,
        creatorPortion,
        `Creator payment for prompt used in flow step: ${step.id}`,
        "CREATOR_PAYMENT"
      );
    }
  }

  return true;
}

/**
 * Charge user for unlocking a flow and distribute fees
 * @param userId User ID
 * @param flowId Flow ID
 * @returns Success status
 */
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

  if (!flow || flow.unlockFee === null || flow.unlockFee === 0) {
    return true; // Flow is free
  }

  const unlockFee = flow.unlockFee;
  // Platform takes 20% of the unlock fee
  const platformFee = Math.floor(unlockFee * 0.2);
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

  // Pay the creator their 80%
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

/**
 * Check if a user has unlocked a flow
 * @param userId User ID
 * @param flowId Flow ID
 * @returns Whether the user has access
 */
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
  if (flow.unlockFee === null || flow.unlockFee === 0) {
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

/**
 * Get transaction history for a user
 * @param userId User ID
 * @param page Page number
 * @param limit Items per page
 * @returns Transactions with pagination
 */
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

/**
 * Get detailed transaction statistics for admin dashboard
 * @returns Transaction statistics
 */
export async function getTransactionStatistics() {
  const totalInference = await prisma.creditTransaction.aggregate({
    where: {
      type: {
        in: ["PROMPT_RUN", "FLOW_RUN"]
      }
    },
    _sum: {
      amount: true
    }
  });

  const totalCreatorPayments = await prisma.creditTransaction.aggregate({
    where: {
      type: "CREATOR_PAYMENT"
    },
    _sum: {
      amount: true
    }
  });

  const totalPurchases = await prisma.creditTransaction.aggregate({
    where: {
      type: "CREDIT_PURCHASE"
    },
    _sum: {
      amount: true
    }
  });

  const modelUsage = await prisma.$queryRaw`
    SELECT model, COUNT(*) as runs, SUM(cost) as totalCost
    FROM promptRuns
    GROUP BY model
    ORDER BY totalCost DESC
  `;

  return {
    totalInference: Math.abs(totalInference._sum.amount || 0),
    totalCreatorPayments: totalCreatorPayments._sum.amount || 0,
    totalPurchases: totalPurchases._sum.amount || 0,
    platformRevenue: Math.abs(totalInference._sum.amount || 0) - (totalCreatorPayments._sum.amount || 0),
    modelUsage
  };
}

/**
 * Get credit dollar value (for display purposes)
 * @param credits Number of credits
 * @returns Dollar value as a string
 */
export function creditsToDollars(credits: number): string {
  // 1 credit = $0.000001
  const dollars = credits * 0.000001;
  
  if (dollars < 0.01) {
    // Use scientific notation for very small amounts
    return `$${dollars.toExponential(6)}`;
  }
  
  return `$${dollars.toFixed(6)}`;
}

/**
 * Convert dollars to credits
 * @param dollars Dollar amount
 * @returns Number of credits (rounded to whole number)
 */
export function dollarsToCredits(dollars: number): number {
  // $1 = 1,000,000 credits
  return Math.round(dollars * 1_000_000);
}