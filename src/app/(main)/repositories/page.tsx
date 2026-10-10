import { RepositoryList } from "@/components/repositories";

export default function RepositoriesPage() {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Repository của bạn</h1>
        <p className="text-sm text-zinc-500">
          Kết nối repository để quản lý issue trên bảng Kanban.
        </p>
      </div>
      <RepositoryList />
    </section>
  );
}
