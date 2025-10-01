
"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "../ui/button";
import { Icons } from "../icons";
import { SerializableLogEntry } from "@/lib/types";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";

type LogExportProps = {
  logs: SerializableLogEntry[];
};

export function LogExport({ logs }: LogExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [date, setDate] = useState<Date | undefined>();

  const handleExport = () => {
    setIsExporting(true);

    const filteredLogs = logs.filter(log => {
        if (!date) return true;
        const logDate = new Date(log.timestamp);
        const from = new Date(date.setHours(0,0,0,0));
        const to = new Date(date.setHours(23,59,59,999));
        return logDate >= from && logDate <= to;
    });

    if (filteredLogs.length === 0) {
        setIsExporting(false);
        // Maybe show a toast message here? For now, just stop.
        return;
    }

    const dataToExport = filteredLogs.map(log => ({
      Timestamp: format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      Type: log.type,
      "Product Name": log.productName,
      Details: log.details,
      "Quantity Change": log.quantityChange,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Activity Log");

    worksheet["!cols"] = [
      { wch: 20 },
      { wch: 10 },
      { wch: 30 },
      { wch: 50 },
      { wch: 15 },
    ];

    XLSX.writeFile(workbook, "StockFlow_ActivityLog.xlsx");

    setIsExporting(false);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 items-center">
       <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-[260px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="single"
              selected={date}
              onSelect={setDate}
            />
          </PopoverContent>
        </Popover>
      <Button onClick={handleExport} disabled={isExporting || logs.length === 0}>
        {isExporting ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.sale className="mr-2 h-4 w-4" />
        )}
        Export to Excel
      </Button>
    </div>
  );
}
