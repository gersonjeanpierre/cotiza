export interface TypeClient {
  id: number;
  name: string;
}

export interface Customer {
  id: number;
  type_client: TypeClient;
  entity_type: 'N' | 'J';
  ruc?: string | null;
  dni?: string | null;
  doc_foreign?: string | null; // Nuevo campo
  name?: string | null;
  last_name?: string | null;
  business_name?: string | null;
  phone_number: string;
  email: string;
  created_at: string; // O Date, si se parsea
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface CreateCustomerPayload {
  type_client_id: number;
  entity_type: 'N' | 'J';
  ruc?: string | null;
  dni?: string | null;
  doc_foreign?: string | null;
  name?: string | null;
  last_name?: string | null;
  business_name?: string | null;
  phone_number: string;
  email: string;
}