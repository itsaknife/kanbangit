import { RepositoryList } from "@/components/repositories";

export const instant = false;

export default function RepositoriesPage() {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Project của bạn</h1>
        <p className="text-sm text-zinc-500">
          Quản lý công việc trong KanbanGit hoặc kết nối repository GitHub.
        </p>
      </div>
      <RepositoryList />
    </section>
  );
}
