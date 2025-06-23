import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-quotation-home',
  imports: [],
  templateUrl: './quotation-home.html',
  styleUrl: './quotation-home.css'
})
export class QuotationHome {
  title = 'Quotation Home';
  constructor(
    private router: Router
  ) { }
  navigateToQuotation() {
    this.router.navigate(['/dashboard/cotizaciones/tiposdeproductos']);
  }
}
