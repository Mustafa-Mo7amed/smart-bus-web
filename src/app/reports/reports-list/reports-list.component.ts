import { Component, inject, OnInit, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { ReportService } from '../../core/services/report.service';
import { ReportListItem } from '../../shared/models/report.model';
import { PaginatorComponent } from '../../shared/components/paginator/paginator.component';

@Component({
  selector: 'app-reports-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatMenuModule,
    PaginatorComponent,
  ],
  templateUrl: './reports-list.component.html',
  styleUrl: './reports-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsListComponent implements OnInit {
  private readonly reportService = inject(ReportService);
  private readonly router = inject(Router);

  reports = signal<ReportListItem[]>([]);
  totalCount = signal(0);
  isLoading = signal(false);

  // Filters (Converted to Signals)
  plateNumber = signal('');
  fromDate = signal('');
  toDate = signal('');
  status = signal<'Pending' | 'Reviewed' | null>(null);
  order = signal<'ASC' | 'DESC'>('DESC');
  orderBy = signal<'createdAt' | 'resolvedAt'>('createdAt');

  showFilters = signal(false);

  activeFiltersCount = computed(() => {
    let count = 0;
    if (this.plateNumber().trim()) count++;
    if (this.status() !== null) count++;
    if (this.fromDate()) count++;
    if (this.toDate()) count++;
    if (this.orderBy() !== 'createdAt') count++;
    if (this.order() !== 'DESC') count++;
    return count;
  });

  // Segmented Plate Signals
  public num1 = signal('');
  public num2 = signal('');
  public num3 = signal('');
  public num4 = signal('');
  public let1 = signal('');
  public let2 = signal('');
  public let3 = signal('');

  // Pagination (Converted to Signals)
  pageNumber = signal(1);
  pageSize = signal(5);

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

    this.plateNumber.set(letters ? `${letters} ${numbers}` : numbers);
    this.onFilterChange();
  }

  ngOnInit() {
    this.fetchReports();
  }

  fetchReports() {
    this.isLoading.set(true);
    this.reportService
      .getReports({
        plateNumber: this.plateNumber() || undefined,
        fromDate: this.fromDate() || undefined,
        toDate: this.toDate() || undefined,
        status: this.status() || undefined,
        order: this.order(),
        orderBy: this.orderBy(),
        pageNumber: this.pageNumber(),
        pageSize: this.pageSize(),
      })
      .subscribe({
        next: (data) => {
          this.reports.set(data.items);
          this.totalCount.set(data.totalCount);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to load reports', err);
          this.isLoading.set(false);
        },
      });
  }

  onFilterChange() {
    this.pageNumber.set(1);
    this.fetchReports();
  }

  handlePageChange(event: { pageIndex: number; pageSize: number }) {
    this.pageNumber.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
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

  resetFilters() {
    this.num1.set('');
    this.num2.set('');
    this.num3.set('');
    this.num4.set('');
    this.let1.set('');
    this.let2.set('');
    this.let3.set('');
    this.plateNumber.set('');
    this.status.set(null);
    this.fromDate.set('');
    this.toDate.set('');
    this.orderBy.set('createdAt');
    this.order.set('DESC');
    this.onFilterChange();
  }
}
