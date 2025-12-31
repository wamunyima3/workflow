"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

interface TimeAgoProps {
  date: string | Date;
  className?: string;
  prefix?: string;
}

export function TimeAgo({ date, className = "", prefix = "" }: TimeAgoProps) {
  const [timeAgo, setTimeAgo] = useState("");

  useEffect(() => {
    const updateTime = () => {
      try {
        const dateObj = typeof date === "string" ? new Date(date) : date;
        const distance = formatDistanceToNow(dateObj, { addSuffix: true });
        setTimeAgo(`${prefix}${distance}`);
      } catch {
        setTimeAgo("recently");
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [date, prefix]);

  return <span className={className}>{timeAgo}</span>;
}
