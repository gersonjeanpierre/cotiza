import { Component, ViewChild, Output, ElementRef, EventEmitter, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateCustomerPayload, Customer } from '@core/models/customer';
import { CustomerService } from '@features/customer/service/customer';
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, map, startWith, tap } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-customer-modal',
  imports: [ReactiveFormsModule, AsyncPipe],
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

  constructor(
    private customerService: CustomerService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
  ) {
    this.searchForm = this.fb.group({
      search: this.fb.control<string>('', Validators.required)
    });
    this.customerForm = this.fb.group({
      type_client_id: this.fb.control(Validators.required),
      entity_type: this.fb.control<'N' | 'J'>('N', Validators.required),
      ruc: this.fb.control<string | null>(null),
      dni: this.fb.control<string | null>(null),
      doc_foreign: this.fb.control<string | null>(null),
      name: this.fb.control<string | null>(null),
      last_name: this.fb.control<string | null>(null),
      business_name: this.fb.control<string | null>(null),
      phone_number: this.fb.control<string | null>(null),
      email: this.fb.control<string | null>(null),
    })

  }

  ngOnInit(): void {
    // Suscribir a los cambios del tipo de entidad para actualizar validaciones
    this.updateFormValidators(this.customerForm.get('entity_type')?.value);
    this.customerForm.get('entity_type')?.valueChanges.subscribe(type => this.updateFormValidators(type));

    // --- LÓGICA PRINCIPAL DE ORDENAMIENTO, FILTRADO Y PAGINACIÓN CON RxJS ---
    const filteredCustomers = combineLatest([
      this.allCustomersSubject.asObservable(),
      this.filterSubject.asObservable().pipe(
        debounceTime(300), // Espera 300ms después de la última pulsación de tecla
        distinctUntilChanged() // Evita emitir el mismo valor repetidamente
      )
    ]).pipe(
      map(([customers, filterTerm]) => {
        // 1. Ordenar por ID de forma ascendente
        const sortedCustomers = [...customers].sort((a, b) => a.id - b.id);

        // 2. Filtrar la lista ordenada
        const lowerCaseFilter = filterTerm.toLowerCase();
        return sortedCustomers.filter(customer =>
          customer.name?.toLowerCase().includes(lowerCaseFilter) ||
          customer.last_name?.toLowerCase().includes(lowerCaseFilter) ||
          customer.business_name?.toLowerCase().includes(lowerCaseFilter) ||
          customer.email.toLowerCase().includes(lowerCaseFilter) ||
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

  }

  // --- Métodos de control del Modal ---
  openModal(): void {
    this.currentView = 'list';
    this.loadAllCustomers(); // Carga la lista completa al abrir
    this.dialog.nativeElement.showModal();
  }

  closeModal(): void {
    this.dialog.nativeElement.close();
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
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }
    const payload: CreateCustomerPayload = this.customerForm.value;
    if (this.isEditing && this.editingCustomerId) {
      this.customerService.updateCustomer(this.editingCustomerId, payload).subscribe({
        next: () => {
          this.customersChanged.emit();
          this.currentView = 'list';
          this.loadAllCustomers(); // Vuelve a cargar la lista para ver los cambios
        },
        error: (err) => console.error('Error al actualizar cliente:', err)
      });
    } else {
      this.customerService.createCustomer(payload).subscribe({
        next: () => {
          this.customersChanged.emit();
          this.currentView = 'list';
          this.loadAllCustomers(); // Vuelve a cargar la lista para ver el nuevo cliente
        },
        error: (err) => console.error('Error al crear cliente:', err)
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
        error: (err) => console.error('Error al eliminar cliente:', err)
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
    const dniControl = this.customerForm.get('dni');
    const docForeignControl = this.customerForm.get('doc_foreign');

    [nameControl, lastNameControl, businessNameControl, rucControl, dniControl, docForeignControl].forEach(c => c?.clearValidators());

    if (entityType === 'N') {
      nameControl?.setValidators(Validators.required);
      lastNameControl?.setValidators(Validators.required);
    } else if (entityType === 'J') {
      businessNameControl?.setValidators(Validators.required);
      rucControl?.setValidators(Validators.required);
    }

    [nameControl, lastNameControl, businessNameControl, rucControl, dniControl, docForeignControl].forEach(c => c?.updateValueAndValidity());
  }
}