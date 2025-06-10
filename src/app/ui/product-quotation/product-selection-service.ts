import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProductSelectionService {
  selectedProducts: any[] = [];

  selectProduct(product: any) {
    this.selectedProducts = [product]
  }

  getSelectedProducts() {
    return this.selectedProducts;
  }
}
