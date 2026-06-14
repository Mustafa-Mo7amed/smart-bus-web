import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ReportService } from '../../core/services/report.service';
import { ReportDetails } from '../../shared/models/report.model';

@Component({
  selector: 'app-report-details',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './report-details.component.html',
  styleUrl: './report-details.component.scss',
})
export class ReportDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly reportService = inject(ReportService);

  reportId = '';
  report = signal<ReportDetails | null>(null);
  isLoading = signal(false);
  isReviewing = signal(false);
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('reportId');
      if (id) {
        this.reportId = id;
        this.loadReportDetails();
      } else {
        this.errorMessage.set('Invalid Report ID');
      }
    });
  }

  loadReportDetails() {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.reportService.getReportDetails(this.reportId).subscribe({
      next: (details) => {
        this.report.set(details);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load report details', err);
        this.errorMessage.set('Report not found or failed to load.');
        this.isLoading.set(false);
      },
    });
  }

  reviewReport() {
    if (!this.report()) return;
    this.isReviewing.set(true);
    this.reportService.reviewReport(this.reportId).subscribe({
      next: (response) => {
        const current = this.report();
        if (current) {
          this.report.set({
            ...current,
            status: 'Reviewed',
            resolvedAt: new Date().toISOString(),
          });
        }
        this.isReviewing.set(false);
      },
      error: (err) => {
        console.error('Failed to review report', err);
        this.isReviewing.set(false);
      },
    });
  }

  goBack() {
    this.router.navigate(['/reports']);
  }
}
