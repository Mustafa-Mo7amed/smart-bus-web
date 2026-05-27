/// <reference lib="webworker" />
import * as XLSX from 'xlsx';

addEventListener('message', ({ data }) => {
  try {
    const config = data as any; // Cast to your interface if you import it
    const records = config.data;
    const columns = config.columns;
    const sheetName = config.sheetName || 'Data Export';

    const totalRows = records.length;
    const progressStep = Math.max(1, Math.floor(totalRows / 10));

    // 1. Extract Headers dynamically
    const headers = columns.map((c: any) => c.header);
    postMessage({ status: 'progress', percentage: 10 });

    // 2. Map data dynamically using the 'key' from your config
    const rows = records.map((record: any, idx: number) => {
      if (totalRows > 1000 && idx % progressStep === 0) {
        postMessage({ status: 'progress', percentage: Math.round((idx / totalRows) * 30) + 10 });
      }
      return columns.map((col: any) => record[col.key]);
    });
    postMessage({ status: 'progress', percentage: 40 });

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    postMessage({ status: 'progress', percentage: 50 });

    // 3. Apply dynamic formatting based on column type
    for (let r = 0; r < totalRows; r++) {
      if (totalRows > 1000 && r % progressStep === 0) {
        postMessage({ status: 'progress', percentage: Math.round((r / totalRows) * 30) + 50 });
      }

      columns.forEach((col: any, cIdx: number) => {
        // Convert column index (0, 1, 2) to Excel column letter (A, B, C)
        const cellRef = XLSX.utils.encode_cell({ c: cIdx, r: r + 1 }); 
        const cell = ws[cellRef];

        if (cell && cell.v != null) {
          if (col.type === 'currency') {
            cell.t = 'n';
            cell.z = '"$"#,##0';
          } else if (col.type === 'date') {
            cell.t = 'd';
            cell.v = new Date(cell.v);
            cell.z = 'yyyy-mm-dd';
          } else if (col.type === 'number') {
             cell.t = 'n';
             cell.z = '0';
          }
        }
      });
    }
    postMessage({ status: 'progress', percentage: 80 });

    // 4. Auto-fit columns
    const colWidths = headers.map((header: string, colIdx: number) => {
      let maxLen = header.length;
      for (let r = 0; r < totalRows; r++) {
        const val = rows[r][colIdx];
        const cellStr = val !== undefined && val !== null ? String(val) : '';
        if (cellStr.length > maxLen) maxLen = cellStr.length;
      }
      return { wch: Math.max(maxLen + 2, 10) };
    });
    ws['!cols'] = colWidths;
    postMessage({ status: 'progress', percentage: 90 });

    // 5. Generate file
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    const wbout = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    
    postMessage({ status: 'done', buffer: wbout }, [wbout]);

  } catch (error: any) {
    postMessage({ status: 'error', error: error?.message });
  }
});