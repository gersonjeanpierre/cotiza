import { DecimalPipe } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DisplayCartItem, MyCart, MyCartDetail } from '@core/models/cart';
import { Product } from '@core/models/product';
import { MyCartIndexedDBService } from '@features/cart/service/my-cart-idb';
import { ProductIndexedDBService } from '@features/quotations/services/products-idb';
import { convertNumberToText, convertMyCartToDisplayCartItems } from '@shared/utils/priceDisplay';

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
    this.allProducts = await this.productIDBService.getAll();

    this.displayMyCart = convertMyCartToDisplayCartItems(
      this.myCart!,
      this.allProducts,
      this.igv
    );

    this.finalAmount = Number(this.getTotalCart().toFixed(2));
    this.totalAmount = Number((this.finalAmount / (1 + this.igv)).toFixed(2));
    this.totalIgv = Number((this.totalAmount * this.igv).toFixed(2));
    this.totalToText = convertNumberToText(this.finalAmount);

    this.cdr.detectChanges();
  }

  getTotalCart(): number {
    return this.displayMyCart.reduce((total, item) => total + ((item.subtotal || 0) + (item.total_extra_options || 0)), 0);
  }

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
