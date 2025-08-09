import { ChangeDetectionStrategy, ChangeDetectorRef, Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Order } from '@core/models/order';
import { Product } from '@core/models/product';
import { OrderService } from '@features/orders/service/order';
import { OrderIndexedDBService } from '@features/orders/service/order-idb';
import { ProductIndexedDBService } from '@features/quotations/services/products-idb';
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, map, Observable, startWith, tap } from 'rxjs';
import { adaptOrderToMyCart } from '@shared/utils/priceDisplay';
import { OrdersTable } from '@features/orders/components/orders-table/orders-table';
import { OrdersSearch } from '@features/orders/components/orders-search/orders-search';
import { Pagination } from '@shared/components/pagination/pagination'; // Asegúrate de la ruta correcta

@Component({
  selector: 'app-list-orders',
  standalone: true, // Importante: marcamos como standalone
  imports: [
    ReactiveFormsModule,
    OrdersTable,      // Importamos el componente hijo
    OrdersSearch,     // Importamos el componente hijo
    Pagination        // Importamos el componente hijo
  ],
  templateUrl: './list-orders.html',
  styleUrl: './list-orders.css',
  changeDetection: ChangeDetectionStrategy.OnPush // Puede ser beneficioso con signals
})
export class ListOrders {

  orders!: Observable<Order[]>; // El observable que se pasa a la tabla

  private allOrdersSubject = new BehaviorSubject<Order[]>([]);
  private filterSubject = new BehaviorSubject<string>('');
  private currentPageSubject = new BehaviorSubject<number>(1);

  totalItems: number = 0;
  pageSize: number = 10;
  totalPages: number = 0;
  currentPage: number = 1;

  public math = Math; // Para usar Math en la plantilla del padre si es necesario

  errorMessage = signal<string | null>(null);
  loading = signal<boolean>(false); // Controla la visibilidad del esqueleto
  generatingPdf = signal<number | null>(null);

  allProducts: Product[] = []; // Se mantiene aquí para la generación de PDF

  searchForm: ReturnType<FormBuilder['group']>;

  hasTriedLoad = signal<boolean>(false); // True cuando un intento de carga de API ha finalizado

  private initialOrdersProcessed = signal<boolean>(false); // Nueva señal para la primera emisión procesada

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
    const filteredOrders = combineLatest([
      this.allOrdersSubject.asObservable(),
      this.filterSubject.asObservable().pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
    ]).pipe(
      map(([orders, filterTerm]) => {
        const sortedOrders = [...orders].sort((a, b) => (b.id || 0) - (a.id || 0));

        if (!filterTerm.trim()) {
          return sortedOrders;
        }

        const lowerCaseFilter = filterTerm.toLowerCase();
        return sortedOrders.filter(order => {
          const customerName = order.customer?.entity_type === 'N'
            ? `${order.customer?.name} ${order.customer?.last_name}`
            : order.customer?.business_name || '';

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
        this.totalItems = filteredList.length;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);

        // Ajusta la página actual si es mayor que el número total de páginas después del filtrado
        if (this.currentPage > this.totalPages) {
          this.currentPage = this.totalPages > 0 ? this.totalPages : 1;
        }
        this.currentPageSubject.next(this.currentPage);
        this.cdr.markForCheck(); // Fuerza la detección de cambios para totalItems/totalPages
      })
    );

    this.orders = combineLatest([
      filteredOrders,
      this.currentPageSubject.asObservable()
    ]).pipe(
      map(([orders, currentPage]) => {
        const startIndex = (currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        return orders.slice(startIndex, endIndex);
      }),
      tap(() => {
        if (!this.initialOrdersProcessed()) {
          console.log('Orders observable emitted first processed data: hasTriedLoad.set(true)');
          this.hasTriedLoad.set(true);
          this.initialOrdersProcessed.set(true); // Marca que la primera carga procesada ha ocurrido
          this.cdr.markForCheck(); // Fuerza la detección de cambios para la vista principal
        }
      })
    );

    this.searchForm.get('search')!.valueChanges.pipe(
      startWith('')
    ).subscribe(term => {
      this.filterSubject.next(term || '');
      this.currentPage = 1; // Resetear a la primera página con cada nueva búsqueda
      this.currentPageSubject.next(1);
    });
  }

  async loadOrders(): Promise<void> {
    console.log('loadOrders: Start loading, loading.set(true), hasTriedLoad.set(false)');
    this.loading.set(true); // Activa el esqueleto
    this.hasTriedLoad.set(false); // Reinicia el estado de "intento de carga"
    this.initialOrdersProcessed.set(false); // Reinicia la nueva señal
    this.errorMessage.set(null); // Limpia cualquier mensaje de error previo

    this.allProducts = await this.productIDBService.getAll();
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        console.log('API Call Success: loading.set(false)');
        this.allOrdersSubject.next(orders); // Los datos se envían, el pipeline de `orders` se activa
        this.loading.set(false); // Desactiva el esqueleto, *pero hasTriedLoad no se activa aquí*
        this.orderIDBService.saveAll(orders).then(() => {
          console.log('Orders saved to IndexedDB');
        }).catch((error) => {
          console.error('Error saving orders to IndexedDB:', error);
        });
        // NO HACEMOS cdr.markForCheck() aquí para la tabla, se hará en el tap de `orders`
      },
      error: (error) => {
        console.log('API Call Error: loading.set(false), hasTriedLoad.set(true)');
        console.error('Error loading orders:', error);
        this.errorMessage.set('Error al cargar los pedidos. Por favor, inténtelo de nuevo más tarde.');
        this.loading.set(false); // Desactiva el esqueleto
        this.hasTriedLoad.set(true); // Marca que la carga inicial ha finalizado (con error)
        this.initialOrdersProcessed.set(true); // En caso de error, también marcamos como procesado
        this.cdr.markForCheck(); // Fuerza la detección de cambios para mostrar el error
      }
    });
  }

  // Métodos de paginación (ahora serán manejadores de eventos desde el componente PaginationComponent)
  onGoToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.currentPageSubject.next(page);
    }
  }

  onPreviousPage(): void {
    if (this.currentPage > 1) {
      this.onGoToPage(this.currentPage - 1);
    }
  }

  onNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.onGoToPage(this.currentPage + 1);
    }
  }

  // Métodos del buscador (ahora serán manejadores de eventos desde el componente OrdersSearchComponent)
  onClearSearch(): void {
    this.searchForm.get('search')?.setValue('');
  }

  onDownloadReportCsv(): void {
    this.orderService.generateReportExcel().subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'orders_report.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  // Métodos de la tabla (ahora serán manejadores de eventos desde el componente OrdersTableComponent)
  onEditOrder(orderId: number): void {
    this.router.navigate([`/dashboard/pedidos/invoice/${orderId}`]);
  }

  onGeneratePdf(order: Order): void {
    this.generatingPdf.set(order.id!);
    this.errorMessage.set(null); // Limpiar mensaje de error específico de PDF

    const displayItems = adaptOrderToMyCart(
      order,
      this.allProducts,
      0.18 // Asumiendo un IGV del 18%
    );

    console.log('Generating PDF for order:', order.id, 'with display items:', displayItems);

    this.orderService.generateOrderPdf(order.id!, displayItems).subscribe({
      next: (response: Blob) => {
        console.log('PDF generated successfully:', response);
        const fileURL = URL.createObjectURL(response);
        window.open(fileURL, '_blank');
        this.generatingPdf.set(null); // Restablecer el estado de generación de PDF
      },
      error: (error) => {
        console.error('Error al generar el PDF:', error);
        this.errorMessage.set('Error al generar el PDF. Por favor, inténtelo de nuevo más tarde.');
        this.generatingPdf.set(null); // Restablecer el estado de generación de PDF
      }
    });
  }
}