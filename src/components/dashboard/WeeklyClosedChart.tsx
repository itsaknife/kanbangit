"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui";
import type { DailyClosedCount } from "@/types";
import { formatShortDate } from "@/utils";

/** Biểu đồ số issue đóng theo từng ngày trong tuần. */
export function WeeklyClosedChart({ data }: { data: DailyClosedCount[] }) {
  return (
    <Card className="flex flex-col gap-3 p-5">
      <h3 className="font-semibold">Issue hoàn thành theo ngày</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tickFormatter={formatShortDate} />
          <YAxis allowDecimals={false} />
          <Tooltip labelFormatter={(label) => formatShortDate(String(label))} />
          <Bar dataKey="count" name="Issue đã đóng" fill="#2563eb" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
