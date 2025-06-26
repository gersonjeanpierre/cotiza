export interface Customer {
  id: number;
  type_client_id: number;
  entity_type: string;
  ruc: string;
  dni: string;
  name: string;
  last_name: string;
  business_name: string;
  phone_number: string;
  email: string;
  create_at: string;
  update_at: string | null;
  delete_at: string | null;
}