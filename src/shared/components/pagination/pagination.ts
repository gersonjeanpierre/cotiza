import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para @for

@Component({
  selector: 'app-pagination',
  standalone: true, // Importante: marcamos como standalone
  imports: [CommonModule],
  templateUrl: './pagination.html',
  styleUrls: ['./pagination.css']
})
export class Pagination {
  @Input() currentPage!: number;
  @Input() totalPages!: number;

  @Output() goToPage = new EventEmitter<number>();
  @Output() previousPage = new EventEmitter<void>();
  @Output() nextPage = new EventEmitter<void>();

  public math = Math; // Para usar Math en la plantilla

  onGoToPage(page: number): void {
    this.goToPage.emit(page);
  }

  onPreviousPage(): void {
    this.previousPage.emit();
  }

  onNextPage(): void {
    this.nextPage.emit();
  }
}