import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CartIndexedDBService } from '@features/quotations/services/cart-idb';

@Component({
  selector: 'app-order',
  imports: [],
  templateUrl: './order.html',
  styleUrl: './order.css'
})
export class Order {

  // cart: 

  constructor(
    private cartIDBService: CartIndexedDBService,
    private router: Router
  ) {

    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state;

    const displayCart = state?.['displayCart'];
    console.log('Display Cart:', displayCart);

  }

  ngOnInit() {
  }
}
