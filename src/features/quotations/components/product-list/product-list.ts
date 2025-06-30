import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '@core/models/product';
import { ProductService } from '@features/product/service/product';
import { ProductIndexedDBService } from '../../services/products-idb';
import { ProductTypeService } from '@features/product-types/service/product-type'
import { ProductTypeIndexedDBService } from '@features/quotations/services/product-type-idb';

@Component({
  selector: 'app-product-list',
  imports: [],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductList implements OnInit {
  products: Product[] = [];
  productTypeId: number | null = null;
  isLoading: boolean = true;
  error: string | null = null;

  allProducts: Product[] = [];
  productsChino: Product[] = [];
  productsArclad: Product[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private productTypeIDBService: ProductTypeIndexedDBService,
    private productIndexedDBService: ProductIndexedDBService
  ) { }

  async ngOnInit(): Promise<void> {
    this.route.paramMap.subscribe(async params => {
      const id = params.get('productTypeId');
      const urlName = params.get('productTypeName');
      if (id && urlName) {
        const productType = await this.productTypeIDBService.getById(+id);
        if (productType) {
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
        } else {
          this.error = 'No existe el tipo de producto solicitado.';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
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

  async loadProducts(productTypeId: number) {

    this.isLoading = true;
    this.error = null;
    this.allProducts = [];
    const cached = await this.productIndexedDBService.getAll();
    this.allProducts = cached.filter(product =>
      Array.isArray(product.product_types) &&
      product.product_types.some(pt => pt.id === productTypeId)
    );
    this.isLoading = false;
    this.productsChino = this.filteredProductsChino();
    this.productsArclad = this.filteredProductsArclad();
    console.log('Path de la ruta:', this.router.url);
    this.cdr.detectChanges();

  }

  filteredProductsChino() {
    return this.allProducts.filter(product =>
      product.name?.toLowerCase().includes('chino'))
  }
  filteredProductsArclad(): Product[] {
    return this.allProducts.filter(product =>
      product.name?.toLowerCase().includes('arclad'))
  }

  onSelectProduct(product: Product): void {
    const currentPath = this.router.url;
    const newPath = `${currentPath}/${product.id}`;
    console.log('Navegando a:', newPath);
    this.router.navigate([newPath]);
  }
}