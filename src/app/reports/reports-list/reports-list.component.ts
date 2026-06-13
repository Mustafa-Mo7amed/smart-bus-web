import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { ReportService } from '../../core/services/report.service';
import { ReportListItem } from '../../shared/models/report.model';

@Component({
  selector: 'app-reports-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatMenuModule,
  ],
  templateUrl: './reports-list.component.html',
  styleUrl: './reports-list.component.scss',
})
export class ReportsListComponent implements OnInit {
  private readonly reportService = inject(ReportService);
  private readonly router = inject(Router);

  reports = signal<ReportListItem[]>([]);
  totalCount = signal(0);
  isLoading = signal(false);

  // Filters
  plateNumber = '';
  fromDate = '';
  toDate = '';
  status: 'All' | 'Pending' | 'Reviewed' = 'All';
  order: 'ASC' | 'DESC' = 'DESC';
  orderBy: 'createdAt' | 'reviewedAt' = 'createdAt';

  // Segmented Plate Signals
  public num1 = signal('');
  public num2 = signal('');
  public num3 = signal('');
  public num4 = signal('');
  public let1 = signal('');
  public let2 = signal('');
  public let3 = signal('');

  onInput(event: Event, field: 'num1'|'num2'|'num3'|'num4'|'let1'|'let2'|'let3', current: HTMLInputElement, next: HTMLInputElement | null) {
    const input = event.target as HTMLInputElement;
    let val = input.value;

    if (current.classList.contains('plate-input--digit')) {
      val = val.replace(/[^0-9]/g, '');
    } else {
      val = val.replace(/[^أاإبجدرسصطعفقلمنهويى]/g, '');
    }

    val = val.slice(0, 1);
    current.value = val;

    (this as any)[field].set(val);

    this.syncPlateValue();

    if (val && next) {
      next.focus();
      next.select();
    }
  }

  onKeydown(event: KeyboardEvent, current: HTMLInputElement, prev: HTMLInputElement | null, next: HTMLInputElement | null) {
    if (event.key === 'Backspace' && !current.value && prev) {
      prev.focus();
      prev.select();
      event.preventDefault();
    } else if (event.key === 'Tab') {
      if (event.shiftKey) {
        if (prev) {
          prev.focus();
          prev.select();
          event.preventDefault();
        }
      } else {
        if (next) {
          next.focus();
          next.select();
          event.preventDefault();
        }
      }
    }
  }

  syncPlateValue() {
    const numbers = [this.num1(), this.num2(), this.num3(), this.num4()].filter(Boolean).join('');
    const letters = [this.let1(), this.let2(), this.let3()].filter(Boolean).join(' ');

    this.plateNumber = letters ? `${letters} ${numbers}` : numbers;
    this.onFilterChange();
  }

  // Pagination
  pageNumber = 1;
  pageSize = 5; // 5 items per page by default to make pagination prominent

  totalPages = 0;

  ngOnInit() {
    this.fetchReports();
  }

  fetchReports() {
    this.isLoading.set(true);
    this.reportService
      .getReports({
        plateNumber: this.plateNumber || undefined,
        fromDate: this.fromDate || undefined,
        toDate: this.toDate || undefined,
        status: this.status,
        order: this.order,
        orderBy: this.orderBy,
        pageNumber: this.pageNumber,
        pageSize: this.pageSize,
      })
      .subscribe({
        next: (data) => {
          this.reports.set(data.items);
          this.totalCount.set(data.totalCount);
          this.totalPages = Math.ceil(data.totalCount / this.pageSize);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to load reports', err);
          this.isLoading.set(false);
        },
      });
  }

  onFilterChange() {
    this.pageNumber = 1;
    this.fetchReports();
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.pageNumber = page;
      this.fetchReports();
    }
  }

  onPageSizeChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.pageSize = Number(select.value);
    this.pageNumber = 1;
    this.fetchReports();
  }

  viewReport(id: string) {
    this.router.navigate(['reports', 'details', id]);
  }

  setAsReviewed(id: string) {
    this.reportService.reviewReport(id).subscribe({
      next: () => {
        this.fetchReports();
      },
      error: (err) => {
        console.error('Failed to review report', err);
      },
    });
  }

  getPagesArray(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  getStartIndex(): number {
    if (this.totalCount() === 0) return 0;
    return (this.pageNumber - 1) * this.pageSize + 1;
  }

  getEndIndex(): number {
    const end = this.pageNumber * this.pageSize;
    return end > this.totalCount() ? this.totalCount() : end;
  }
}
