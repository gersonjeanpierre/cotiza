import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '@core/models/product';
import { ProductService } from '@features/product/service/product';
import { ProductIndexedDBService } from '../../services/products-idb';
import { ProductTypeService } from '@features/product-types/services/product-type'

@Component({
  selector: 'app-product-list',
  imports: [CurrencyPipe],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductList implements OnInit {
  products: Product[] = [];
  productTypeId: number | null = null;
  isLoading: boolean = true;
  error: string | null = null;

  allProducts: Product[] = []; // Para almacenar todos los productos si es necesario

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private productTypeService: ProductTypeService,
    private cdr: ChangeDetectorRef,
    private indexedDBService: ProductIndexedDBService
  ) { }

  // async ngOnInit(): Promise<void> {
  //   this.route.paramMap.subscribe(async params => {
  //     const id = params.get('productTypeId');
  //     if (id) {
  //       this.productTypeId = +id;
  //       this.loadProducts(this.productTypeId);
  //     } else {
  //       this.error = 'Tipo de producto no especificado.';
  //       this.isLoading = false;
  //       this.cdr.detectChanges();
  //     }
  //   });
  // }

  async ngOnInit(): Promise<void> {
    this.route.paramMap.subscribe(async params => {
      const id = params.get('productTypeId');
      const urlName = params.get('productTypeName');
      if (id && urlName) {
        // Valida el nombre real del tipo de producto
        this.productTypeService.getProductTypeById(+id).subscribe({
          next: (productType) => {
            const realName = productType.name
              .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
              .toLowerCase()
              .replace(/\s+/g, '-');
            if (urlName === realName) {
              this.productTypeId = +id;
              this.loadProducts(this.productTypeId);
            } else {
              this.error = 'No existe el tipo de producto solicitado.';
              this.isLoading = false;
              this.cdr.detectChanges();
            }
          },
          error: () => {
            this.error = 'No existe el tipo de producto solicitado.';
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        });
      } else if (id) {
        this.productTypeId = +id;
        this.loadProducts(this.productTypeId);
      } else {
        this.error = 'Tipo de producto no especificado.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }


  async syncIfNeeded() {
    const lastSync = await this.indexedDBService.getLastSync();
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const lastSyncDay = lastSync?.slice(0, 10);

    if (lastSyncDay !== today) {
      // Sincroniza con la API y guarda en indexedDB
      this.productService.getAllProducts().subscribe({
        next: async (data) => {
          await this.indexedDBService.saveProducts(data);
        }
      });
    }
  }

  async loadProducts(productTypeId: number) {

    this.isLoading = true;
    this.error = null;
    this.products = [];
    this.allProducts = [];
    const cached = await this.indexedDBService.getProducts();
    this.allProducts = cached.filter(product =>
      Array.isArray(product.product_types) &&
      product.product_types.some(pt => pt.id === productTypeId)
    );
    this.isLoading = false;
    this.cdr.detectChanges();
  }
  // loadProducts(productTypeId: number): void {
  //   this.isLoading = true;
  //   this.error = null;
  //   this.products = [];
  //   this.allProducts = [];

  //   this.productService.getAllProducts().subscribe({
  //     next: (data) => {
  //       // Filtra productos donde alguno de sus product_types tiene el id igual a productTypeId
  //       this.allProducts = data.filter(product =>
  //         Array.isArray(product.product_types) &&
  //         product.product_types.some(pt => pt.id === productTypeId)
  //       );
  //       this.isLoading = false;
  //       this.cdr.detectChanges();
  //       console.log('Productos filtrados:', this.allProducts);
  //     },
  //     error: (err) => {
  //       console.error('Error al cargar todos los productos:', err);
  //       this.error = 'No se pudieron cargar todos los productos. Por favor, inténtelo de nuevo más tarde.';
  //       this.isLoading = false;
  //       this.cdr.detectChanges();
  //     }
  //   });

  // }

  onSelectProduct(product: Product): void {
    console.log('Producto seleccionado:', product.name, 'SKU:', product.sku);
    // Navegar al siguiente paso, pasando el ID del producto
    this.router.navigate(['/cotizaciones/products', product.id]);
  }
}