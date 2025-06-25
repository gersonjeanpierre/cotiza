import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ExtraOption } from '@core/models/extra-option';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ProductIndexedDBService } from '@features/quotations/services/products-idb';
import { CurrencyPipe } from '@angular/common';
import { calculateCeltexFoamPrice, calculateLaborPrice } from '@shared/utils/extraOptionList';

@Component({
  selector: 'app-extra-option-list',
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './extra-option-list.html',
  styleUrl: './extra-option-list.css'
})
export class ExtraOptionList implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private indexedDBService: ProductIndexedDBService,
    private cdr: ChangeDetectorRef,
  ) { }
  extraOption: ExtraOption[] = [];
  width: number = 0;
  height: number = 0;
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
      console.log('ID del producto:', id);
      if (id) {
        const allProducts = await this.indexedDBService.getProducts();
        const extraOptions = allProducts.find(product => product.id === id)?.extra_options ?? [];
        this.priceMetroLineal = allProducts.find(product => product.id === id)?.price ?? 0;
        this.nameProduct = allProducts.find(product => product.id === id)?.name ?? '';
        this.extraOption = extraOptions.sort((a, b) => a.id - b.id);
        console.log('Extra Options:', this.extraOption);
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
    this.extraOptionForm.get('height')?.setValue(this.height);
    console.log('Área calculada:', this.area);
    console.log('Ancho:', this.width, 'Alto:', this.height);
    console.log('Form', this.dimensionsForm?.value)
    // Aquí puedes manejar el envío del formulario
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
    let labor = calculateLaborPrice(heightCeltexFoam, widthCeltexFoam, manoDeObraPrice).toFixed(2);
    console.log('########### Precios Opciones Extra ###########');
    console.log('Precio Laminado:', laminadoPrice);
    console.log('Precio Celtex Foam Calculado:', cf);
    console.log('Precio Mano de Obra Calculado:', labor);


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
}
