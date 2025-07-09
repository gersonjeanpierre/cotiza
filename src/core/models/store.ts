export interface Store {
  id?: number;
  code: string;
  name: string;
  address: string;
  phone_number: string;
  email: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}