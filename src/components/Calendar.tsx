"use client";
import { useMemo, useState } from "react";

type Props = { initial?: Date };

export default function Calendar({ initial }: Props) {
  const start = initial ?? new Date();
  const [year, setYear] = useState<number>(start.getFullYear());
  const [month, setMonth] = useState<number>(start.getMonth()); // 0-11

  const { weeks, title } = useMemo(() => buildMatrix(year, month), [year, month]);

  const prevMonth = () => {
    const d = new Date(year, month - 1, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };
  const nextMonth = () => {
    const d = new Date(year, month + 1, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };

  return (
    <div className="calendar card p-3">
      <div className="flex items-center justify-between mb-2">
        <button className="btn btn-outline px-2 py-1" onClick={prevMonth} aria-label="Previous month">◀</button>
        <div className="text-sm font-medium">{title}</div>
        <button className="btn btn-outline px-2 py-1" onClick={nextMonth} aria-label="Next month">▶</button>
      </div>
      <div className="grid grid-cols-7 text-xs text-[var(--subtle)] mb-1">
        {['Pon','Uto','Sri','Čet','Pet','Sub','Ned'].map((d)=> (
          <div key={d} className="py-1 text-center">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-[2px]">
        {weeks.map((w, wi)=> (
          w.map((cell, ci)=> {
            const isWeekend = cell.weekday === 5 || cell.weekday === 6; // 5=Sat,6=Sun in our Monday-based index
            const inMonth = cell.inMonth;
            const cls = `rounded-md text-center py-2 ${inMonth ? 'text-[var(--foreground)]' : 'text-[var(--subtle)]/60'} ${isWeekend ? 'weekend' : ''}`;
            return <div key={`${wi}-${ci}`} className={cls}>{cell.day}</div>;
          })
        ))}
      </div>
    </div>
  );
}

function buildMatrix(y: number, m: number) {
  // Monday-based calendar
  const first = new Date(y, m, 1);
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const firstWeekdayMon = (first.getDay() + 6) % 7; // 0..6 (Mon..Sun)
  const cells: { day: number; inMonth: boolean; weekday: number }[] = [];

  // previous month tail
  const prevDays = firstWeekdayMon;
  const prevMonthDays = new Date(y, m, 0).getDate();
  for (let i = prevDays; i > 0; i--) {
    const weekday = (prevDays - i) % 7;
    cells.push({ day: prevMonthDays - i + 1, inMonth: false, weekday });
  }
  // current month
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(y, m, d);
    const weekday = (date.getDay() + 6) % 7; // 0..6
    cells.push({ day: d, inMonth: true, weekday });
  }
  // next month head to fill 42 cells (6 weeks)
  while (cells.length % 7 !== 0) {
    const idx = cells.length % 7;
    cells.push({ day: cells.length, inMonth: false, weekday: idx });
  }
  while (cells.length < 42) {
    const idx = cells.length % 7;
    const last = cells.filter(c => c.inMonth).length;
    cells.push({ day: (cells.length - (prevDays + daysInMonth) + 1), inMonth: false, weekday: idx });
  }
  const weeks: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const title = new Date(y, m, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' });
  return { weeks, title };
}

