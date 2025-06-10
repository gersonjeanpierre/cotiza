import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductSelectionService } from '../product-selection-service';

@Component({
  selector: 'app-extra-option',
  imports: [],
  templateUrl: './extra-option.html'
})
export class ExtraOption implements OnInit  {
  selectedProduct:any;
  private route = inject(ActivatedRoute)
  private router = inject(Router);
  
  
  constructor(
    private selection: ProductSelectionService
  ) {
    this.selectedProduct = this.selection.getSelectedProducts()[0];
  }

  ngOnInit(): void {
    console.log('product', this.selectedProduct);
  }
 
  
  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

}
