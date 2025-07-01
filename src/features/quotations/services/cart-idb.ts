import { Injectable } from "@angular/core";
import { Cart, CartItem, ProductExtraOption } from "@core/models/cart";
import { CotizaDB } from "@shared/sync/dexie-db";

@Injectable({ providedIn: 'root' })
export class CartIndexedDBService {
  private db = new CotizaDB();

  async saveCart(carts: Cart[]): Promise<void> {
    for (const cart of carts) {
      // Busca si ya existe un cart con ese customer_id
      const existingCart = await this.db.carts.where('customer_id').equals(cart.customer_id).first();
      if (existingCart) {
        // Borra el cart existente
        await this.db.carts.delete(existingCart.id!);
      }
      // Agrega el nuevo cart (irá al final con nuevo id autoincremental)
      await this.db.carts.add(cart);
    }
  }

  async getLastCart(): Promise<Cart | undefined> {
    return await this.db.carts.orderBy('id').last();
  }

  async getAll(): Promise<Cart[]> {
    return await this.db.carts.toArray();
  }

  count(): Promise<number> {
    return this.db.carts.count();
  }

  async getByCustomerId(customerId: number): Promise<Cart | undefined> {
    return await this.db.carts.where('customer_id').equals(customerId).first();
  }

  async saveCartItem(cartItem: CartItem, cartId: number): Promise<void> {

    const cart = await this.db.carts.get(cartId);
    if (!cart) {
      throw new Error(`Cart with ID ${cartId} not found`);
    }

    if (!cart.items) {
      cart.items = [];
    }

    const existingIndex = cart.items.findIndex(item => item.product_id === cartItem.product_id);

    if (existingIndex !== -1) {
      // Si existe, actualiza el item
      cart.items[existingIndex] = cartItem;
    } else {
      // Si no existe, agrega el nuevo item
      cart.items.push(cartItem);
    }
    await this.db.carts.put(cart);

  }

  async saveCartExtraOptions(extraOptions: ProductExtraOption[], cartId: number, productId: number): Promise<void> {
    const cart = await this.db.carts.get(cartId);
    if (!cart) {
      throw new Error(`El cart con ID ${cartId} no fue encontrado`);
    }
    if (!cart.items) {
      cart.items = [];
    }
    const itemIndex = cart.items.findIndex(item => item.product_id === productId);
    if (itemIndex === -1) {
      throw new Error(`El item con product_id ${productId} no fue encontrado en el cart con ID ${cartId}`);
    }
    const item = cart.items[itemIndex];
    if (!item.product_extra_options) {
      item.product_extra_options = [];
    }
    // Actualiza o agrega las opciones extra
    for (const option of extraOptions) {
      const existingOptionIndex = item.product_extra_options.findIndex(opt => opt.extra_option_id === option.extra_option_id);
      if (existingOptionIndex !== -1) {
        // Actualiza la opción existente
        item.product_extra_options[existingOptionIndex] = option;
      } else {
        // Agrega una nueva opción
        item.product_extra_options.push(option);
      }
    }
    // Guarda el cart actualizado
    await this.db.carts.put(cart);
  }
}