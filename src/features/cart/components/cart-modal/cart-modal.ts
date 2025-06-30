import { Component, ElementRef, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-cart-modal',
  imports: [],
  templateUrl: './cart-modal.html',
  styleUrl: './cart-modal.css'
})
export class CartModal implements OnInit {

  @ViewChild('cartDialog') dialog!: ElementRef<HTMLDialogElement>;

  constructor() { }

  ngOnInit(): void {

  }

  openModal(): void {
    this.dialog.nativeElement.showModal();
  }
}
