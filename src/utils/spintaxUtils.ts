
/**
 * Utilities for handling spintax text formatting
 * Spintax format: "Hello {there|hi|howdy}, {how are you|what's up|how's it going}?"
 */

/**
 * Parse spintax text and return a random variation
 * @param text Text with spintax formatting
 * @returns Processed text with randomly selected variations
 */
export function parseSpintax(text: string): string {
  // Return the original text if it doesn't contain any spintax
  if (!text.includes('{') || !text.includes('}')) {
    return text;
  }

  // Replace each spintax pattern with a randomly selected option
  return text.replace(/\{([^{}]+)\}/g, (match, choices) => {
    const options = choices.split('|');
    const randomIndex = Math.floor(Math.random() * options.length);
    return options[randomIndex].trim();
  });
}

/**
 * Validate if the spintax syntax is correct
 * @param text Text with potential spintax formatting
 * @returns Object with validation result and error message if invalid
 */
export function validateSpintax(text: string): { isValid: boolean; error?: string } {
  if (!text.includes('{') && !text.includes('}')) {
    return { isValid: true };
  }

  // Count opening and closing braces
  const openBraces = (text.match(/\{/g) || []).length;
  const closeBraces = (text.match(/\}/g) || []).length;

  if (openBraces !== closeBraces) {
    return { 
      isValid: false, 
      error: `Mismatched braces: ${openBraces} opening and ${closeBraces} closing` 
    };
  }

  // Check for empty variations
  const emptyVariations = text.match(/\{\||\|\}/g);
  if (emptyVariations) {
    return { 
      isValid: false, 
      error: "Empty variations found. Format should be {option1|option2}" 
    };
  }

  // Check for nested braces (not supported in this simple implementation)
  const regex = /\{[^{}]*\{|\}[^{}]*\}/g;
  if (regex.test(text)) {
    return { 
      isValid: false, 
      error: "Nested spintax not supported. Use only one level of variations." 
    };
  }

  return { isValid: true };
}

/**
 * Generate random delay between a min and max value
 * @param min Minimum delay in seconds
 * @param max Maximum delay in seconds
 * @returns Delay in milliseconds
 */
export function getRandomDelay(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min) * 1000;
}
