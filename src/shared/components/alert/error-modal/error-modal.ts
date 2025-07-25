import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-error-modal',
  imports: [],
  templateUrl: './error-modal.html',
  styleUrl: './error-modal.css'
})
export class ErrorModal {
  @Input() open = false;
  @Input() message = '';
  @Output() close = new EventEmitter<void>();
}
