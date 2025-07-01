// src/app/core/models/extra-option.model.ts
export interface ExtraOption {
  id: number;
  name: string;
  price: number;
  description: string | null;
  create_at: string;
  update_at: string | null;
  delete_at: string | null;
}