import { AfterViewInit, ChangeDetectorRef, Component, inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ExtraOption } from '@core/models/extra-option';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ProductIndexedDBService } from '@features/quotations/services/products-idb';
import { CurrencyPipe } from '@angular/common';
import { calculateCeltexFoamPriceAndSheets, calculateLaborPrice, getPriceGigaForTypeClient, getPriceVinylForTypeClient } from '@shared/utils/extraOptionList';
import { CustomerModal } from '@features/customer/components/customer-modal/customer-modal';
import { Customer } from '@core/models/customer';
import { MyCart, MyCartDetail, MyCartDetailExtraOption } from '@core/models/cart';

import { getProductPrice } from '@shared/utils/priceDisplay';
import { MyCartIndexedDBService } from '@features/cart/service/my-cart-idb';
import { Product } from '@core/models/product';

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

  myCart: MyCart | null = null; // Carrito de compras del usuario
  myCartId: number = 0; // ID del carrito de compras del usuario
  myCartDetail: MyCartDetail | null = null; // Detalles del carrito de compras
  myCartDetailExtraOption: MyCartDetailExtraOption[] | null = null; // Detalles de las opciones extra del carrito

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

    let customerMyCart = await this.myCartIDBService.getByCustomerId(this.selectedCustomer.id);
    // M Y   C A R T
    // 2. Si NO existe, crear el myCart
    if (!customerMyCart) {
      this.myCart = {
        customer_id: this.selectedCustomer.id,
        customer: this.selectedCustomer,
        store_id: 1, // Asignar un store_id por defecto o según tu lógica
        order_status_id: null,
        total_amount: 0,
        profit_margin: 0,
        discount_applied: 0,
        final_amount: 0,
        payment_method: null,
        shipping_address: null,
        notes: null,
        details: [],
      };
      await this.myCartIDBService.saveMyCart(this.myCart);
      this.myCart = await this.myCartIDBService.getByCustomerId(this.selectedCustomer.id) ?? null;
      this.myCartId = this.myCart?.id ?? 0;
      console.log('Nuevo My Cart creado:', this.myCart);
    }
    if (customerMyCart) {
      await this.myCartIDBService.updateCustomerInMyCart(this.selectedCustomer.id, customer);
      customerMyCart = await this.myCartIDBService.getByCustomerId(this.selectedCustomer.id);
      if (this.myCart) {
        await this.myCartIDBService.deleteMyCart(customerMyCart?.id ?? 0);
        delete customerMyCart?.id;
        await this.myCartIDBService.saveMyCart(customerMyCart!);
      }
      this.myCart = await this.myCartIDBService.getByCustomerId(this.selectedCustomer.id!) ?? null;
      this.myCartId = this.myCart?.id ?? 0;
      this.cdr.detectChanges();
    }
    this.updatePriceBase(customer);
    this.cdr.detectChanges();
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
    private cdr: ChangeDetectorRef,
    private myCartIDBService: MyCartIndexedDBService,
  ) { }

  productExists: boolean = true;
  productTypeExists: boolean = true;

  productId: number = 0;
  productTypeId: number = 0;
  extraOption: ExtraOption[] = [];
  height: number = 0; // Esta variable es la que define el Metro Lineal
  width: number = 0;
  area: number = 0;
  quantity: number = 1;
  isCalculating: boolean = false;
  nameProduct: string = '';
  priceBase: number = 0;
  priceBaseVinil: number = 0;
  priceBaseMarginIGV: number = 0; // Precio del producto
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

  allProducts: Product[] = [];

  typeClient: 'final' | 'imprentero' = 'final'; // Tipo de cliente, por defecto 'final'

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

  dimensionTroqueladoForm = this.formBuilder.group({
    diameter: this.formBuilder.control<number | null>(null),
    quantity: this.formBuilder.control<number | null>(null),
  });


  async ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      this.productId = Number(params.get('productId'));
      this.productTypeId = Number(params.get('productTypeId'));
      this.allProducts = await this.productIDBService.getAll();
      this.priceBaseVinil = this.allProducts.find(product => product.id === this.productId)?.price ?? 0;
      console.log('precio base vinil:', this.priceBaseVinil);

      //////// MY CART///////////////
      this.myCart = await this.myCartIDBService.getLastMyCart() || null;
      this.myCartId = this.myCart?.id ?? 0;
      this.selectedCustomer = this.myCart?.customer ?? null;
      console.log('My Cart LAST :', this.myCart);


      this.typeClient = this.myCart?.customer?.type_client.name.includes('Final')
        ? 'final'
        : 'imprentero';

      this.productExists = this.allProducts.some(product => product.id === this.productId);

      this.productTypeExists = this.allProducts.map(
        (product) => {
          const productType = product.product_types.some(
            pt => pt.id === this.productTypeId
          );
          return productType;
        }
      ).includes(true);

      if (!this.productExists) {
        // Aquí puedes redirigir, mostrar un mensaje o simplemente retornar
        console.warn('El producto no existe o la ruta es inválida');
        this.cdr.detectChanges();
        return;
      }
      if (this.productId === 1) {
        this.priceBase = getPriceGigaForTypeClient(this.typeClient, 1) * (1.18) * (1 + (this.myCart?.customer?.type_client?.margin ?? 0));
      } else if (this.productId >= 2 && this.productId <= 9) {

        this.priceBase = getPriceVinylForTypeClient(this.productId, this.typeClient, this.priceBaseVinil) * (1.18) * (1 + (this.myCart?.customer?.type_client?.margin ?? 0));
        // console.log('Precio Base Vinil:', this.priceBase);
      }

      const extraOptions = this.allProducts.find(product => product.id === this.productId)?.extra_options ?? [];
      this.nameProduct = this.allProducts.find(product => product.id === this.productId)?.name ?? '';
      this.extraOption = extraOptions.sort((a, b) => a.id - b.id);



      this.dimensionsForm.get('quantity')?.valueChanges.subscribe((qty: number | null) => {
        this.quantity = qty ?? 1;
        const priceBase = this.allProducts.find(product => product.id === this.productId)?.price ?? 0;
        const typeClient = this.myCart?.customer?.type_client.name.includes('Final')
          ? 'final'
          : 'imprentero';
        this.priceBaseMarginIGV = getProductPrice(
          this.productId,
          priceBase,
          typeClient,
          this.quantity,
          this.height,
          this.width,
          this.myCart?.customer?.type_client?.margin ?? 0,
          0.18 // IGV default value
        );
        this.cdr.detectChanges();
      });
      this.cdr.detectChanges();
    })
  }

  onSubmit() {

    const typeClient = this.myCart?.customer?.type_client.name.includes('Final')
      ? 'final'
      : 'imprentero';
    this.isCalculating = true;
    this.width = this.dimensionsForm.get('width')?.value ?? 0;
    this.height = this.dimensionsForm.get('height')?.value ?? 0;
    this.area = parseFloat((this.width * this.height).toFixed(4));
    this.quantity = this.dimensionsForm.get('quantity')?.value ?? 1;
    if (this.productId === 1) {
      if (this.height <= 1) {
        this.height = 1; // Aseguramos que el alto sea al menos 1 metro
      }
      if (this.width <= 1) {
        this.width = 1; // Aseguramos que el ancho sea al menos 1 metro
      }
      this.area = parseFloat((this.width * this.height).toFixed(4));
      this.priceBase = getPriceGigaForTypeClient(typeClient, this.quantity) * (1.18) * (1 + (this.myCart?.customer?.type_client?.margin ?? 0));
      this.priceBaseMarginIGV = Number(getProductPrice(
        this.productId,
        this.priceBase,
        typeClient,
        this.quantity,
        this.height,
        this.width,
        this.myCart?.customer?.type_client?.margin ?? 0,
        0.18 // IGV default value
      ).toFixed(2));
    } else if (this.productId >= 2 && this.productId <= 9) {
      this.priceBaseMarginIGV = Number(getProductPrice(
        this.productId,
        this.priceBaseVinil,
        typeClient,
        this.quantity,
        this.height,
        this.width,
        this.myCart?.customer?.type_client?.margin ?? 0,
        0.18 // IGV default value
      ).toFixed(2));
    }

    console.log('Precio Base con Margen e IGV:', this.priceBaseMarginIGV);

    this.priceUnit = this.priceBaseMarginIGV
    this.priceQuantity = this.priceUnit * this.quantity;
    this.priceMeterSquare = this.priceBaseMarginIGV;

    this.priceQuantityMS = Number((this.priceMeterSquare * this.quantity).toFixed(2));
    this.extraOptionVinForm.get('height')?.setValue(this.height);// Metro Lineal

    this.myCartDetail = {
      product_id: this.productId,
      height: this.height,
      width: this.width,
      quantity: this.quantity,
      linear_meter: this.height,
      subtotal: this.priceBaseMarginIGV * this.quantity,
      total_extra_options: 0, // Inicialmente 0, se actualizará al agregar opciones extra
      extra_options: [],
    }
    console.log('My Cart Detail:', this.myCartDetail);
    this.myCartIDBService.saveMyCartDetail(this.myCartDetail, this.myCart?.id ?? 0);
  }

  calculateExtraOptionPrice() {
    if (this.productId === 1) {
      const ids = { termoId: 1, tuboId: 2, ojalesId: 3, enmarcadoId: 4 };
      const valueTermosellado = this.extraOptionGigaForm.get('termosellado')?.value ?? null;
      const valueTuboColgante = this.extraOptionGigaForm.get('tuboColgante')?.value ?? null;
      const valueOjales = this.extraOptionGigaForm.get('ojales')?.value ?? null;
      const valueEnmarcado = this.extraOptionGigaForm.get('enmarcado')?.value ?? null;
      console.log('Giga form Values:', this.extraOptionGigaForm.value);
      if (valueTermosellado) {
        this.setCartExtraOptionGiga(ids.termoId, 1, valueTermosellado);
      }
      if (valueTuboColgante) {
        this.setCartExtraOptionGiga(ids.tuboId, 1, valueTuboColgante);
      }
      if (valueOjales) {
        this.setCartExtraOptionGiga(ids.ojalesId, valueOjales);
      }
      if (valueEnmarcado) {
        this.setCartExtraOptionGiga(ids.enmarcadoId, 1, valueEnmarcado);
      }
      this.myCartIDBService.saveMyCartDetailExtraOptions(this.myCartDetailExtraOption ?? [], this.myCart?.id ?? 0, this.productId);
    }

    if (this.productId >= 2 && this.productId <= 9) {
      this.laminadoId = this.extraOptionVinForm.get('laminado')?.value ?? null;
      this.celtexFoamId = this.extraOptionVinForm.get('celtexFoam')?.value ?? null;
      this.extraOptionVinForm.get('manoDeObra')?.setValue(this.manoDeObraId);

      const priceCeltexFoam = this.extraOption.find(option => option.id === this.celtexFoamId)?.price ?? 0;
      const widthCeltexFoam = this.extraOptionVinForm.get('width')?.value ?? 0;
      const heightCeltexFoam = this.extraOptionVinForm.get('height')?.value ?? 0;
      this.quantityExtraOption = calculateCeltexFoamPriceAndSheets(heightCeltexFoam, widthCeltexFoam, priceCeltexFoam).sheetsUsed;

      this.setCartExtraOptionVin(this.laminadoId ?? 0);
      this.setCartExtraOptionVin(this.celtexFoamId ?? 0);
      console.log()
      if (this.myCartId !== 0) {
        this.myCartIDBService.saveMyCartDetailExtraOptions(this.myCartDetailExtraOption ?? [], this.myCart?.id ?? 0, this.productId);
      } else {
        console.error('No se puede guardar opciones extra: el carrito aún no tiene un id válido.');
      }
    }


  }

  setCartExtraOptionGiga(
    id: number,
    quantity: number = 1,
    giga_select: string | null = null
  ) {
    if (id === 1 || id === 2 || id === 4) { // Termosellado
      if (!this.myCartDetailExtraOption) {
        this.myCartDetailExtraOption = [];
      }
      this.myCartDetailExtraOption.push({
        extra_option_id: id,
        quantity: this.quantity,
        linear_meter: null,
        width: null,
        giga_select: giga_select,
      });
    }
    if (id === 3) { // Ojales      
      if (!this.myCartDetailExtraOption) {
        this.myCartDetailExtraOption = [];
      }

      this.myCartDetailExtraOption.push({
        extra_option_id: id,
        quantity: (quantity * this.quantity),
        linear_meter: null,
        width: null,
        giga_select: giga_select,
      });
    }
  }

  setCartExtraOptionVin(id: number) {
    const extraform = this.extraOptionVinForm.value;

    if (id >= 5 && id <= 8) { // Laminados
      if (!this.myCartDetailExtraOption) {
        this.myCartDetailExtraOption = [];
      }
      this.myCartDetailExtraOption?.push({
        extra_option_id: id,
        quantity: this.quantity ?? null,
        linear_meter: this.height ?? null,
        width: this.width ?? null,
        giga_select: null,
      });
    }

    if (id >= 10 && id <= 13) { // Foam Celtex
      if (!this.myCartDetailExtraOption) {
        this.myCartDetailExtraOption = [];
      }
      this.myCartDetailExtraOption.push({
        extra_option_id: id,
        quantity: (this.quantity * this.quantityExtraOption),
        linear_meter: this.height ?? null,
        width: extraform.width ?? null,
        giga_select: null,
      });
      this.myCartDetailExtraOption.push({
        extra_option_id: 14, // Mano de Obra
        quantity: (this.quantity * this.quantityExtraOption),
        linear_meter: this.height ?? null,
        width: extraform.width ?? null,
        giga_select: null,
      });
    }
  }

  updatePriceBase(customer: Customer | null = null) {
    const type_client = customer?.type_client.name.includes('Final')
      ? 'final'
      : 'imprentero';
    if (this.productId === 1) {
      this.priceBase = getPriceGigaForTypeClient(type_client, 1) * (1.18) * (1 + (customer?.type_client?.margin ?? 0));
    } else if (this.productId >= 2 && this.productId <= 9) {
      this.priceBase = getPriceVinylForTypeClient(this.productId, type_client, this.priceBaseVinil) * (1.18) * (1 + (customer?.type_client?.margin ?? 0));
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

  displayTroquelado() {
    const data = [
      { name: 'Troquelado 1cm diametro', price: 90 },
      { name: 'Troquelado 1.5cm diametro', price: 90 },
      { name: 'Troquelado 2cm diametro', price: 50 },
      { name: 'Troquelado 2.5cm diametro', price: 50 },
      { name: 'Troquelado 3cm diametro', price: 40 },
      { name: 'Troquelado 3.5cm diametro', price: 20 },
      { name: 'Troquelado mayor o igual 4cm diametro', price: 10 },
    ]
    this.dimensionTroqueladoForm.setValue({
      diameter: this.dimensionTroqueladoForm.get('diameter')?.value ?? null,
      quantity: this.dimensionTroqueladoForm.get('quantity')?.value ?? null,
    })
    console.log('Datos de Troquelado:', this.dimensionTroqueladoForm.value);



    const widthVinil = 1500 // mm
    const margitTop = 27.5 // mm
    const margitBottom = 27.5 // mm
    const margitLeft = 30 // mm
    const margitRight = 30 // mm
    const xPrint = 1440 // mm
    const yPrint = 945 // mm
    const cut = 5 // mm

    const diameter = (this.dimensionTroqueladoForm.get('diameter')?.value ?? null)! * 10;
    const quantity = this.dimensionTroqueladoForm.get('quantity')?.value ?? null;

    const quantityColumns = Math.floor((xPrint + cut) / (diameter! + 5))
    const quantityRows = Math.floor((yPrint + cut) / (diameter! + 5));
    const multiply = quantityColumns * quantityRows;

    let finalLinearMeter = 0;
    if (diameter == 10) {
      const precioLinearMeter = this.allProducts.find(product => product.id === this.productId)?.extra_options.find(option => option.name === 'Troquelado 1cm diametro')?.price || 0;
      const priceLineTroquelado = Math.round((precioLinearMeter / quantityRows) * 100) / 100;
      const quantityInputRows = Math.ceil(quantity! / quantityColumns);
      finalLinearMeter = quantityRows * diameter + cut * (quantityInputRows - 1) + margitTop + margitBottom;

      const priceFinalLineTroquelado = Math.round(priceLineTroquelado * quantityInputRows * 10) / 10;


      console.log('Final Linear Meter:', finalLinearMeter);
      console.log('quatityRows:', quantityRows);
      console.log('Cantidad de Troquelado:', quantityInputRows * quantityColumns);
      console.log('Precio :', priceFinalLineTroquelado)
      console.log('Vinil', getPriceVinylForTypeClient(this.productId, this.typeClient, this.priceBaseVinil) * (1.18) * (1 + (this.myCart?.customer?.type_client?.margin ?? 0)));
    }

    console.log('########################################')
    console.log('Cantidad X Troquelado:', quantityColumns);
    console.log('Cantidad Y Troquelado:', quantityRows);
    console.log('Cantidad Total Troquelado:', multiply);
  }
}

