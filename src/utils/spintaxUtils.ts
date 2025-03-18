
/**
 * Spintax processing utilities for message variation
 * Format: {option1|option2|option3}
 */

// Parse spintax-formatted text and return a random variation
export function parseSpintax(text: string): string {
  // Base case: no more spintax patterns
  if (!text.includes('{') || !text.includes('}')) {
    return text;
  }
  
  // Find the first spintax pattern
  return text.replace(/\{([^{}]*)\}/g, (match, options) => {
    // Split options and select a random one
    const optionsArray = options.split('|');
    const randomOption = optionsArray[Math.floor(Math.random() * optionsArray.length)];
    
    // Recursively parse any nested spintax
    return parseSpintax(randomOption);
  });
}

// Validate spintax syntax
export function validateSpintax(text: string): { isValid: boolean; error: string | null } {
  // Check for balanced braces
  let openBraces = 0;
  
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '{') {
      openBraces++;
    } else if (text[i] === '}') {
      openBraces--;
      
      // Closing brace without opening brace
      if (openBraces < 0) {
        return { 
          isValid: false, 
          error: `Unexpected closing brace at position ${i}` 
        };
      }
    }
  }
  
  // Unmatched opening braces
  if (openBraces > 0) {
    return { 
      isValid: false, 
      error: 'Missing closing brace(s)' 
    };
  }
  
  // Check for empty option sets
  const emptyOptionSet = /\{\s*\}/g.test(text);
  if (emptyOptionSet) {
    return { 
      isValid: false, 
      error: 'Empty option set found {}' 
    };
  }
  
  // All checks passed
  return { isValid: true, error: null };
}

/**
 * Generate a random delay within a specified range
 * @param minSeconds Minimum delay in seconds
 * @param maxSeconds Maximum delay in seconds
 * @returns Delay in milliseconds
 */
export function getRandomDelay(minSeconds: number, maxSeconds: number): number {
  // Convert to milliseconds and calculate a random value in the range
  const minMs = minSeconds * 1000;
  const maxMs = maxSeconds * 1000;
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}
