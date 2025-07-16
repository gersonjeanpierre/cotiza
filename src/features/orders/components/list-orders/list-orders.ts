import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Order } from '@core/models/order';
import { Product } from '@core/models/product';
import { OrderService } from '@features/orders/service/order';
import { OrderIndexedDBService } from '@features/orders/service/order-idb';
import { ProductIndexedDBService } from '@features/quotations/services/products-idb';
import { getColorStatus } from '@shared/utils/orderUtils';
import { adaptOrderToMyCart } from '@shared/utils/priceDisplay';
import { BehaviorSubject, catchError, combineLatest, debounceTime, distinctUntilChanged, map, Observable, startWith, tap, throwError } from 'rxjs';

@Component({
  selector: 'app-list-orders',
  imports: [CurrencyPipe, AsyncPipe, DatePipe, ReactiveFormsModule],
  templateUrl: './list-orders.html',
  styleUrl: './list-orders.css'
})
export class ListOrders {

  private allOrders = new BehaviorSubject<Order[]>([]);
  orders1 = this.allOrders.asObservable();

  // Observable para los pedidos filtrados y paginados
  orders: Observable<Order[]> = new Observable<Order[]>();

  // Subjects para manejar el estado de los pedidos
  private allOrdersSubject = new BehaviorSubject<Order[]>([]);
  private filterSubject = new BehaviorSubject<string>('');
  private currentPageSubject = new BehaviorSubject<number>(1);
  // Propiedades de paginación
  totalItems: number = 0;
  pageSize: number = 10;
  totalPages: number = 0;
  currentPage: number = 1;

  public math = Math;

  errorMessage = signal<string | null>(null);
  loading = signal<boolean>(false);
  generatingPdf = signal<number | null>(null); // Track which order is generating PDF

  allProducts: Product[] = [];

  searchForm: ReturnType<FormBuilder['group']>;

  constructor(
    private orderService: OrderService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private orderIDBService: OrderIndexedDBService,
    private productIDBService: ProductIndexedDBService,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      search: [''],
    });
    this.setupOrdersObservable();
  }

  async ngOnInit(): Promise<void> {
    this.loadOrders();
  }

  private setupOrdersObservable(): void {
    // Combinar la lista de pedidos con el filtro de búsqueda
    const filteredOrders = combineLatest([
      this.allOrdersSubject.asObservable(),
      this.filterSubject.asObservable().pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
    ]).pipe(
      map(([orders, filterTerm]) => {
        // 1. Ordenar por ID descendente (último primero)
        const sortedOrders = [...orders].sort((a, b) => (b.id || 0) - (a.id || 0));

        // 2. Filtrar por término de búsqueda
        if (!filterTerm.trim()) {
          return sortedOrders;
        }

        const lowerCaseFilter = filterTerm.toLowerCase();
        return sortedOrders.filter(order => {
          // Buscar en ID, nombre del cliente, método de pago, notas, y fecha dd/mm
          const customerName = order.customer?.entity_type === 'N'
            ? `${order.customer?.name} ${order.customer?.last_name}`
            : order.customer?.business_name || '';

          // Formatear la fecha como dd/mm
          let formattedDate = '';
          let isoDate = '';
          if (order.created_at) {
            const dateObj = new Date(order.created_at);
            const day = String(dateObj.getDate()).padStart(2, '0');
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            formattedDate = `${day}/${month}`;
            isoDate = dateObj.toISOString().toLowerCase();
          }

          return (
            order.id?.toString().includes(filterTerm) ||
            customerName.toLowerCase().includes(lowerCaseFilter) ||
            order.payment_method?.toLowerCase().includes(lowerCaseFilter) ||
            (isoDate && isoDate.includes(lowerCaseFilter)) ||
            (formattedDate && formattedDate.includes(lowerCaseFilter))
          );
        });
      }),
      tap(filteredList => {
        // Actualizar propiedades de paginación
        this.totalItems = filteredList.length;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);

        // Ajustar página actual si es necesario
        if (this.currentPage > this.totalPages) {
          this.currentPage = this.totalPages > 0 ? this.totalPages : 1;
        }
        this.currentPageSubject.next(this.currentPage);
      })
    );

    // Paginación: combinar la lista filtrada con el número de página
    this.orders = combineLatest([
      filteredOrders,
      this.currentPageSubject.asObservable()
    ]).pipe(
      map(([orders, currentPage]) => {
        const startIndex = (currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        return orders.slice(startIndex, endIndex);
      })
    );

    // Conectar el control de búsqueda al Subject de filtro
    this.searchForm.get('search')!.valueChanges.pipe(
      startWith('')
    ).subscribe(term => {
      this.filterSubject.next(term || '');
      this.currentPage = 1; // Resetear a primera página al buscar
      this.currentPageSubject.next(1);
    });
  }

  async loadOrders(): Promise<void> {
    this.loading.set(true);
    this.allProducts = await this.productIDBService.getAll();
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this.allOrdersSubject.next(orders);
        this.orderIDBService.saveAll(orders).then(() => {
          console.log('Orders saved to IndexedDB');
        }).catch((error) => {
          console.error('Error saving orders to IndexedDB:', error);
        });
        this.loading.set(false);
        this.cdr.markForCheck();
        console.log('Orders:', this.allOrders.value);
      },
      error: (error) => {
        console.error('Error loading orders:', error);
      }
    });
  }

  // Métodos de paginación
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.currentPageSubject.next(page);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  // Método para limpiar búsqueda
  clearSearch(): void {
    this.searchForm.get('search')?.setValue('');
  }

  toInvoice(orderId: number): void {
    this.router.navigate([`/dashboard/pedidos/invoice/${orderId}`]);
  }

  generatePdfWithDetails(order: Order): void {
    this.generatingPdf.set(order.id!);
    this.errorMessage.set(null);



    // Convert order details to DisplayCartItem[]
    const displayItems = adaptOrderToMyCart(
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
        catchError((error: HttpErrorResponse) => {
          console.error('PDF generation failed:', error.error); // Add this for insights
          return throwError(() => error);
        });
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

  getColorStatus = (statusId: number): string => {
    return getColorStatus(statusId);
  }

}
