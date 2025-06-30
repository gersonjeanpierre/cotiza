import { Component, ViewChild } from '@angular/core';
import { CartModal } from "@features/cart/components/cart-modal/cart-modal";

@Component({
  selector: 'app-header',
  imports: [CartModal],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class Header {
  @ViewChild('cartModalRef') customerModalComponent!: CartModal;

  ngAfterViewInit(): void {
    // Es una buena práctica verificar que la referencia ya esté disponible
    console.log('Referencia al modal de clientes:', this.customerModalComponent);
  }

  openCartModal(): void {
    // Llama al método `openModal()` del componente hijo para mostrar el modal
    if (this.customerModalComponent) {
      this.customerModalComponent.openModal();
    }
  }

}
