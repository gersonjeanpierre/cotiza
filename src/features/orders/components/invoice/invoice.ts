import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectorRef, Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Order } from '@core/models/order';
import { OrderIndexedDBService } from '@features/orders/service/order-idb';
import { OrderService } from '@features/orders/service/order';
import { OrderStatusesIndexedDBService } from '@features/orders/service/order-statuses-idb';
import { OrderStatus } from '@core/models/order-status';
import { Product } from '@core/models/product';
import { adaptOrderToMyCart } from '@shared/utils/priceDisplay';
import { ProductIndexedDBService } from '@features/quotations/services/products-idb';
import { firstValueFrom } from 'rxjs';
import { getColorStatus } from '@shared/utils/orderUtils';
@Component({
  selector: 'app-invoice',
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule, DecimalPipe],
  templateUrl: './invoice.html',
  styleUrl: './invoice.css'
})
export class Invoice {

  orderId: number = 0;
  // Cambiar a signal para reactive updates
  order = signal<Order | null>(null);
  orderStatuses: OrderStatus[] = [];

  allProducts: Product[] = [];
  displayDetails = signal<any[]>([]);

  // Estados de la UI
  isEditing = signal<boolean>(false);
  loading = signal<boolean>(false);
  saving = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Formulario de edición
  editForm: ReturnType<FormBuilder['group']>;

  constructor(
    private orderIDBService: OrderIndexedDBService,
    private orderStatusesIDBService: OrderStatusesIndexedDBService,
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private productIDBService: ProductIndexedDBService
  ) {
    // Inicializar el formulario con valores por defecto
    this.editForm = this.fb.group({
      order_status_id: [1, Validators.required],
      payment_method: ['', Validators.required],
      notes: ['']
    });

  }

  async ngOnInit(): Promise<void> {
    this.loading.set(true);

    try {
      // Cargar estados de pedidos
      this.orderStatuses = await this.orderStatusesIDBService.getAll();
      const allowedIds = [1, 2, 3, 4, 8, 9];
      this.orderStatuses = this.orderStatuses.filter(status => allowedIds.includes(status.id));

      this.allProducts = await this.productIDBService.getAll();
      // Obtener ID del pedido y cargar datos
      this.route.paramMap.subscribe(async params => {
        this.orderId = Number(params.get('orderId'));
        await this.loadOrder();
      });
    } catch (error) {
      console.error('Error initializing invoice:', error);
      this.errorMessage.set('Error al cargar la factura');
    } finally {
      this.loading.set(false);
    }
  }

  async loadOrder(): Promise<void> {
    try {
      console.log('Loading order with ID:', this.orderId);

      // Primero intentar cargar desde IndexedDB
      let orderData = await this.orderIDBService.getById(this.orderId);

      // Si no está en IndexedDB, cargar desde API
      if (!orderData) {
        console.log('Order not found in IndexedDB, fetching from API...');
        orderData = await this.orderService.getOrderById(this.orderId).toPromise();
      }

      if (orderData) {
        this.order.set(orderData);
        console.log('Order loaded successfully:', orderData);

        // Adaptar detalles con nombres y precios
        const enrichedDetails = adaptOrderToMyCart(orderData, this.allProducts);
        this.displayDetails.set(enrichedDetails);

        // Poblar el formulario con los datos actuales
        this.editForm.patchValue({
          order_status_id: orderData.order_status_id || 1,
          payment_method: orderData.payment_method || 'TRANSFERENCIA BANCARIA',
          notes: orderData.notes || ''
        });

        // Forzar detección de cambios
        this.cdr.detectChanges();
      } else {
        console.log('Order not found');
        this.order.set(null);
        this.displayDetails.set([]);
      }

    } catch (error) {
      console.error('Error loading order:', error);
      this.errorMessage.set('Error al cargar el pedido');
      this.order.set(null);
      this.displayDetails.set([]);
    }
  }

  // Alternar modo de edición
  toggleEdit(): void {
    this.isEditing.set(!this.isEditing());
    this.clearMessages();

    const currentOrder = this.order();
    if (!this.isEditing() && currentOrder) {
      // Si se cancela la edición, restaurar valores originales
      this.editForm.patchValue({
        order_status_id: currentOrder.order_status_id || 1,
        payment_method: currentOrder.payment_method || 'TRANSFERENCIA BANCARIA',
        notes: currentOrder.notes || ''
      });
    }
  }

  // Guardar cambios
  async saveChanges(): Promise<void> {
    const currentOrder = this.order();
    if (this.editForm.invalid || !currentOrder?.id) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.clearMessages();

    try {
      const updatedData = {
        order_status_id: this.editForm.value.order_status_id!,
        payment_method: this.editForm.value.payment_method!,
        notes: this.editForm.value.notes || ''
      };


      // Actualizar en el backend
      await firstValueFrom(this.orderService.updateOrder(currentOrder.id, updatedData));

      const refreshedOrder = await firstValueFrom(this.orderService.getOrderById(currentOrder.id));

      if (refreshedOrder) {
        // Actualizar orden local
        this.order.set(refreshedOrder);

        // Adaptar detalles con nombres y precios
        const enrichedDetails = adaptOrderToMyCart(refreshedOrder, this.allProducts);
        this.displayDetails.set(enrichedDetails);

        // Guardar en IndexedDB
        await this.orderIDBService.saveAll([refreshedOrder]);

        this.successMessage.set('Pedido actualizado correctamente');
        this.isEditing.set(false);

        // Forzar detección de cambios
        this.cdr.detectChanges();

        // Limpiar mensaje después de 3 segundos
        setTimeout(() => this.successMessage.set(null), 3000);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      this.errorMessage.set('Error al actualizar el pedido. Inténtelo de nuevo.');
    } finally {
      this.saving.set(false);
    }
  }

  // Volver a la lista de pedidos
  goBackToOrders(): void {
    this.router.navigate(['/dashboard/pedidos']);
  }

  // Obtener nombre del estado por ID
  getStatusName(statusId: number): string {
    return this.orderStatuses.find(status => status.id === statusId)?.name || 'Desconocido';
  }

  // Limpiar mensajes
  private clearMessages(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }



  getColorStatus = (statusId: number): string => {
    return getColorStatus(statusId);
  }

}