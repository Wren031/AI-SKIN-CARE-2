import { LifestyleTip, Product } from "./Product";

export interface SkinCondition {
    name: string;
}

export interface Recommendations {
    id: number;
    skin_condtion: SkinCondition;
    severity: string;
    treatment: string;
    precautions: string;
    created_at: string;
}


export interface UsersRecommendations {
    id: number;
    recommendation: Recommendations[];
    products: Product[];
    lifestyleTips: LifestyleTip[];
}

