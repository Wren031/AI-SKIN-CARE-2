import { useRef, useState } from "react";
import { Animated } from "react-native";
import { SkinService } from "../service/skinAnalysis";
import { Prediction, ScanStatus, Severity } from "../types/SkinCondition";

export function useSkinScanner(userId: string | undefined) {
  const [status, setStatus] = useState<ScanStatus>("IDLE");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const scanAnim = useRef(new Animated.Value(0)).current;

  const calculateSeverity = (conf: number): Severity => {
    if (conf > 0.7) return "HIGH";
    if (conf > 0.4) return "MODERATE";
    return "LOW";
  };

  const runScan = async (base64: string) => {
    if (!userId) return setErrorMessage("User not found");
    
    setErrorMessage("");
    setPredictions([]);
    setStatus("SCANNING");

    try {
      const imageUrl = await SkinService.uploadScanImage(userId, base64);
      const aiData = await SkinService.analyzeImage(base64);

      // 1. Convert all AI predictions into our format
      const allResults: Prediction[] = Object.entries(aiData.predictions || {})
        .map(([key, val]: any) => ({
          id: Math.random().toString(),
          user_id: userId,
          image_url: imageUrl,
          class: key.replace(/_/g, " ").toUpperCase(),
          confidence: val.confidence,
          severity: calculateSeverity(val.confidence),
        }))
        .filter(p => p.confidence >= 0.01) // REMOVE 0% results immediately
        .sort((a, b) => b.confidence - a.confidence);

      let finalResults: Prediction[] = [];

      // 2. HEALTHY SKIN DETECTION LOGIC
      // If the highest confidence found is less than 10%, we classify it as Healthy Skin.
      const highestConfidence = allResults.length > 0 ? allResults[0].confidence : 0;

      if (highestConfidence < 0.10) {
        finalResults = [{
          id: "healthy_" + Date.now(),
          user_id: userId,
          image_url: imageUrl,
          class: "HEALTHY SKIN",
          confidence: 1.0,
          severity: "LOW" as Severity,
        }];
      } else {
        finalResults = allResults;
      }

      setPredictions(finalResults);

      await SkinService.saveScanResult(finalResults);

      setStatus("SUCCESS");
    } catch (err: any) {
      setErrorMessage(err.message || "Unknown error");
      setStatus("ERROR");
    }
  };

  return { status, predictions, errorMessage, scanAnim, runScan };
}