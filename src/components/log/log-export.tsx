
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
import { useUser } from "@/context/user-context";
import { useTranslation } from "@/context/language-context";

type LogExportProps = {
  logs: SerializableLogEntry[];
};

export function LogExport({ logs }: LogExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [date, setDate] = useState<Date | undefined>();
  const { user } = useUser();
  const { t } = useTranslation();

  const handleExport = () => {
    setIsExporting(true);

    const dataForRole = user?.role === 'manager'
        ? logs
        : logs.filter(log => log.userId === user?.id);

    const filteredLogs = dataForRole.filter(log => {
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

    const dataToExport = filteredLogs.flatMap(log => 
        log.items.map(item => ({
          Timestamp: format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
          Type: log.type,
          Details: log.details,
          "User": log.userName,
          "Product Name": item.productName,
          "Quantity Change": item.quantityChange,
          "Price per item": item.price,
          "Total Value": item.quantityChange * item.price,
        }))
    );

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Activity Log");

    worksheet["!cols"] = [
      { wch: 20 }, // Timestamp
      { wch: 15 }, // Type
      { wch: 50 }, // Details
      { wch: 20 }, // User
      { wch: 30 }, // Product Name
      { wch: 15 }, // Quantity Change
      { wch: 15 }, // Price
      { wch: 15 }, // Total
    ];

    const fileName = date 
      ? `StockFlow_Log_${format(date, "yyyy-MM-dd")}.xlsx`
      : "StockFlow_ActivityLog_All.xlsx";

    XLSX.writeFile(workbook, fileName);

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
                "w-full sm:w-[260px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>{t('log.pick_date')}</span>}
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
        {t('log.export_excel')}
      </Button>
    </div>
  );
}
