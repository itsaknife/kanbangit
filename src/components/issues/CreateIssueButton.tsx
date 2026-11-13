"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui";

export function CreateIssueButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      className="h-10 w-10 rounded-xl p-0"
      title="Tạo issue mới"
      aria-label="Tạo issue mới"
    >
      <Plus className="h-8 w-8" strokeWidth={2.5} />
    </Button>
  );
}
