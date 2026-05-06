export interface Product {
  id: string;
  product_name: string;
  image_url: string;
  usage?: string;
  type?: string;
  instructions?: string;
}

export interface LifestyleTip {
  id: string;
  category: string;
  title: string;
  description: string;
}
