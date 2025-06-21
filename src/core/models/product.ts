export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  unity_measure: string;
  price: number;
  image_url: string | null;
  create_at: string;
  update_at: string | null;
  delete_at: string | null;
}