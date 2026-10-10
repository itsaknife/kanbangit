"use client";

import { Button } from "@/components/ui";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-xl font-semibold">Đã có lỗi xảy ra</h1>
      <p className="text-sm text-zinc-500">Vui lòng thử lại, hoặc quay lại sau ít phút.</p>
      <Button onClick={reset}>Thử lại</Button>
    </main>
  );
}
