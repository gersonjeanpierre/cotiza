export interface OrderStatus {
  id: number;
  code: string;
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}