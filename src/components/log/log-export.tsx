
"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "../ui/button";
import { Icons } from "../icons";
import { SerializableLogEntry } from "@/lib/types";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";

type LogExportProps = {
  logs: SerializableLogEntry[];
};

export function LogExport({ logs }: LogExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>();

  const handleExport = () => {
    setIsExporting(true);

    const filteredLogs = logs.filter(log => {
        if (!date) return true;
        const logDate = new Date(log.timestamp);
        const from = date.from ? new Date(date.from.setHours(0,0,0,0)) : null;
        const to = date.to ? new Date(date.to.setHours(23,59,59,999)) : null;
        if(from && !to) return logDate >= from;
        if(!from && to) return logDate <= to;
        if(from && to) return logDate >= from && logDate <= to;
        return true;
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
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
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
