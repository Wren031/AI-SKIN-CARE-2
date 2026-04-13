import { supabase } from "@/src/features/lib/supabase";
import { decode } from "base64-arraybuffer";
import { InferResponse, Prediction } from "../types/SkinCondition";

const BACKEND_URL = "http://10.74.210.148:5000/infer";

export const SkinService = {
  async uploadScanImage(userId: string, base64: string): Promise<string> {
    const pureBase64 = base64.includes(",") ? base64.split(",")[1] : base64;
    const filePath = `${userId}/${Date.now()}.jpg`;
    const { error } = await supabase.storage.from("scan-images").upload(filePath, decode(pureBase64), { contentType: "image/jpeg" });
    if (error) throw error;
    return supabase.storage.from("scan-images").getPublicUrl(filePath).data.publicUrl;
  },

  async analyzeImage(base64: string): Promise<InferResponse> {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: base64 }),
    });
    if (!response.ok) throw new Error("AI Backend Offline");
    return response.json();
  },

  async saveScanResult(results: Prediction[]) {
    if (!results || results.length === 0) return;

    const scanId = `scan_${Date.now()}`;

    // 1. Save Header
    const { error: hErr } = await supabase.from("tbl_skin_condition").insert([{
      id: scanId, user_id: results[0].user_id, image_url: results[0].image_url
    }]);
    if (hErr) throw hErr;

    // 2. Save Details
    const details = results.map(p => ({
      scan_id: scanId, 
      condition_name: p.class, 
      confidence: p.confidence, 
      severity: p.severity
    }));
    
    const { error: dErr } = await supabase.from("tbl_scan_details").insert(details);
    if (dErr) throw dErr;
  }
};