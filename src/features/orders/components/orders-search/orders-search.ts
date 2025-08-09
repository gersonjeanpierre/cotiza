import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-orders-search',
  standalone: true, // Importante: marcamos como standalone
  imports: [ReactiveFormsModule],
  templateUrl: './orders-search.html',
  styleUrls: ['./orders-search.css']
})
export class OrdersSearch {
  @Input() searchForm!: FormGroup;

  @Output() clearSearch = new EventEmitter<void>();
  @Output() downloadReportCsv = new EventEmitter<void>();

  onClearSearch(): void {
    this.clearSearch.emit();
  }

  onDownloadReportCsv(): void {
    this.downloadReportCsv.emit();
  }
}