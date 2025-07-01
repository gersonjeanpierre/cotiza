import { ChangeDetectorRef, Component, ElementRef, OnInit, Output, ViewChild } from '@angular/core';
import { Cart, CartItem } from '@core/models/cart';
import { CartIndexedDBService } from '@features/quotations/services/cart-idb';
import { ProductIndexedDBService } from '@features/quotations/services/products-idb';

@Component({
  selector: 'app-cart-modal',
  imports: [],
  templateUrl: './cart-modal.html',
  styleUrl: './cart-modal.css'
})
export class CartModal implements OnInit {

  @ViewChild('cartDialog') dialog!: ElementRef<HTMLDialogElement>;

  cart: Cart | undefined = undefined;
  cartItems: CartItem[] | undefined = undefined;

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
    console.log('Cart Modal - Cart:', this.cart);
    console.log('###### Pruebsas de Datos en Cart Modal ######');
    this.cartItems = this.cart?.items;
    console.log('Cart Items:', this.cartItems);

    this.cdr.detectChanges();


    // juntar y filtar
  }
}
