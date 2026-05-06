export type Severity = 'SEVERE' | 'MODERATE' | 'MILD';

export interface SkinDetection {
  label: string;
  severity: Severity;
  impact: number;
}

export interface UsersSkinResult {
  score: number;
  confidence: number;
  skinType: string;
  severity: Severity; 
  imageUri: string; 
  detections: SkinDetection[];
}