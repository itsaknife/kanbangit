"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui";
import type { MemberWorkload } from "@/types";

/** Biểu đồ khối lượng công việc của từng thành viên, chia theo trạng thái. */
export function MemberWorkloadChart({ data }: { data: MemberWorkload[] }) {
  return (
    <Card className="flex flex-col gap-3 p-5">
      <h3 className="font-semibold">Tiến độ theo thành viên</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="login" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="todo" name="Cần làm" stackId="work" fill="#a1a1aa" />
          <Bar dataKey="inProgress" name="Đang làm" stackId="work" fill="#f59e0b" />
          <Bar dataKey="done" name="Hoàn thành" stackId="work" fill="#16a34a" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
