/**
 * Helper functions for working with credits
 */

/**
 * Format a credit amount with appropriate abbreviations
 * @param credits The number of credits to format
 * @returns Formatted string representation
 */
export function formatCredits(credits: number): string {
  if (credits >= 1_000_000_000) {
    return `${(credits / 1_000_000_000).toFixed(1)}B`;
  } else if (credits >= 1_000_000) {
    return `${(credits / 1_000_000).toFixed(1)}M`;
  } else if (credits >= 1_000) {
    return `${(credits / 1_000).toFixed(1)}K`;
  }
  return credits.toLocaleString();
}

/**
 * Calculate tier recommendation based on monthly burn
 * @param monthlyBurn Monthly credit burn rate
 * @returns Recommended credit package
 */
export function getRecommendedPackage(monthlyBurn: number): string {
  if (monthlyBurn >= 1_400_000) return 'enterprise';
  if (monthlyBurn >= 600_000) return '100m';
  if (monthlyBurn >= 300_000) return '50m';
  if (monthlyBurn >= 100_000) return '25m';
  return '10m';
}

/**
 * Calculate monthly credit bonus based on usage
 * @param monthlyBurn Monthly credit burn rate
 * @returns Bonus credit amount
 */
export function getMonthlyBonus(monthlyBurn: number): number {
  if (monthlyBurn >= 1_400_000) return 400_000;
  if (monthlyBurn >= 600_000) return 100_000;
  if (monthlyBurn >= 300_000) return 40_000;
  if (monthlyBurn >= 100_000) return 10_000;
  return 0;
}

/**
 * Determine if a user is eligible for enterprise tier
 * @param monthlyBurn Monthly credit burn rate
 * @returns Boolean indicating eligibility
 */
export function isEnterpriseEligible(monthlyBurn: number): boolean {
  return monthlyBurn >= 1_400_000;
}

/**
 * Convert credits to USD value
 * 1 credit = $0.000001 USD
 * @param credits Number of credits
 * @returns USD value as a floating point number
 */
export function creditsToUSD(credits: number): number {
  return credits * 0.000001;
}

/**
 * Convert USD to credits
 * $1 USD = 1,000,000 credits
 * @param usd USD amount
 * @returns Number of credits
 */
export function usdToCredits(usd: number): number {
  return usd * 1_000_000;
}

/**
 * Credit packages configuration
 */
export const creditPackages = [
  {
    id: '10m',
    name: 'Starter',
    baseAmount: 10_000_000,
    bonusAmount: 0,
    price: 10,
    description: 'Basic package for occasional use'
  },
  {
    id: '25m',
    name: 'Professional',
    baseAmount: 25_000_000,
    bonusAmount: 2_500_000,
    price: 25,
    description: 'Popular choice for regular users'
  },
  {
    id: '50m',
    name: 'Business',
    baseAmount: 50_000_000,
    bonusAmount: 7_500_000,
    price: 50,
    description: 'For teams and power users'
  },
  {
    id: '100m',
    name: 'Premium',
    baseAmount: 100_000_000,
    bonusAmount: 20_000_000,
    price: 100,
    description: 'Best value for high-volume usage'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    baseAmount: 100_000_000,
    bonusAmount: 40_000_000,
    price: 100,
    description: 'For organizations with very high usage',
    requiresApproval: true
  }
];
