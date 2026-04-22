export interface SkinDetection {
  label: string;
  severity: string;
  impact: number;
}

export interface AnalysisResult {
  score: string;
  confidence: string;
  skinType: string;
  severity: string;
  imageUri: string;
  detections: SkinDetection[];
}

export interface SeverityStyle {
  color: string;
  bg: string;
  status: 'SEVERE' | 'MODERATE' | 'MILD';
}