import { DecimalPipe } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DisplayCartItem, MyCart, MyCartDetail } from '@core/models/cart';
import { Product } from '@core/models/product';
import { MyCartIndexedDBService } from '@features/cart/service/my-cart-idb';
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

  myCart: MyCart | null = null; // Carrito de compras del usuario
  myCartDetail: MyCartDetail[] = []; // Detalles del carrito de compras


  allProducts: Product[] = [];
  displayCart: any[] = [];
  displayMyCart: DisplayCartItem[] = [];

  typeClient: string = 'final'; // Tipo de cliente, puede ser 'final' o 'imprentero'
  totalAmount: number = 0; // Total del carrito
  profitMargin: number = 0; // Margen de ganancia 
  finalAmount: number = 0; // Monto final del carrito
  totalToText: string = ''; // Total en texto


  igv: number = 0.18; // Porcentaje del IGV (18%)
  totalIgv: number = 0; // Total del IGV calculado

  constructor(
    private myCartIDBService: MyCartIndexedDBService,
    private productIDBService: ProductIndexedDBService,
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
    this.myCart = await this.myCartIDBService.getLastMyCart() || null;
    this.typeClient = this.myCart?.customer?.type_client.name.includes('Final')
      ? 'final'
      : 'imprentero';
    this.profitMargin = this.myCart?.customer?.type_client?.margin ?? 0;
    this.allProducts = await this.productIDBService.getAll();

    this.displayMyCart = (this.myCart?.details || []).map(
      (detail) => {
        const product = this.allProducts.find(p => p.id === detail.product_id);
        const extraOptions = detail.extra_options.map(
          (extra) => {
            const extraOption = product?.extra_options.find(opt => opt.id === extra.extra_option_id);
            return {
              ...extra,
              name: extraOption?.name ?? '',
              price: Number(getPriceExtraOption(
                extraOption?.id ?? 0,
                detail.linear_meter,
                detail.width,
                extra.linear_meter,
                extra.width,
                extraOption?.price ?? 0,
                extra.giga_select,
                this.profitMargin,
                this.igv
              ).toFixed(2))
            }
          }
        )

        const subtotalExtraOnly = Number(extraOptions.reduce(
          (sum, extra) => sum + ((extra.price) * (extra.quantity || 1) || 0),
          0
        ).toFixed(2));
        const subtotalProductOnly = Number(getProductPrice(
          product?.id ?? 0,
          product?.price ?? 0,
          this.typeClient,
          detail.quantity,
          detail.height,
          detail.width,
          this.profitMargin,
          this.igv
        ).toFixed(2)) * (detail.quantity);

        return {
          ...detail,
          sku: product?.sku ?? '',
          name: product?.name ?? '',
          price: Number(getProductPrice(
            product?.id ?? 0,
            product?.price ?? 0,
            this.typeClient,
            detail.quantity,
            detail.height,
            detail.width,
            this.profitMargin,
            this.igv
          ).toFixed(2)),
          image: product?.image_url ?? '',
          total_extra_options: subtotalExtraOnly,
          extra_options: extraOptions,
        }
      });
    console.log('==> ===>Display My Cart:', this.displayMyCart);

    this.finalAmount = Number(this.getTotalCart().toFixed(2));
    this.totalAmount = Number((this.finalAmount / (1 + this.igv)).toFixed(2));
    this.totalIgv = Number((this.totalAmount * this.igv).toFixed(2));
    this.totalToText = convertNumberToText(this.finalAmount);

    this.cdr.detectChanges();
  }

  getTotalCart(): number {
    return this.displayMyCart.reduce((total, item) => total + ((item.subtotal || 0) + (item.total_extra_options || 0)), 0);
  }

  // async deleteExtraOption(productId: number, extraOptionId: number) {
  //   if (!this.cart?.id) return;
  //   await this.myCartIDBService.del(this.cart.id, productId, extraOptionId);
  //   await this.loadCart(); // Recarga el carrito para reflejar los cambios
  // }

  async deleteCartItem(productId: number): Promise<void> {
    if (!this.myCart?.id) return;
    await this.myCartIDBService.deleteMyCartDetail(this.myCart.id, productId);
    await this.loadCart(); // Recarga el carrito para reflejar los cambios
  }

  proceedToPayment(): void {
    if (!this.myCart?.id) return;
    this.dialog.nativeElement.close();
    this.router.navigate([`/dashboard/pedidos/nuevo/${this.myCart?.id}`], {
      state: {
        myCart: this.myCart,
        displayMyCart: this.displayMyCart,
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
