export interface ProductType {
  path: any;
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface CreateProductTypeDto {
  name: string;
  description?: string | null;
}

export interface UpdateProductTypeDto {
  name?: string | null;
  description?: string | null;
}