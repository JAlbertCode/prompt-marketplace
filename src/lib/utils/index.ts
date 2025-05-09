/**
 * PromptFlow utility functions
 */

/**
 * Format a number with commas for thousands separators
 * @param num The number to format
 * @returns Formatted number string with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

/**
 * Format a credit amount to a readable string with appropriate units
 * @param credits Amount of credits to format
 * @returns Formatted credit string (e.g., "1.5M", "950K", "1,200")
 */
export function formatCredits(credits: number): string {
  if (credits >= 1_000_000) {
    return `${(credits / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}M`;
  } else if (credits >= 1_000) {
    return `${(credits / 1_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}K`;
  } else {
    return formatNumber(credits);
  }
}

/**
 * Convert credits to USD
 * @param credits Amount of credits
 * @returns USD amount as a string with appropriate format
 */
export function creditsToUSD(credits: number): string {
  // 1 credit = $0.000001
  const dollars = credits * 0.000001;
  
  if (dollars >= 1) {
    // Format as dollars with 2 decimal places
    return `$${dollars.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else {
    // Format for very small amounts (less than $1)
    return `$${dollars.toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 6 })}`;
  }
}