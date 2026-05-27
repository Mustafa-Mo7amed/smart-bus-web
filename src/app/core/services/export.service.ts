import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface ExcelColumnDef {
  header: string;       // What shows up in row 1 (e.g., "Hire Date")
  key: string;          // The key in your data object (e.g., "hireDate")
  type?: 'text' | 'number' | 'date' | 'currency'; // Optional formatting rules
}

export interface ExcelExportConfig {
  data: any[];
  columns: ExcelColumnDef[];
  fileName?: string;
  sheetName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExcelService {
  
  exportData(config: ExcelExportConfig): Observable<{ status: string, progress?: number }> {
    const exportSubject = new Subject<{ status: string, progress?: number }>();

    if (typeof Worker !== 'undefined') {
      const worker = new Worker(new URL('../workers/export.worker', import.meta.url), {
        type: 'module'
      });

      worker.onmessage = ({ data }) => {
        if (data.status === 'progress') {
          exportSubject.next({ status: 'progress', progress: data.percentage });
        } else if (data.status === 'done') {
          this.downloadBuffer(data.buffer, config.fileName || 'export.xlsx');
          exportSubject.next({ status: 'done', progress: 100 });
          exportSubject.complete();
          worker.terminate();
        } else if (data.status === 'error') {
          exportSubject.error(data.error);
          worker.terminate();
        }
      };

      worker.onerror = (err) => {
        exportSubject.error('Worker failed to execute.');
        worker.terminate();
      };

      // Kick off the worker
      worker.postMessage(config);
    } else {
      exportSubject.error('Web Workers are not supported in this environment.');
    }

    return exportSubject.asObservable();
  }

  private downloadBuffer(buffer: ArrayBuffer, fileName: string) {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }
}