export interface TypeClient {
  id: number;
  code: string;
  name: string;
  margin: number;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}