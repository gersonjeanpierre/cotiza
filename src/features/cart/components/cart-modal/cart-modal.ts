import { DecimalPipe } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Cart, CartItem } from '@core/models/cart';
import { Product } from '@core/models/product';
import { DisplayCartIndexedDBService } from '@features/orders/service/display-cart-idb';
import { CartIndexedDBService } from '@features/quotations/services/cart-idb';
import { ProductIndexedDBService } from '@features/quotations/services/products-idb';
import { getProductPrice, getPriceExtraOption, convertNumberToText } from '@shared/utils/priceDisplay';

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

  typeClient: string = 'final'; // Tipo de cliente, puede ser 'final' o 'imprentero'
  totalAmount: number = 0; // Total del carrito
  profitMargin: number = 0; // Margen de ganancia 
  finalAmount: number = 0; // Monto final del carrito
  totalToText: string = ''; // Total en texto


  igv: number = 0.18; // Porcentaje del IGV (18%)
  totalIgv: number = 0; // Total del IGV calculado

  constructor(
    private cartIDBService: CartIndexedDBService,
    private productIDBService: ProductIndexedDBService,
    private displayCartIDBService: DisplayCartIndexedDBService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) { }

  async ngOnInit(): Promise<void> {

  }

  openModal(): void {
    this.loadCart()
    this.dialog.nativeElement.showModal();
  }

  async loadCart(): Promise<void> {
    this.cart = await this.cartIDBService.getLastCart();
    const isFinalClient = this.cart?.customer.type_client.name.includes('Final');
    this.typeClient = isFinalClient ? 'final' : 'imprentero';

    this.profitMargin = this.cart?.customer?.type_client?.margin ?? 0;

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
              price: Number(getPriceExtraOption(
                extra?.id ?? 0,
                item.linear_meter,
                item.width,
                itemExtOpt.linear_meter,
                itemExtOpt.width,
                extra?.price ?? 0,
                itemExtOpt.giga_select,
                this.profitMargin,
                this.igv
              ).toFixed(2)),
              description: extra?.description

            }
          }
        ) ?? [];

        const subtotalExtraOnly = Number(itemExtra.reduce(
          (sum, extra) => sum + ((extra.price) * (extra.quantity ?? 0) || 0),
          0
        ).toFixed(2));
        const subtotalProductOnly = Number(getProductPrice(
          products?.id ?? 0,
          products?.price ?? 0,
          this.typeClient,
          item.quantity ?? 1,
          item.height ?? 1, // Altura por defecto 1
          item.width ?? 1, // Ancho por defecto 1
          this.profitMargin,
          this.igv
        ).toFixed(2)) * (item.quantity ?? 1);

        return {
          ...item,
          sku: products?.sku,
          name: products?.name,
          price: Number(getProductPrice(
            products?.id ?? 0,
            products?.price ?? 0,
            this.typeClient,
            item.quantity ?? 1,
            item.height ?? 1, // Altura por defecto 1
            item.width ?? 1, // Ancho por defecto 1
            this.profitMargin,
            this.igv
          ).toFixed(2)),
          image: products?.image_url,
          description: products?.description,
          product_extra_options: itemExtra,
          subtotalExtra: subtotalExtraOnly,
          subtotalProduct: Number((subtotalProductOnly + subtotalExtraOnly).toFixed(2)),
        }
      }
    )
    this.displayCart = displayCart || [];
    this.finalAmount = Number(this.getTotalCart().toFixed(2));
    this.totalAmount = Number((this.finalAmount / (1 + this.igv)).toFixed(2));
    this.totalIgv = Number((this.totalAmount * this.igv).toFixed(2));
    this.totalToText = convertNumberToText(this.finalAmount);

    console.log('Display:', this.displayCart);

    this.cdr.detectChanges();

  }
  getTotalCart(): number {
    return this.displayCart.reduce((total, item) => total + (item.subtotalProduct || 0), 0);
  }

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

  proceedToPayment(): void {
    if (!this.cart?.id) return;
    this.displayCartIDBService.saveAll(this.displayCart);
    this.dialog.nativeElement.close();
    this.router.navigate([`/dashboard/pedidos/nuevo/${this.cart.id}`], {
      state: {
        cart: this.cart,
        displayCart: this.displayCart,
        totalAmount: this.totalAmount,
        totalIgv: this.totalIgv,
        finalAmount: this.finalAmount,
      }
    });
  }

  closeModal(): void {
    this.dialog.nativeElement.close();
  }
}
