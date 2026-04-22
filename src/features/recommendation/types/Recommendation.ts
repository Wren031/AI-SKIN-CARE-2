export interface Recommendation {
  id: number;
  condition_id: number;
  severity: string;
  treatment: string;
  precautions: string;
  tbl_condition?: {
    name: string;
  };
  tbl_recommendation_products: {
    tbl_products: {
      id: number;
      name: string;
      image_url: string;
      brand: string;
    };
  }[];
}