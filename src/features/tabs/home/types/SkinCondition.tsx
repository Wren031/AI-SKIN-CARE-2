export type Severity = "LOW" | "MODERATE" | "HIGH";
export type ScanStatus = "IDLE" | "SCANNING" | "SUCCESS" | "ERROR";

export interface Prediction {
  id: string;
  user_id: string;
  class: string;
  confidence: number;
  severity: Severity;
  image_url: string;
}

export interface InferResponse {
  predictions?: Record<string, { confidence: number }>;
  top?: string;
}