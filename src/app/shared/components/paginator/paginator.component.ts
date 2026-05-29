import { Component, input, output, computed } from '@angular/core';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [],
  templateUrl: './paginator.component.html',
  styleUrl: './paginator.component.scss'
})
export class PaginatorComponent {
  totalCount = input.required<number>();
  pageIndex = input.required<number>();
  pageSize = input.required<number>();
  pageSizeOptions = input<number[]>([5, 10, 20, 50]);
  isLoading = input<boolean>(false);

  pageChange = output<{ pageIndex: number; pageSize: number }>();

  totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize()));
  
  showingStart = computed(() => {
    if (this.totalCount() === 0) return 0;
    return this.pageIndex() * this.pageSize() + 1;
  });

  showingEnd = computed(() => {
    return Math.min((this.pageIndex() + 1) * this.pageSize(), this.totalCount());
  });

  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.pageIndex() + 1;
    const maxVisible = 5;

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    let start = current - Math.floor(maxVisible / 2);
    let end = current + Math.floor(maxVisible / 2);

    if (start < 1) {
      start = 1;
      end = maxVisible;
    } else if (end > total) {
      end = total;
      start = total - maxVisible + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  onPageSizeChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const size = parseInt(select.value, 10);
    this.pageChange.emit({ pageIndex: 0, pageSize: size });
  }

  goToPage(index: number) {
    if (index >= 0 && index < this.totalPages()) {
      this.pageChange.emit({ pageIndex: index, pageSize: this.pageSize() });
    }
  }

  nextPage() {
    if (this.pageIndex() < this.totalPages() - 1) {
      this.pageChange.emit({ pageIndex: this.pageIndex() + 1, pageSize: this.pageSize() });
    }
  }

  prevPage() {
    if (this.pageIndex() > 0) {
      this.pageChange.emit({ pageIndex: this.pageIndex() - 1, pageSize: this.pageSize() });
    }
  }
}
