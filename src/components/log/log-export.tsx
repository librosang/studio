"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "../ui/button";
import { Icons } from "../icons";
import { SerializableLogEntry } from "@/lib/types";
import { format } from "date-fns";

type LogExportProps = {
  logs: SerializableLogEntry[];
};

export function LogExport({ logs }: LogExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);

    // Prepare data for worksheet
    const dataToExport = logs.map(log => ({
      Timestamp: format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      Type: log.type,
      "Product Name": log.productName,
      Details: log.details,
      "Quantity Change": log.quantityChange,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Activity Log");

    // Set column widths
    worksheet["!cols"] = [
      { wch: 20 }, // Timestamp
      { wch: 10 }, // Type
      { wch: 30 }, // Product Name
      { wch: 50 }, // Details
      { wch: 15 }, // Quantity Change
    ];

    // Trigger download
    XLSX.writeFile(workbook, "StockFlow_ActivityLog.xlsx");

    setIsExporting(false);
  };

  return (
    <Button onClick={handleExport} disabled={isExporting || logs.length === 0}>
      {isExporting ? (
        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Icons.sale className="mr-2 h-4 w-4" />
      )}
      Export to Excel
    </Button>
  );
}
