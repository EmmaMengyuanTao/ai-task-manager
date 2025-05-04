import React, { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";

const DatePicker = ({ date, onDateChange, className = "", buttonClassName, dateFormat = "yyyy/MM/dd" }) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (selectedDate) => {
    onDateChange(selectedDate);
    setOpen(false);
  };

  return (
    <div className={cn("", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="default"
            className={cn(
              "h-10 px-4 w-full flex items-center gap-2 border border-gray-300 bg-white rounded-lg shadow-sm transition-all",
              !date
                ? "text-gray-400"
                : "text-blue-600 font-semibold border-blue-400 bg-blue-50"
            )}
            type="button"
          >
            <CalendarIcon className="h-5 w-5 opacity-80 mr-1" />
            {date ? (
              <span>Deadline: {format(date, dateFormat)}</span>
            ) : (
              <span>No due date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-[9999]" align="end" sideOffset={10}>
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            initialFocus
            className="rounded-md border"
            classNames={{
              nav: "flex items-center gap-2",
              nav_button: "mx-1 size-7 bg-transparent p-0 opacity-50 hover:opacity-100 border border-gray-200 rounded-md"
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DatePicker;