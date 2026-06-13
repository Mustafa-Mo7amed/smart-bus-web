import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ReportDetails, PaginatedReports, ReportListItem } from '../../shared/models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private dummyReports: ReportDetails[] = [
    {
      id: 'd707c0fb-1178-4243-ac12-6a544aa7ec8d',
      passengerName: 'مصطفى محمد',
      driverName: 'محمد',
      passangerId: '7c3e84b4-6b19-4c2a-d48b-08dec963df5f',
      driverId: 'ace2dec9-9b6a-496a-8135-b9f632a1d5cd',
      reasons: ['Bad Behavior', 'Reckless Driving', 'Other'],
      description: 'مش بحبه راجل وسخوس خوسخوسخوس خوسخو سخوس خوسخو  سخوسخ وسخوسخوسخوسخو  سخوسخو خوسخوسخوسخوسخوسخوسخوسخوسخوسخوس خوسخوسخوسخوسخ وسخوسخوسخوسخوسخ وسخوسخوسخوسخوسخوسخوسخوسخوسخوسخوسخوسخوسخوسخوسخوسخوسخوسخوسخوسخوسخوسخوسخوسخوسخوسخوسخوسخوسخوسخوسخوسخوسخ',
      plateNumber: 'ف ر ن 1561',
      createdAt: '2026-06-13T15:57:10.1335338+00:00',
      reviewedAt: null,
      status: 'Pending',
    },
    {
      id: 'a4300f23-ac16-4ddc-969a-de6be1ef92da',
      passengerName: 'أحمد علي',
      driverName: 'محمود عبد الله',
      passangerId: 'pass-002',
      driverId: 'drv-002',
      reasons: ['Bad Behavior'],
      description: 'السائق يتحدث في الهاتف أثناء القيادة وبسرعة جنونية',
      plateNumber: 'ف ر ن 1561',
      createdAt: '2026-06-13T01:08:36.0119231+00:00',
      reviewedAt: null,
      status: 'Pending',
    },
    {
      id: 'c111c0fb-2222-4243-ac12-6a544aa7ec8d',
      passengerName: 'عمر خالد',
      driverName: 'ابراهيم سعيد',
      passangerId: 'pass-003',
      driverId: 'drv-003',
      reasons: ['Late Arrival'],
      description: 'تأخر الأوتوبيس عن الموعد المحدد بأكثر من نصف ساعة دون إشعار',
      plateNumber: 'أ ب ج 1234',
      createdAt: '2026-06-12T10:30:00.0000000+00:00',
      reviewedAt: '2026-06-12T14:20:00.0000000+00:00',
      status: 'Reviewed',
    },
    {
      id: 'e333d0fb-3333-4243-ac12-6a544aa7ec8d',
      passengerName: 'يوسف حسن',
      driverName: 'خالد مرسي',
      passangerId: 'pass-004',
      driverId: 'drv-004',
      reasons: ['Reckless Driving'],
      description: 'قيادة متهورة وتجاوز الإشارة الحمراء مما عرض الركاب للخطر',
      plateNumber: 'س ص ع 5678',
      createdAt: '2026-06-11T18:45:00.0000000+00:00',
      reviewedAt: null,
      status: 'Pending',
    },
    {
      id: 'f444e0fb-4444-4243-ac12-6a544aa7ec8d',
      passengerName: 'منى السيد',
      driverName: 'محمد عبد الرحمن',
      passangerId: 'pass-005',
      driverId: 'drv-005',
      reasons: ['Bad Behavior', 'Other'],
      description: 'المعاملة سيئة جداً من السائق ورفض تشغيل مكيف الهواء',
      plateNumber: 'ق ر ل 9012',
      createdAt: '2026-06-10T08:15:00.0000000+00:00',
      reviewedAt: '2026-06-10T12:00:00.0000000+00:00',
      status: 'Reviewed',
    },
    {
      id: 'a555f0fb-5555-4243-ac12-6a544aa7ec8d',
      passengerName: 'سارة محمد',
      driverName: 'أحمد حسن',
      passangerId: 'pass-006',
      driverId: 'drv-006',
      reasons: ['Other'],
      description: 'المقاعد متسخة جداً وغير صالحة للاستخدام',
      plateNumber: 'ط ي ر 3456',
      createdAt: '2026-06-09T14:25:00.0000000+00:00',
      reviewedAt: null,
      status: 'Pending',
    },
    {
      id: 'b666a0fb-6666-4243-ac12-6a544aa7ec8d',
      passengerName: 'خالد عبد الرحمن',
      driverName: 'تامر حسني',
      passangerId: 'pass-007',
      driverId: 'drv-007',
      reasons: ['Bad Behavior'],
      description: 'تدخين السائق داخل المركبة رغم اعتراض الركاب',
      plateNumber: 'م ن و 7890',
      createdAt: '2026-06-08T11:00:00.0000000+00:00',
      reviewedAt: '2026-06-08T15:30:00.0000000+00:00',
      status: 'Reviewed',
    },
    {
      id: 'c777b0fb-7777-4243-ac12-6a544aa7ec8d',
      passengerName: 'فاطمة الزهراء',
      driverName: 'هاني سلامة',
      passangerId: 'pass-008',
      driverId: 'drv-008',
      reasons: ['Reckless Driving'],
      description: 'القيادة بسرعة زائدة في المنحنيات الخطرة',
      plateNumber: 'ف ر ن 1561',
      createdAt: '2026-06-07T09:40:00.0000000+00:00',
      reviewedAt: null,
      status: 'Pending',
    },
    {
      id: 'd888c0fb-8888-4243-ac12-6a544aa7ec8d',
      passengerName: 'طارق سليم',
      driverName: 'سيد علي',
      passangerId: 'pass-009',
      driverId: 'drv-009',
      reasons: ['Other'],
      description: 'الباب الخلفي للأوتوبيس لا يغلق بشكل جيد أثناء السير',
      plateNumber: 'هـ و ي 1111',
      createdAt: '2026-06-06T16:20:00.0000000+00:00',
      reviewedAt: '2026-06-07T10:00:00.0000000+00:00',
      status: 'Reviewed',
    },
    {
      id: 'e999d0fb-9999-4243-ac12-6a544aa7ec8d',
      passengerName: 'مصطفى كامل',
      driverName: 'جمال عبد الناصر',
      passangerId: 'pass-010',
      driverId: 'drv-010',
      reasons: ['Bad Behavior', 'Reckless Driving'],
      description: 'شجار لفظي مع ركاب آخرين وقيادة عدوانية',
      plateNumber: 'ب ت ث 2222',
      createdAt: '2026-06-05T13:10:00.0000000+00:00',
      reviewedAt: null,
      status: 'Pending',
    },
    {
      id: 'f000e0fb-0000-4243-ac12-6a544aa7ec8d',
      passengerName: 'رنا يوسف',
      driverName: 'سليمان عيد',
      passangerId: 'pass-011',
      driverId: 'drv-011',
      reasons: ['Late Arrival'],
      description: 'عدم الالتزام بمسار الرحلة وتغيير الاتجاه بدون سبب',
      plateNumber: 'ج ح خ 3333',
      createdAt: '2026-06-04T07:50:00.0000000+00:00',
      reviewedAt: '2026-06-04T18:00:00.0000000+00:00',
      status: 'Reviewed',
    },
    {
      id: 'a111a0fb-1111-4243-ac12-6a544aa7ec8d',
      passengerName: 'كريم عبد العزيز',
      driverName: 'أحمد السقا',
      passangerId: 'pass-012',
      driverId: 'drv-012',
      reasons: ['Bad Behavior'],
      description: 'تشغيل أغاني بصوت مرتفع جداً والامتناع عن خفض الصوت',
      plateNumber: 'د ذ ر 4444',
      createdAt: '2026-06-03T21:30:00.0000000+00:00',
      reviewedAt: null,
      status: 'Pending',
    },
  ];

  getReports(filters: {
    plateNumber?: string;
    fromDate?: string;
    toDate?: string;
    pageNumber: number;
    pageSize: number;
    status?: string; // 'All' | 'Pending' | 'Reviewed'
    order?: 'ASC' | 'DESC';
    orderBy?: 'createdAt' | 'reviewedAt';
  }): Observable<PaginatedReports> {
    let filtered = [...this.dummyReports];

    // Filter by plateNumber
    if (filters.plateNumber) {
      const q = filters.plateNumber.trim().toLowerCase();
      filtered = filtered.filter((r) => r.plateNumber.toLowerCase().includes(q));
    }

    // Filter by status
    if (filters.status && filters.status !== 'All') {
      filtered = filtered.filter(
        (r) => r.status.toLowerCase() === filters.status!.toLowerCase(),
      );
    }

    // Filter by fromDate
    if (filters.fromDate) {
      const from = new Date(filters.fromDate);
      filtered = filtered.filter((r) => new Date(r.createdAt) >= from);
    }

    // Filter by toDate
    if (filters.toDate) {
      const to = new Date(filters.toDate);
      to.setHours(23, 59, 59, 999);
      filtered = filtered.filter((r) => new Date(r.createdAt) <= to);
    }

    // Sorting
    const orderBy = filters.orderBy || 'createdAt';
    const order = filters.order || 'DESC';
    filtered.sort((a, b) => {
      const valA = a[orderBy];
      const valB = b[orderBy];

      if (!valA) return order === 'DESC' ? 1 : -1;
      if (!valB) return order === 'DESC' ? -1 : 1;

      const dateA = new Date(valA).getTime();
      const dateB = new Date(valB).getTime();

      return order === 'DESC' ? dateB - dateA : dateA - dateB;
    });

    const totalCount = filtered.length;
    const page = filters.pageNumber || 1;
    const size = filters.pageSize || 10;
    const startIndex = (page - 1) * size;
    const paginated = filtered.slice(startIndex, startIndex + size);

    const items: ReportListItem[] = paginated.map((r) => ({
      id: r.id,
      plateNumber: r.plateNumber,
      createdAt: r.createdAt,
      reviewedAt: r.reviewedAt,
      status: r.status,
    }));

    return of({
      items,
      totalCount,
      pageNumber: page,
      pageSize: size,
    }).pipe(delay(400));
  }

  getReportDetails(id: string): Observable<ReportDetails> {
    const report = this.dummyReports.find((r) => r.id === id);
    if (report) {
      return of({ ...report }).pipe(delay(200));
    }
    return throwError(() => new Error('Report not found'));
  }

  reviewReport(id: string): Observable<ReportDetails> {
    const reportIndex = this.dummyReports.findIndex((r) => r.id === id);
    if (reportIndex !== -1) {
      const report = this.dummyReports[reportIndex];
      report.status = 'Reviewed';
      report.reviewedAt = new Date().toISOString();
      this.dummyReports[reportIndex] = { ...report };
      return of({ ...report }).pipe(delay(300));
    }
    return throwError(() => new Error('Report not found'));
  }
}
