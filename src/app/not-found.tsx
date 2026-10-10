import Link from "next/link";
import { buttonClassName } from "@/components/ui";
import { ROUTES } from "@/constants";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-xl font-semibold">Không tìm thấy trang</h1>
      <Link href={ROUTES.repositories} className={buttonClassName()}>
        Về danh sách repository
      </Link>
    </main>
  );
}
