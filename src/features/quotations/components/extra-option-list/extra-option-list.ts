import { AfterViewInit, ChangeDetectorRef, Component, inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ExtraOption } from '@core/models/extra-option';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ProductIndexedDBService } from '@features/quotations/services/products-idb';
import { CurrencyPipe } from '@angular/common';
import { calculateCeltexFoamPriceAndSheets, calculateLaborPrice } from '@shared/utils/extraOptionList';
import { CustomerModal } from '@features/customer/components/customer-modal/customer-modal';
import { Customer } from '@core/models/customer';
import { CartItem, ProductExtraOption } from '@core/models/cart';
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

  cart: Cart | null = null;
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
  async onCustomerSelected(customer: Customer): Promise<void> {
    this.selectedCustomer = customer;
    console.log('Cliente seleccionado:', this.selectedCustomer);

    const customerCart = await this.cartIDBService.getByCustomerId(this.selectedCustomer.id);

    if (customerCart) {
      // Si ya existe un carrito para este cliente, lo usamos
      this.cart = customerCart;
      this.cartIDBService.deleteCart(this.cart.id ?? 0);
      this.cart = null
      this.cart = {
        customer_id: customerCart.customer_id,
        customer: customerCart.customer,
        items: customerCart.items,
      }
      this.cartIDBService.saveCart([this.cart]);
    }
    else {
      // Si no existe, creamos un nuevo carrito
      this.cart = {
        customer_id: this.selectedCustomer.id,
        customer: this.selectedCustomer,
      };
      this.cartIDBService.saveCart([this.cart]);
      console.log('Nuevo carrito creado:', this.cart);
    }
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

  productExists: boolean = true;
  productTypeExists: boolean = true;

  productId: number = 0;
  extraOption: ExtraOption[] = [];
  height: number = 0; // Esta variable es la que define el Metro Lineal
  width: number = 0;
  area: number = 0;
  quantity: number = 1;
  isCalculating: boolean = false;
  nameProduct: string = '';
  priceBase: number = 0;
  priceUnit: number = 0;
  priceQuantity: number = 0;
  priceMeterSquare: number = 0; // Precio por Metro Cuadrado
  priceQuantityMS: number = 0; // Precio por Metro Cuadrado por Cantidad
  // Gigantografía selected options
  termoselladoValue: string | null = null;
  tuboColganteValue: string | null = null;
  ojalesValue: number | null = null;
  enmarcadoValue: string | null = null;
  // Vinil Selects radio buttons
  laminadoId: number | null = null;
  celtexFoamId: number | null = null;
  manoDeObraId: number = 14;

  quantityExtraOption: number = 1;


  private formBuilder = inject(FormBuilder);
  dimensionsForm = this.formBuilder.group({
    width: this.formBuilder.control<number | null>(null),
    height: this.formBuilder.control<number | null>(null),
    quantity: this.formBuilder.control<number | null>(1),
  });

  extraOptionVinForm = this.formBuilder.group({
    celtexFoam: this.formBuilder.control<number | null>(null),
    laminado: this.formBuilder.control<number | null>(null),
    manoDeObra: this.formBuilder.control<number | null>(null),
    height: this.formBuilder.control<number | null>(null),
    width: this.formBuilder.control<number | null>(null),
  });

  extraOptionGigaForm = this.formBuilder.group({
    termosellado: this.formBuilder.control<string | null>(null),
    tuboColgante: this.formBuilder.control<string | null>(null),
    ojales: this.formBuilder.control<number | null>(null),
    enmarcado: this.formBuilder.control<string | null>(null),
  });



  async ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      const id = Number(params.get('productId'));
      this.productId = id;

      const productTypeId = Number(params.get('productTypeId'));
      console.log('Product Type ID:', productTypeId);

      const allProducts = await this.productIDBService.getAll();
      this.productExists = allProducts.some(product => product.id === id);

      this.productTypeExists = allProducts.map(
        (product) => {
          const productType = product.product_types.some(
            pt => pt.id === productTypeId
          );
          return productType;
        }
      ).includes(true);

      // console.log('Producto existe:', this.productExists);
      console.log('Tipo de producto existe:', this.productTypeExists);

      if (!this.productExists) {
        // Aquí puedes redirigir, mostrar un mensaje o simplemente retornar
        console.warn('El producto no existe o la ruta es inválida');
        this.cdr.detectChanges();
        return;
      }
      const extraOptions = allProducts.find(product => product.id === id)?.extra_options ?? [];
      this.priceBase = allProducts.find(product => product.id === id)?.price ?? 0;
      this.nameProduct = allProducts.find(product => product.id === id)?.name ?? '';
      this.extraOption = extraOptions.sort((a, b) => a.id - b.id);

      const lastCart = await this.cartIDBService.getLastCart();
      this.cart = lastCart ?? null;
      this.selectedCustomer = lastCart?.customer ?? null;
      this.cartId = this.cart?.id ?? 0;
      console.log('Extra Options:', this.extraOption);
      console.log('Carrito cargado:', this.cart);
      console.log('CART ID:', this.cartId);

      if (this.selectedCustomer?.id) {
        const customerCart = await this.cartIDBService.getByCustomerId(this.selectedCustomer.id);
        if (customerCart) {
          // Si ya existe un carrito para este cliente, lo usamos
          this.cart = customerCart;
          this.cartId = customerCart.id ?? 0;
        }
      }
      this.cdr.detectChanges();
    })
  }

  onSubmit() {
    this.isCalculating = true;
    this.width = this.dimensionsForm.get('width')?.value ?? 0;
    this.height = this.dimensionsForm.get('height')?.value ?? 0;
    this.area = parseFloat((this.width * this.height).toFixed(4));
    this.quantity = this.dimensionsForm.get('quantity')?.value ?? 1;
    this.priceUnit = this.height * this.priceBase
    this.priceQuantity = this.priceUnit * this.quantity;
    this.priceMeterSquare = this.priceBase * this.area;
    this.priceQuantityMS = this.priceMeterSquare * this.quantity;
    this.extraOptionVinForm.get('height')?.setValue(this.height);// Metro Lineal
    console.log('Área calculada:', this.area);
    console.log('Ancho:', this.width, 'Alto:', this.height);
    console.log('Form', this.dimensionsForm?.value)

    const cart_id = this.cart?.id ?? 0;
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
    if (this.productId === 1) {
      const ids = [{ termoId: 1, tuboId: 2, ojalesId: 3, enmarcadoId: 4 }];
      const valueTermosellado = this.extraOptionGigaForm.get('termosellado')?.value ?? null;
      const valueTuboColgante = this.extraOptionGigaForm.get('tuboColgante')?.value ?? null;
      const valueOjales = this.extraOptionGigaForm.get('ojales')?.value ?? null;
      const valueEnmarcado = this.extraOptionGigaForm.get('enmarcado')?.value ?? null;
      console.log('Giga form Values:', this.extraOptionGigaForm.value);
      if (valueTermosellado) {
        this.setCartExtraOptionGiga(ids[0].termoId, valueTermosellado);
      }
      if (valueTuboColgante) {
        this.setCartExtraOptionGiga(ids[0].tuboId, valueTuboColgante);
      }
      if (valueOjales) {
        this.setCartExtraOptionGiga(ids[0].ojalesId);
      }
      if (valueEnmarcado) {
        this.setCartExtraOptionGiga(ids[0].enmarcadoId, valueEnmarcado);
      }

      this.cartIDBService.saveCartExtraOptions(this.cartExtraOptions, this.cartId, this.productId);
    }

    if (this.productId >= 2 && this.productId <= 9) {
      this.laminadoId = this.extraOptionVinForm.get('laminado')?.value ?? null;
      this.celtexFoamId = this.extraOptionVinForm.get('celtexFoam')?.value ?? null;
      // this.selectedManoDeObraId = this.extraOptionForm.get('manoDeObra')?.value ?? null;
      const laminadoPrice = this.extraOption.find(option => option.id === this.laminadoId)?.price ?? 0;
      const priceCeltexFoam = this.extraOption.find(option => option.id === this.celtexFoamId)?.price ?? 0;
      const manoDeObraPrice = this.extraOption.find(option => option.id === this.manoDeObraId)?.price ?? 0;
      // php
      const widthCeltexFoam = this.extraOptionVinForm.get('width')?.value ?? 0;
      const heightCeltexFoam = this.extraOptionVinForm.get('height')?.value ?? 0;

      let cf = calculateCeltexFoamPriceAndSheets(heightCeltexFoam, widthCeltexFoam, priceCeltexFoam)
      this.quantityExtraOption = cf.sheetsUsed;
      let labor = parseInt(calculateLaborPrice(heightCeltexFoam, widthCeltexFoam, manoDeObraPrice).toFixed(2));

      this.extraOptionVinForm.get('manoDeObra')?.setValue(this.manoDeObraId);

      console.log('########### Precios Opciones Extra ###########');
      console.log('Precio Laminado:', laminadoPrice);
      console.log('Precio Celtex Foam Calculado:', cf);
      console.log('Precio Mano de Obra Calculado:', labor);
      console.log('Extra Options Form', this.extraOptionVinForm?.value);

      console.log('########### Fin Precios Opciones Extra ###########');
      this.setCartExtraOptionVin(this.laminadoId ?? 0);
      this.setCartExtraOptionVin(this.celtexFoamId ?? 0);

      console.log('Cart Extra Options:', this.cartExtraOptions);

      this.cartIDBService.saveCartExtraOptions(this.cartExtraOptions, this.cartId, this.productId)
    }


  }

  setCartExtraOptionGiga(id: number, giga_select: string | null = null) {
    const gigaForm = this.extraOptionGigaForm.value;
    if (id === 1) { // Termosellado
      this.cartExtraOptions.push({
        extra_option_id: id,
        quantity: this.quantity ?? null,
        giga_select: giga_select,
      });
    }
    if (id === 2) { // Tubo Colgante
      this.cartExtraOptions.push({
        extra_option_id: id,
        quantity: this.quantity ?? null,
        giga_select: giga_select,
      });
    }
    if (id === 3) { // Ojales
      this.cartExtraOptions.push({
        extra_option_id: id,
        quantity: (gigaForm.ojales ?? 1 * this.quantity),
        giga_select: giga_select,
      });
    }
    if (id === 4) { // Enmarcado
      this.cartExtraOptions.push({
        extra_option_id: id,
        quantity: this.quantity ?? null,
        giga_select: giga_select,
      });
    }
  }

  setCartExtraOptionVin(id: number) {
    const extraform = this.extraOptionVinForm.value;
    if (id >= 5 && id <= 8) { // Laminados
      this.cartExtraOptions.push({
        extra_option_id: id,
        quantity: this.quantity ?? null,
        linear_meter: this.height ?? null,
        width: this.width ?? null,
      })
    }
    if (id >= 10 && id <= 13) { // Foam Celtex
      this.cartExtraOptions.push({
        extra_option_id: id,
        quantity: (this.quantity * this.quantityExtraOption),
        linear_meter: this.height ?? null,
        width: extraform.width ?? null,
      })
      this.cartExtraOptions.push({
        extra_option_id: 14, // Mano de Obra
        quantity: (this.quantity * this.quantityExtraOption),
        linear_meter: this.height ?? null,
        width: extraform.width ?? null,
      })
    }
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
    this.extraOptionVinForm.reset({
      celtexFoam: null,
      laminado: null,
      manoDeObra: null,
    });
    this.cdr.detectChanges();
  }

}

