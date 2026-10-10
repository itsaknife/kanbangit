import Link from "next/link";
import { Badge, Button, buttonClassName, Card } from "@/components/ui";
import { ROUTES } from "@/constants";
import type { Repository } from "@/types";

interface RepositoryCardProps {
  repository: Repository;
  connecting: boolean;
  onConnect: (repoId: number) => void;
}

export function RepositoryCard({ repository, connecting, onConnect }: RepositoryCardProps) {
  return (
    <Card className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-semibold">{repository.fullName}</h3>
          {repository.isPrivate && <Badge>Riêng tư</Badge>}
        </div>
        {repository.description && (
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{repository.description}</p>
        )}
        <p className="mt-2 text-xs text-zinc-500">{repository.openIssuesCount} issue đang mở</p>
      </div>

      {repository.isConnected ? (
        <Link href={ROUTES.board(repository.id)} className={buttonClassName({ size: "sm" })}>
          Mở bảng
        </Link>
      ) : (
        <Button
          size="sm"
          variant="secondary"
          loading={connecting}
          onClick={() => onConnect(repository.id)}
        >
          Kết nối
        </Button>
      )}
    </Card>
  );
}
