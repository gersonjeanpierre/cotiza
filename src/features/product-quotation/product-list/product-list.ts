import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductSelectionService } from '../product-selection-service';

@Component({
  selector: 'app-product-list',
  imports: [],
  templateUrl: './product-list.html',
})
export class ProductList {
   products = [
    {
      id: '01',
      name: 'Gigantografía',
      url: 'gigantografia',
      unit: 'Metro Cuadrado',
      image: '/images/gigantografia.webp'
    },
    {
      id: '02',
      name: 'Vinil',
      url: 'vinil',
      unit: 'Metro Lineal',
      image: '/images/vinil-blanco.webp'
    }
  ];

  private route = inject(ActivatedRoute)
  private router = inject(Router);
  constructor(private selection: ProductSelectionService) {}

  selectProduct(product: any) {
    this.selection.selectProduct(product);
    this.router.navigate([product.url],{relativeTo: this.route});
  }
}
