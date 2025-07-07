import { Injectable } from "@angular/core";
import { MyCart, MyCartDetail, MyCartDetailExtraOption } from "@core/models/cart";
import { CotizaDB } from "@shared/sync/dexie-db";

@Injectable({ providedIn: 'root' })
export class MyCartIndexedDBService {
  private db = new CotizaDB();

  async saveMyCart(myCarts: MyCart[]): Promise<void> {
    for (const myCart of myCarts) {
      // Busca si ya existe un myCart con ese customer_id
      const existingMyCart = await this.db.my_cart.where('customer_id').equals(myCart.customer_id).first();
      // Borra el myCart existente
      if (existingMyCart) {
        await this.db.my_cart.where('id').equals(existingMyCart.id ?? 0).delete();
      }
      // Agrega el nuevo myCart (irá al final con nuevo id autoincremental)
      await this.db.my_cart.add(myCart);
    }
  }

  async deleteMyCart(myCartId: number): Promise<void> {
    const myCart = await this.db.my_cart.get(myCartId);
    if (!myCart) {
      throw new Error(`MyCart with ID ${myCartId} not found`);
    }
    // Elimina el myCart
    await this.db.my_cart.where('id').equals(myCartId).delete();
  }

  async getLastMyCart(): Promise<MyCart | undefined> {
    return await this.db.my_cart.orderBy('id').last();
  }

  async getAll(): Promise<MyCart[]> {
    return await this.db.my_cart.toArray();
  }
  count(): Promise<number> {
    return this.db.my_cart.count();
  }
  async getByCustomerId(customerId: number): Promise<MyCart | undefined> {
    return await this.db.my_cart.where('customer_id').equals(customerId).first();
  }

  async saveMyCartDetail(myCartDetail: MyCartDetail, myCartId: number): Promise<void> {
    const myCart = await this.db.my_cart.get(myCartId);
    if (!myCart) {
      throw new Error(`MyCart with ID ${myCartId} not found`);
    }
    if (!myCart.details) {
      myCart.details = [];
    }
    const existingIndex = myCart.details.findIndex(detail => detail.product_id === myCartDetail.product_id);
    if (existingIndex !== -1) {
      // Actualiza el detalle existente
      myCart.details[existingIndex] = myCartDetail;
    } else {
      // Agrega un nuevo detalle
      myCart.details.push(myCartDetail);
    }
    await this.db.my_cart.put(myCart);
  }

  async deleteMyCartDetail(myCartId: number, productId: number): Promise<void> {
    const myCart = await this.db.my_cart.get(myCartId);
    if (!myCart) {
      throw new Error(`El MyCart con ID ${myCartId} no fue encontrado`);
    }
    if (!myCart.details) {
      throw new Error(`No se encontraron detalles en el MyCart con ID ${myCartId}`);
    }
    const existingIndex = myCart.details.findIndex(detail => detail.product_id === productId);
    if (existingIndex === -1) {
      throw new Error(`El detalle con ID ${productId} no fue encontrado en el MyCart con ID ${myCartId}`);
    }
    // Elimina el detalle existente
    myCart.details.splice(existingIndex, 1);
    await this.db.my_cart.put(myCart);
  }

  async saveMyCartDetailExtraOptions(extraOptions: MyCartDetailExtraOption[], myCartId: number, productId: number): Promise<void> {
    const myCart = await this.db.my_cart.get(myCartId);
    if (!myCart) {
      throw new Error(`El MyCart con ID ${myCartId} no fue encontrado`);
    }
    if (!myCart.details) {
      myCart.details = [];
    }
    const detailIndex = myCart.details.findIndex(detail => detail.product_id === productId);
    if (detailIndex === -1) {
      throw new Error(`El detalle con product_id ${productId} no fue encontrado en el MyCart con ID ${myCartId}`);
    }
    const existingDetail = myCart.details[detailIndex];
    if (!existingDetail.extra_options) {
      existingDetail.extra_options = [];
    }
    // Actualiza las opciones extra del detalle
    for (const option of extraOptions) {
      const existingOptionIndex = existingDetail.extra_options.findIndex(opt => opt.extra_option_id === option.extra_option_id);
      if (existingOptionIndex !== -1) {
        // Actualiza la opción existente
        existingDetail.extra_options[existingOptionIndex] = option;
      } else {
        // Agrega una nueva opción
        existingDetail.extra_options.push(option);
      }
    }
    // Guarda el myCart actualizado
    await this.db.my_cart.put(myCart);
  }

  async updateCustomerInMyCart(customerId: number): Promise<void> {
    const myCart = await this.db.my_cart.where('customer_id').equals(customerId).first();
    if (!myCart) {
      throw new Error(`El MyCart con customer_id ${customerId} no fue encontrado`);
    }
    // Actualiza el customer_id del myCart
    myCart.customer_id = customerId;
    await this.db.my_cart.put(myCart);
  }




}


