/**
 * Quality scoring module for rice assessment.
 *
 * 4 criteria rated /5: visual aspect, homogeneity, cleanliness, husking
 * 1 separate indicator: humidity (%) — not included in global score average
 */

export interface QualityScores {
  visualAspect: number; // 1-5
  homogeneity: number; // 1-5
  cleanliness: number; // 1-5
  husking: number; // 1-5
  humidity: number; // 0-100 (%)
}

/**
 * Calculate the global quality score (average of the 4 criteria /5).
 * Humidity is tracked separately as an indicator, not in the average.
 * Returns a value between 1 and 5, rounded to 2 decimal places.
 */
export function calculateGlobalScore(scores: QualityScores): number {
  const { visualAspect, homogeneity, cleanliness, husking } = scores;
  const average = (visualAspect + homogeneity + cleanliness + husking) / 4;
  return Math.round(average * 100) / 100;
}

/**
 * Get the quality level label based on the global score.
 */
export function getQualityLevel(globalScore: number): "excellent" | "bon" | "moyen" | "faible" {
  if (globalScore >= 4) return "excellent";
  if (globalScore >= 3) return "bon";
  if (globalScore >= 2) return "moyen";
  return "faible";
}

/**
 * Get the DaisyUI color class for a quality level.
 */
export function getQualityColor(globalScore: number): string {
  if (globalScore >= 4) return "text-success";
  if (globalScore >= 3) return "text-info";
  if (globalScore >= 2) return "text-warning";
  return "text-error";
}

/**
 * Get the humidity level assessment.
 * Ideal rice humidity for purchase is typically 12-14%.
 */
export function getHumidityLevel(humidity: number): "optimal" | "acceptable" | "elevee" {
  if (humidity <= 14) return "optimal";
  if (humidity <= 17) return "acceptable";
  return "elevee";
}

/**
 * Validate that all quality scores are within valid ranges.
 * Returns an error message or null if valid.
 */
export function validateScores(scores: QualityScores): string | null {
  const { visualAspect, homogeneity, cleanliness, husking, humidity } = scores;

  for (const [name, value] of Object.entries({ visualAspect, homogeneity, cleanliness, husking })) {
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      return `${name} doit être un entier entre 1 et 5 (reçu: ${value})`;
    }
  }

  if (typeof humidity !== "number" || humidity < 0 || humidity > 100) {
    return `humidity doit être entre 0 et 100 (reçu: ${humidity})`;
  }

  return null;
}
