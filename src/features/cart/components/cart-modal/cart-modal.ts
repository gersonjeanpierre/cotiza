import { DecimalPipe } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnInit, Output, ViewChild } from '@angular/core';
import { Cart, CartItem } from '@core/models/cart';
import { Product } from '@core/models/product';
import { CartIndexedDBService } from '@features/quotations/services/cart-idb';
import { ProductIndexedDBService } from '@features/quotations/services/products-idb';
import { calculateLaborPrice } from '@shared/utils/extraOptionList';

@Component({
  selector: 'app-cart-modal',
  imports: [DecimalPipe],
  templateUrl: './cart-modal.html',
  styleUrl: './cart-modal.css'
})
export class CartModal implements OnInit {

  @ViewChild('cartDialog') dialog!: ElementRef<HTMLDialogElement>;

  cart: Cart | undefined = undefined;
  cartItems: CartItem[] | undefined = undefined;

  allProducts: Product[] = [];

  displayCart: any[] = [];

  constructor(
    private cartIDBService: CartIndexedDBService,
    private productIDBService: ProductIndexedDBService,
    private cdr: ChangeDetectorRef
  ) { }

  async ngOnInit(): Promise<void> {

  }

  openModal(): void {
    this.loadCart()
    this.dialog.nativeElement.showModal();
  }

  async loadCart(): Promise<void> {
    this.cart = await this.cartIDBService.getLastCart();
    this.allProducts = await this.productIDBService.getAll();

    this.cartItems = this.cart?.items;
    console.log('Cart Items:', this.cartItems);

    const displayCart = this.cartItems?.map( // Hacemos un mapeo y busqueda de los items del carrito con los productos
      (item) => {
        const products = this.allProducts.find(product => product.id === item.product_id);
        const itemExtra = item.product_extra_options?.map( // 2do mapeo para obtener las opciones extra de cada item
          (itemExtOpt) => {
            const extra = products?.extra_options.find(proExtOpt => proExtOpt.id === itemExtOpt.extra_option_id);
            return {
              ...itemExtOpt,
              name: extra?.name,
              price: extra?.id == 14 // Si es la opción de mano de obra, calculamos el precio
                ? calculateLaborPrice(itemExtOpt.linear_meter ?? 0, itemExtOpt.width ?? 0, extra?.price)
                : extra?.price,
              description: extra?.description

            }
          }
        ) ?? [];
        return {
          ...item,
          sku: products?.sku,
          name: products?.name,
          price: products?.price,
          image: products?.image_url,
          description: products?.description,
          product_extra_options: itemExtra,
          subtotalExtra: itemExtra.reduce(
            (sum, extra) => sum + ((extra.price ?? 0) * (extra.quantity ?? 0) || 0),
            0
          ),
          subtotalProduct: (products?.price ?? 0) * (item.quantity ?? 0) + itemExtra.reduce(
            (sum, extra) => sum + ((extra.price ?? 0) * (extra.quantity ?? 0) || 0),
            0
          )
        }
      }
    )
    this.displayCart = displayCart || [];

    console.log('Display:', this.displayCart);

    this.cdr.detectChanges();

  }
  getTotalCart(): number {
    return this.displayCart.reduce((total, item) => total + (item.subtotalProduct || 0), 0);
  }
  // cart-modal.ts
  async deleteExtraOption(productId: number, extraOptionId: number) {
    if (!this.cart?.id) return;
    await this.cartIDBService.deleteCartExtraOption(this.cart.id, productId, extraOptionId);
    await this.loadCart(); // Recarga el carrito para reflejar los cambios
  }

  async deleteCartItem(productId: number): Promise<void> {
    if (!this.cart?.id) return;
    await this.cartIDBService.deleteCartItem(this.cart.id, productId);
    await this.loadCart(); // Recarga el carrito para reflejar los cambios
  }

}
