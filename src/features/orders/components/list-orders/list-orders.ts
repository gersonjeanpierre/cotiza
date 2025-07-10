import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Order } from '@core/models/order';
import { Product } from '@core/models/product';
import { OrderService } from '@features/orders/service/order';
import { OrderIndexedDBService } from '@features/orders/service/order-idb';
import { ProductIndexedDBService } from '@features/quotations/services/products-idb';
import { convertMyCartToDisplayCartItems } from '@shared/utils/priceDisplay';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-list-orders',
  imports: [CurrencyPipe, AsyncPipe, DatePipe],
  templateUrl: './list-orders.html',
  styleUrl: './list-orders.css'
})
export class ListOrders {

  private allOrders = new BehaviorSubject<Order[]>([]);
  orders = this.allOrders.asObservable();

  errorMessage = signal<string | null>(null);
  loading = signal<boolean>(false);
  generatingPdf = signal<number | null>(null); // Track which order is generating PDF

  allProducts: Product[] = [];
  constructor(
    private orderService: OrderService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private orderIDBService: OrderIndexedDBService,
    private productIDBService: ProductIndexedDBService
  ) {

  }
  async ngOnInit(): Promise<void> {
    this.loadOrders();
  }

  async loadOrders(): Promise<void> {
    this.allProducts = await this.productIDBService.getAll();
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this.allOrders.next(orders);
        this.orderIDBService.saveAll(orders).then(() => {
          console.log('Orders saved to IndexedDB');
        }).catch((error) => {
          console.error('Error saving orders to IndexedDB:', error);
        });
        this.cdr.markForCheck();
        console.log('Orders:', this.allOrders.value);
      },
      error: (error) => {
        console.error('Error loading orders:', error);
      }
    });
  }

  toInvoice(orderId: number): void {
    this.router.navigate([`/dashboard/pedidos/invoice/${orderId}`]);
  }

  generatePdfWithDetails(order: Order): void {
    this.generatingPdf.set(order.id!);
    this.errorMessage.set(null);



    // Convert order details to DisplayCartItem[]
    const displayItems = convertMyCartToDisplayCartItems(
      order, // Assuming Order has similar structure to MyCart
      this.allProducts, // You'll need to inject and load products
      0.18
    );
    console.log('Display Items for PDF:', displayItems);

    this.orderService.generateOrderPdf(order.id!, displayItems).subscribe({
      next: (response: Blob) => {
        console.log('PDF generated successfully:', response);
        // Crea una URL para el Blob del PDF
        const fileURL = URL.createObjectURL(response);
        // Abre el PDF en una nueva pestaña
        window.open(fileURL, '_blank');
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al generar el PDF:', error);
        this.errorMessage.set('Error al generar el PDF. Por favor, inténtelo de nuevo más tarde.');
        this.loading.set(false);
      }
    });


  }

  private downloadPdf(pdfBlob: Blob, orderId: number): void {
    const url = window.URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pedido-${orderId}.pdf`;
    document.body.appendChild(link);
    link.click();

    // Limpiar recursos
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }


}
