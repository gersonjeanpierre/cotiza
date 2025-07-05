import { Injectable } from "@angular/core";
import { CotizaDB } from "@shared/sync/dexie-db";
import { OrderStatus } from "@core/models/order-status";

@Injectable({ providedIn: 'root' })
export class OrderStatusesIndexedDBService {
  private db = new CotizaDB();

  async saveAll(orderStatuses: OrderStatus[]): Promise<void> {
    await this.db.order_statuses.clear();
    await this.db.order_statuses.bulkAdd(orderStatuses);
  }
  async getAll(): Promise<OrderStatus[]> {
    return await this.db.order_statuses.toArray();
  }
  count(): Promise<number> {
    return this.db.order_statuses.count();
  }
  async getById(id: number): Promise<OrderStatus | undefined> {
    return await this.db.order_statuses.get(id);
  }
}