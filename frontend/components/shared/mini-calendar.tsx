"use client";

import { useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "cn";

export interface CalendarMark {
  date: string; // yyyy-MM-dd
  className: string;
}

interface MiniCalendarProps {
  marks?: CalendarMark[];
  selectedDate?: string;
  onSelectDate?: (dateStr: string) => void;
  legend?: { label: string; className: string }[];
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MiniCalendar({ marks = [], selectedDate, onSelectDate, legend }: MiniCalendarProps) {
  const [month, setMonth] = useState(() => new Date());

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month)),
    end: endOfWeek(endOfMonth(month)),
  });

  const marksByDate = new Map(marks.map((m) => [m.date, m.className]));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">{format(month, "MMMM yyyy")}</p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMonth((m) => subMonths(m, 1))}
            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setMonth((m) => addMonths(m, 1))}
            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
            aria-label="Next month"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center text-[10px] text-muted-foreground">
        {WEEKDAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const inMonth = isSameMonth(day, month);
          const selected = selectedDate === dateStr;
          const today = isSameDay(day, new Date()) && isToday(day);
          const markClass = marksByDate.get(dateStr);
          return (
            <button
              key={dateStr}
              type="button"
              disabled={!onSelectDate}
              onClick={() => onSelectDate?.(dateStr)}
              className={cn(
                "relative mx-auto flex h-6 w-6 items-center justify-center rounded-full text-[11px] transition-colors",
                !inMonth && "text-muted-foreground/40",
                inMonth && !selected && "text-foreground hover:bg-muted",
                selected && "bg-secondary font-semibold text-white",
                today && !selected && "font-semibold text-secondary"
              )}
            >
              {format(day, "d")}
              {markClass && !selected && (
                <span className={cn("absolute bottom-0.5 h-1 w-1 rounded-full", markClass)} />
              )}
            </button>
          );
        })}
      </div>

      {legend && legend.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
          {legend.map((l) => (
            <span key={l.label} className="flex items-center gap-1">
              <span className={cn("h-1.5 w-1.5 rounded-full", l.className)} />
              {l.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
