// src/app/core/models/product.model.ts

import { ExtraOption } from "./extra-option";

// Interfaz para el tipo de producto asociado dentro del modelo Product (simplificada si es necesario)
export interface AssociatedProductType {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
  // Si el SKU del tipo de producto es relevante aquí, añádelo
  // code: string;
}

// Interfaz principal para el Producto
export interface Product {
  id: number;
  sku: string; // <-- Nuevo campo
  name: string;
  description: string | null;
  unity_measure: string; // <-- Nuevo campo (ej. "metros", "unidades")
  price: number;
  image_url: string | null; // <-- Nuevo campo
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
  // Asumiendo que product_type_id es aún relevante para un filtro inicial,
  // aunque la API devuelva la lista completa en el objeto Product.
  // product_type_id: number; // Podría seguir siendo útil si lo usas en el frontend para alguna lógica.
  product_types: AssociatedProductType[]; // <-- Lista anidada de tipos de producto asociados
  extra_options: ExtraOption[];          // <-- Lista anidada de opciones extra
}

// DTOs (Data Transfer Objects) para crear y actualizar productos
// Asegúrate de que estos coincidan con tus DTOs de FastAPI si los usas para POST/PUT
export interface CreateProductDto {
  sku: string;
  name: string;
  description?: string | null;
  unity_measure: string;
  price: number;
  image_url?: string | null;
  // Considera si necesitas enviar product_type_ids o extra_option_ids al crear
  product_type_ids?: number[]; // Si la API espera IDs para asociaciones
  extra_option_ids?: number[]; // Si la API espera IDs para asociaciones
}

export interface UpdateProductDto {
  sku?: string;
  name?: string;
  description?: string | null;
  unity_measure?: string;
  price?: number;
  image_url?: string | null;
  product_type_ids?: number[];
  extra_option_ids?: number[];
}