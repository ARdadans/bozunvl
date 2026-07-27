"use client";

import { useEffect, useId, useMemo, useState } from "react";

type RelativeTimeProps = {
  date: string | number | Date;
  refreshIntervalMs?: number;
  className?: string;
};

function toDate(date: string | number | Date) {
  return date instanceof Date ? date : new Date(date);
}

function formatRelative(now: number, then: number) {
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const absDiffSec = Math.abs(diffSec);

  if (absDiffSec < 10) return "just now";
  if (absDiffSec < 60) return `${absDiffSec}s ago`;
  const diffMin = Math.floor(absDiffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}d ago`;

  const current = new Date(now);
  const target = new Date(then);

  const sameYear =
    current.getFullYear() === target.getFullYear();

  if (sameYear) {
    return new Intl.DateTimeFormat("en", {
      day: "numeric",
      month: "short",
    }).format(target);
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  }).format(target);
}

export function RelativeTime({
  date,
  refreshIntervalMs,
  className,
}: RelativeTimeProps) {
  const generatedId = useId();
  const dateValue = useMemo(() => toDate(date).getTime(), [date]);

  const formatter = useMemo(() => {
    return (time: number) => formatRelative(time, dateValue);
  }, [dateValue]);

  const [now, setNow] = useState(() => dateValue);

  useEffect(() => {
    const updateTime = () => setNow(Date.now());
    const timeoutId = setTimeout(updateTime, 0);

    if (!refreshIntervalMs || refreshIntervalMs <= 0) {
      return () => clearTimeout(timeoutId);
    }
    const intervalId = setInterval(updateTime, refreshIntervalMs);
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [refreshIntervalMs]);

  return (
    <time
      id={generatedId}
      dateTime={new Date(dateValue).toISOString()}
      className={className}
      suppressHydrationWarning
    >
      {formatter(now)}
    </time>
  );
}
