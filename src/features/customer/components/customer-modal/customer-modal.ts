
import { Component, ViewChild, Output, ElementRef, EventEmitter, inject, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateCustomerPayload, Customer } from '@core/models/customer';
import { CustomerService } from '@features/customer/service/customer';
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, map, startWith, tap } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { AsyncPipe } from '@angular/common';
import { TypeClientIndexedDBService } from '@features/quotations/services/type-client-idb';
import Swal from 'sweetalert2';
import { ErrorModal } from "@shared/components/alert/error-modal/error-modal";

@Component({
  selector: 'app-customer-modal',
  imports: [ReactiveFormsModule, AsyncPipe, ErrorModal],
  templateUrl: './customer-modal.html',
  styleUrl: './customer-modal.css'
})
export class CustomerModal implements OnInit {

  @ViewChild('customerDialog') dialog!: ElementRef<HTMLDialogElement>;   // Referencia al elemento <dialog> para controlarlo desde TS 
  @Output() customerSelected = new EventEmitter<Customer>();  // Evento que se emite cuando se selecciona un cliente
  @Output() customersChanged = new EventEmitter<void>();   // Evento que se emite cuando hay cambios en los clientes (creación, edición, borrado)

  // --- RxJS Subjects para el flujo de datos ---
  // Guarda la lista completa de clientes cargada del backend
  private allCustomersSubject = new BehaviorSubject<Customer[]>([]);
  // Guarda el término de búsqueda
  private filterSubject = new BehaviorSubject<string>('');
  // Guarda el número de página actual
  private currentPageSubject = new BehaviorSubject<number>(1);

  customers: Observable<Customer[]> = new Observable<Customer[]>();

  // Propiedades para la UI de paginación
  totalItems: number = 0;
  pageSize: number = 10;
  totalPages: number = 0;
  currentPage: number = 1;

  // Control para el input del buscador


  currentView: 'list' | 'form' = 'list';
  isEditing: boolean = false;
  editingCustomerId: number | null = null;
  customerForm: FormGroup; // Formulario reactivo para crear/editar clientes
  searchForm: FormGroup;

  // Type Client
  typeCLients: { id: number, name: string }[] = [];

  // Modal de error
  showErrorModal = signal<boolean>(false);
  errorMessage = signal<string>('');

  constructor(
    private customerService: CustomerService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private typeClientIDBService: TypeClientIndexedDBService
  ) {
    this.searchForm = this.fb.group({
      search: this.fb.control<string>('', Validators.required)
    });
    this.customerForm = this.fb.group({
      type_client_id: this.fb.control(null, Validators.required),
      entity_type: this.fb.control<'N' | 'J'>('N', Validators.required),
      ruc: this.fb.control<string | null>(null),
      dni: this.fb.control<string | null>(null),
      doc_foreign: this.fb.control<string | null>(null),
      name: this.fb.control<string | null>(null),
      last_name: this.fb.control<string | null>(null),
      business_name: this.fb.control<string | null>(null),
      phone_number: this.fb.control<string | null>(null),
      email: this.fb.control<string | null>(null)
    })


  }

  async ngOnInit(): Promise<void> {
    // Suscribir a los cambios del tipo de entidad para actualizar validaciones
    this.updateFormValidators(this.customerForm.get('entity_type')?.value);
    this.customerForm.get('entity_type')?.valueChanges.subscribe(type => this.updateFormValidators(type));
    this.typeCLients = (await this.typeClientIDBService.getAll()).map(typeClient => ({
      id: typeClient.id,
      name: typeClient.name
    })
    );

    // Deshabilitar doc_foreign si hay valor en dni
    this.customerForm.get('dni')?.valueChanges.subscribe(dniValue => {
      const docForeignControl = this.customerForm.get('doc_foreign');
      if (dniValue && dniValue.trim() !== '') {
        docForeignControl?.disable({ emitEvent: false });
      } else {
        docForeignControl?.enable({ emitEvent: false });
      }
    });

    // Deshabilitar dni si hay valor en doc_foreign
    this.customerForm.get('doc_foreign')?.valueChanges.subscribe(docForeignValue => {
      const dniControl = this.customerForm.get('dni');
      if (docForeignValue && docForeignValue.trim() !== '') {
        dniControl?.disable({ emitEvent: false });
      } else {
        dniControl?.enable({ emitEvent: false });
      }
    });

    // --- LÓGICA PRINCIPAL DE ORDENAMIENTO, FILTRADO Y PAGINACIÓN CON RxJS ---
    const filteredCustomers = combineLatest([
      this.allCustomersSubject.asObservable(),
      this.filterSubject.asObservable().pipe(
        debounceTime(300), // Espera 300ms después de la última pulsación de tecla
        distinctUntilChanged() // Evita emitir el mismo valor repetidamente
      )
    ]).pipe(
      map(([customers, filterTerm]) => {
        // 1. Ordenar por ID de forma descendente (del último al primero)
        const sortedCustomers = [...customers].sort((a, b) => b.id - a.id);

        // 2. Filtrar la lista ordenada
        const lowerCaseFilter = filterTerm.toLowerCase();
        return sortedCustomers.filter(customer =>
          customer.name?.toLowerCase().includes(lowerCaseFilter) ||
          customer.last_name?.toLowerCase().includes(lowerCaseFilter) ||
          customer.business_name?.toLowerCase().includes(lowerCaseFilter) ||
          customer.email?.toLowerCase().includes(lowerCaseFilter) ||
          customer.dni?.includes(lowerCaseFilter) ||
          customer.ruc?.includes(lowerCaseFilter) ||
          customer.doc_foreign?.includes(lowerCaseFilter)
        );

      }),
      tap(filteredList => {
        // Actualiza las propiedades de paginación
        this.totalItems = filteredList.length;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        // Ajusta la página actual si es necesario (ej. al filtrar)
        if (this.currentPage > this.totalPages) {
          this.currentPage = this.totalPages > 0 ? this.totalPages : 1;
        }
        this.currentPageSubject.next(this.currentPage);

      })
    );

    // 3. Paginación: Combina la lista filtrada con el número de página para obtener la vista actual
    this.customers = combineLatest([
      filteredCustomers,
      this.currentPageSubject.asObservable()
    ]).pipe(
      map(([customers, currentPage]) => {
        const startIndex = (currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        return customers.slice(startIndex, endIndex);

      })

    );

    // 4. Conectar el control de búsqueda al Subject de filtro
    this.searchForm.get('search')!.valueChanges.pipe(
      startWith(''),
    ).subscribe(term => {
      this.filterSubject.next(term);
      this.goToPage(1); // Reiniciar a la primera página al buscar
      this.cdr.detectChanges();
    });

    window.addEventListener('keydown', this.handleEscKey);

  }

  ngDestroy(): void {
    window.removeEventListener('keydown', this.handleEscKey);
  }

  // --- Métodos de control del Modal ---
  openModal(): void {
    this.currentView = 'list';
    this.loadAllCustomers(); // Carga la lista completa al abrir
    this.dialog.nativeElement.showModal();
  }

  closeModal(): void {
    this.dialog.nativeElement.close();
    this.showErrorModal.set(false); // Cierra el modal de error si está abierto
    this.currentView = 'list';
    this.searchForm.get('search')?.setValue(''); // Limpia el campo de búsqueda al cerrar
  }

  // --- Métodos de Paginación ---
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.currentPageSubject.next(page);
    }
  }

  getPages(): number[] {
    // Genera un array [1, 2, 3, ...] para los botones de paginación
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // --- Carga de Datos desde el Servicio ---
  loadAllCustomers(): void {
    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        this.allCustomersSubject.next(customers);
      },
      error: (err) => console.error('Error al cargar clientes:', err)
    });
  }

  // --- Selección y CRUD ---
  selectCustomer(customer: Customer): void {
    this.customerSelected.emit(customer);
    this.closeModal();
  }

  showCreateForm(): void {
    this.isEditing = false;
    this.customerForm.reset({ entity_type: 'N' });
    this.currentView = 'form';
  }

  showEditForm(customer: Customer): void {
    this.isEditing = true;
    this.editingCustomerId = customer.id;
    this.customerForm.patchValue({
      ...customer,
      type_client_id: customer.type_client.id // Mapea el objeto a ID
    });
    this.updateFormValidators(customer.entity_type);
    this.currentView = 'form';
  }

  saveCustomer(): void {
    // if (this.customerForm.invalid) {
    //   this.customerForm.markAllAsTouched();
    //   return;
    // }

    const payload: CreateCustomerPayload = this.customerForm.value;

    console.log('Payload:', payload);

    if (this.isEditing && this.editingCustomerId) {
      this.customerService.updateCustomer(this.editingCustomerId, payload).subscribe({
        next: () => {
          this.customersChanged.emit();

          this.customerService.getCustomerById(this.editingCustomerId as number).subscribe((customer) => {
            this.customerSelected.emit(customer);
          });

          this.currentView = 'list';
          this.loadAllCustomers(); // Vuelve a cargar la lista para ver los cambios
        },
        error: (err) => {
          this.errorMessage.set(err.message || 'Ocurrió un error inesperado');
          this.showErrorModal.set(true);
        }
      });
    } else {
      this.customerService.createCustomer(payload).subscribe({
        next: () => {
          this.customersChanged.emit();
          this.currentView = 'list';
          this.loadAllCustomers(); // Vuelve a cargar la lista para ver el nuevo cliente
        },
        error: (err) => {
          console.error('Error al crear cliente:', err);
          this.errorMessage.set(err.error?.detail?.[0]?.msg || err.message || 'Ocurrió un error inesperado');
          this.showErrorModal.set(true);
        }
      });
    }
  }

  deleteCustomer(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      this.customerService.deleteCustomer(id).subscribe({
        next: () => {
          this.customersChanged.emit();
          this.loadAllCustomers();
        },
        error: (err) => {
          console.error('Error al actualizar cliente:', err);
          this.errorMessage.set(err.error?.detail?.[0]?.msg || err.message || 'Ocurrió un error inesperado');
          this.showErrorModal.set(true);
        }
      });
    }
  }

  backToList(): void {
    this.currentView = 'list';
  }

  // Lógica de validación del formulario (igual que antes)
  private updateFormValidators(entityType: 'N' | 'J'): void {
    const nameControl = this.customerForm.get('name');
    const lastNameControl = this.customerForm.get('last_name');
    const businessNameControl = this.customerForm.get('business_name');
    const rucControl = this.customerForm.get('ruc');
    const phoneNumberControl = this.customerForm.get('phone_number');

    [nameControl, lastNameControl, businessNameControl, rucControl, phoneNumberControl].forEach(c => c?.clearValidators());

    if (entityType === 'N') {
      nameControl?.setValidators(Validators.required);
      lastNameControl?.setValidators(Validators.required);
      phoneNumberControl?.setValidators([Validators.required, Validators.pattern(/^\d{9,15}$/)]);
    } else if (entityType === 'J') {
      businessNameControl?.setValidators(Validators.required);
      rucControl?.setValidators(Validators.required);
      phoneNumberControl?.setValidators([Validators.required, Validators.pattern(/^\d{9,15}$/)]);
    }

    [nameControl, lastNameControl, businessNameControl, rucControl, phoneNumberControl].forEach(c => c?.updateValueAndValidity());
  }

  handleEscKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      if (this.showErrorModal()) {
        this.showErrorModal.set(false);
        // Previene que el <dialog> se cierre si solo quieres cerrar el error
        // Si quieres cerrar ambos, sigue:
        this.closeModal();
      } else if (this.dialog?.nativeElement.open) {
        this.closeModal();
      }
    }
  };

}