/**
 * Utility functions for managing RAG content strictness.
 */

export function getDefaultStrictness(documentType: string): number {
  switch (documentType) {
    case 'framework':
      return 95;
    case 'best_practice':
      return 70;
    case 'company_insight':
    case 'company': // Handling both potential namings
      return 50;
    case 'question':
      return 30;
    default:
      return 50;
  }
}

export function getStrictnessInstruction(level: number): string {
  if (level >= 80) {
    return "CRITICAL: The following guidance is MANDATORY. Follow these instructions exactly as written. Include this advice in your response even if it seems unconventional.";
  } else if (level >= 50) {
    return "IMPORTANT: Use the following as strong guidance. Apply this advice unless you have a compelling reason to adapt it...";
  } else if (level >= 20) {
    return "REFERENCE: The following content should inform your response. Use your judgment to adapt this information...";
  } else {
    return "SUPPLEMENTARY: Consider the following as optional background information...";
  }
}

export function getDocumentStrictness(document: { type: string; strictnessOverride?: number | null }): number {
  if (document.strictnessOverride !== undefined && document.strictnessOverride !== null) {
    return document.strictnessOverride;
  }
  return getDefaultStrictness(document.type);
}

export function getStrictnessLabel(level: number): string {
  if (level >= 80) return "MANDATORY GUIDANCE";
  if (level >= 50) return "STRONG GUIDANCE";
  if (level >= 20) return "REFERENCE GUIDANCE";
  return "SUPPLEMENTARY GUIDANCE";
}
