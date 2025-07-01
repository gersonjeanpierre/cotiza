import { AfterViewInit, ChangeDetectorRef, Component, inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ExtraOption } from '@core/models/extra-option';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ProductIndexedDBService } from '@features/quotations/services/products-idb';
import { CurrencyPipe } from '@angular/common';
import { calculateCeltexFoamPrice, calculateLaborPrice } from '@shared/utils/extraOptionList';
import { CustomerModal } from '@features/customer/components/customer-modal/customer-modal';
import { Customer } from '@core/models/customer';
import { CartItem, ProductExtraOption } from '@core/models/cart';
import { Order } from '@core/models/order';
import { Cart } from '@core/models/cart';
import { CartIndexedDBService } from '@features/quotations/services/cart-idb';
import { CustomerService } from '@features/customer/service/customer';

@Component({
  selector: 'app-extra-option-list',
  imports: [ReactiveFormsModule, CurrencyPipe, CustomerModal],
  templateUrl: './extra-option-list.html',
  styleUrl: './extra-option-list.css'
})
export class ExtraOptionList implements OnInit, AfterViewInit {

  // Obtener una referencia al componente del modal
  @ViewChild('customerModalRef') customerModalComponent!: CustomerModal;

  selectedCustomer: Customer | null = null;

  cart: Cart[] = []
  cartId: number = 0;
  cartItem: CartItem[] = [];
  cartExtraOptions: ProductExtraOption[] = [];


  ngAfterViewInit(): void {
    // Es una buena práctica verificar que la referencia ya esté disponible
    console.log('Referencia al modal de clientes:', this.customerModalComponent);
  }

  // Método para abrir el modal desde el botón
  openCustomerModal(): void {
    // Llama al método `openModal()` del componente hijo para mostrar el modal
    if (this.customerModalComponent) {
      this.customerModalComponent.openModal();
    }
  }

  // Método que se ejecuta cuando el modal emite un cliente seleccionado
  onCustomerSelected(customer: Customer): void {
    this.selectedCustomer = customer;
    console.log('Cliente seleccionado:', this.selectedCustomer);
    console.log('Cliente seleccionado:', this.selectedCustomer.id);
    this.cart.push({
      customer_id: this.selectedCustomer.id,
      customer: this.selectedCustomer,
    })
    this.cartIDBService.saveCart(this.cart)
  }


  // Método para refrescar la lista de clientes si algo cambia en el modal
  refreshCustomerList(): void {
    console.log('Refrescando la lista de clientes...');
    // Si necesitas recargar datos adicionales en el componente padre, hazlo aquí.
    // El modal ya se encarga de refrescar su propia lista.
  }

  constructor(
    private route: ActivatedRoute,
    private productIDBService: ProductIndexedDBService,
    private cartIDBService: CartIndexedDBService,
    private cdr: ChangeDetectorRef,
    private customerService: CustomerService
  ) { }

  productId: number = 0;
  extraOption: ExtraOption[] = [];
  height: number = 0; // Esta variable es la que define el Metro Lineal
  width: number = 0;
  area: number = 0;
  quantity: number = 1;
  isCalculating: boolean = false;
  nameProduct: string = '';
  priceMetroLineal: number = 0;
  priceUnit: number = 0;
  priceQuantity: number = 0;
  // Selects radio buttons
  selectedLaminadoId: number | null = null;
  selectedCeltexFoamId: number | null = null;
  selectedManoDeObraId: number = 14;


  private formBuilder = inject(FormBuilder);
  dimensionsForm = this.formBuilder.group({
    width: this.formBuilder.control<number | null>(null),
    height: this.formBuilder.control<number | null>(null),
    quantity: this.formBuilder.control<number | null>(1),
  });

  extraOptionForm = this.formBuilder.group({
    celtexFoam: this.formBuilder.control<number | null>(null),
    laminado: this.formBuilder.control<number | null>(null),
    manoDeObra: this.formBuilder.control<number | null>(null),
    height: this.formBuilder.control<number | null>(null),
    width: this.formBuilder.control<number | null>(null),
  });


  async ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      const id = Number(params.get('productId'));
      this.productId = id;
      if (id) {
        const allProducts = await this.productIDBService.getAll();
        const extraOptions = allProducts.find(product => product.id === id)?.extra_options ?? [];
        this.priceMetroLineal = allProducts.find(product => product.id === id)?.price ?? 0;
        this.nameProduct = allProducts.find(product => product.id === id)?.name ?? '';
        this.extraOption = extraOptions.sort((a, b) => a.id - b.id);

        const lastCart = await this.cartIDBService.getLastCart();
        this.cart = lastCart ? [lastCart] : [];
        this.selectedCustomer = lastCart?.customer ?? null;
        this.cartId = this.cart.find(cart => cart.customer_id === this.selectedCustomer?.id)?.id ?? 0;
        console.log('Carrito cargado:', this.cart);
        console.log('CART ID:', this.cartId);




        this.cdr.detectChanges();
      }
    })

  }

  onSubmit() {
    this.isCalculating = true;
    this.width = this.dimensionsForm.get('width')?.value ?? 0;
    this.height = this.dimensionsForm.get('height')?.value ?? 0;
    this.area = parseFloat((this.width * this.height).toFixed(4));
    this.quantity = this.dimensionsForm.get('quantity')?.value ?? 1;
    this.priceUnit = this.height * this.priceMetroLineal
    this.priceQuantity = this.priceUnit * this.quantity;
    this.extraOptionForm.get('height')?.setValue(this.height);// Metro Lineal
    console.log('Área calculada:', this.area);
    console.log('Ancho:', this.width, 'Alto:', this.height);
    console.log('Form', this.dimensionsForm?.value)

    const cart_id = this.cart.find(cart => cart.customer_id === this.selectedCustomer?.id)?.id ?? 0;
    console.log('cart', this.cart);
    console.log('Cart ID:', cart_id);

    this.cartItem = [{
      product_id: this.productId,
      height: this.height,
      width: this.width,
      quantity: this.quantity,
      linear_meter: this.height,
    }]

    this.cartIDBService.saveCartItem(this.cartItem[0], cart_id)

  }

  calculateExtraOptionPrice() {
    this.selectedLaminadoId = this.extraOptionForm.get('laminado')?.value ?? null;
    this.selectedCeltexFoamId = this.extraOptionForm.get('celtexFoam')?.value ?? null;
    // this.selectedManoDeObraId = this.extraOptionForm.get('manoDeObra')?.value ?? null;
    const laminadoPrice = this.extraOption.find(option => option.id === this.selectedLaminadoId)?.price ?? 0;
    const priceCeltexFoam = this.extraOption.find(option => option.id === this.selectedCeltexFoamId)?.price ?? 0;
    const manoDeObraPrice = this.extraOption.find(option => option.id === this.selectedManoDeObraId)?.price ?? 0;
    // php
    const widthCeltexFoam = this.extraOptionForm.get('width')?.value ?? 0;
    const heightCeltexFoam = this.extraOptionForm.get('height')?.value ?? 0;

    let cf = calculateCeltexFoamPrice(heightCeltexFoam, widthCeltexFoam, priceCeltexFoam)
    let labor = parseInt(calculateLaborPrice(heightCeltexFoam, widthCeltexFoam, manoDeObraPrice).toFixed(2));

    this.extraOptionForm.get('manoDeObra')?.setValue(labor);

    console.log('########### Precios Opciones Extra ###########');
    console.log('Precio Laminado:', laminadoPrice);
    console.log('Precio Celtex Foam Calculado:', cf);
    console.log('Precio Mano de Obra Calculado:', labor);
    console.log('Extra Options Form', this.extraOptionForm?.value);

  }

  onClean() {
    this.isCalculating = false;
    this.width = 0;
    this.height = 0;
    this.area = 0;
    this.quantity = 1;
    this.priceUnit = 0;
    this.priceQuantity = 0;
    this.dimensionsForm.reset({ width: null, height: null, quantity: 1 });
    this.extraOptionForm.reset({
      celtexFoam: null,
      laminado: null,
      manoDeObra: null,
    });
    this.cdr.detectChanges();
  }



  async saveToCart() {
    // const cartId = await db
  }


}

