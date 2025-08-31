/**
 * Calculates eGFR using the CKD-EPI equation (2021)
 * @param serumCreatinine - Serum creatinine level in mg/dL
 * @param age - Age in years
 * @param isFemale - Boolean indicating if patient is female
 * @returns Estimated GFR in mL/min/1.73m²
 */
export function calculateEGFR(serumCreatinine: number, age: number, isFemale: boolean): number {
  // Constants based on sex
  const kappa = isFemale ? 0.7 : 0.9;
  const alpha = isFemale ? -0.241 : -0.302;
  const sexMultiplier = isFemale ? 1.012 : 1.0;

  // Calculate the min and max terms
  const scrKappa = serumCreatinine / kappa;
  const minTerm = Math.min(scrKappa, 1);
  const maxTerm = Math.max(scrKappa, 1);

  // Calculate eGFR using the CKD-EPI equation
  const egfr = 142 
    * Math.pow(minTerm, alpha) 
    * Math.pow(maxTerm, -1.200) 
    * Math.pow(0.9938, age) 
    * sexMultiplier;

  // Round to 1 decimal place
  return Math.round(egfr * 10) / 10;
}

/**
 * Returns the CKD stage based on eGFR value
 * @param egfr - eGFR value in mL/min/1.73m²
 * @returns CKD stage (1-5) or null if eGFR is invalid
 */
export function getCKDStage(egfr: number): number | null {
  if (egfr <= 0 || egfr > 200) return null; // Invalid eGFR
  if (egfr >= 90) return 1;  // CKD Stage 1: Normal or high
  if (egfr >= 60) return 2;  // CKD Stage 2: Mildly decreased
  if (egfr >= 45) return 3a; // CKD Stage 3a: Mildly to moderately decreased
  if (egfr >= 30) return 3b; // CKD Stage 3b: Moderately to severely decreased
  if (egfr >= 15) return 4;  // CKD Stage 4: Severely decreased
  return 5;                  // CKD Stage 5: Kidney failure
}

/**
 * Returns a human-readable description of CKD stage
 * @param stage - CKD stage (1-5)
 * @returns Description of the CKD stage
 */
export function getCKDStageDescription(stage: number | null): string {
  if (stage === null) return 'Invalid eGFR value';
  
  const descriptions: Record<number, string> = {
    1: 'Normal or high kidney function with kidney damage',
    2: 'Mildly reduced kidney function',
    3: 'Moderately reduced kidney function',
    4: 'Severely reduced kidney function',
    5: 'Kidney failure (end-stage renal disease)'
  };
  
  return descriptions[stage] || 'Unknown CKD stage';
}
