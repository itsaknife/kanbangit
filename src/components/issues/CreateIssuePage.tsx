"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRepoId } from "@/hooks";
import { useIssuesStore } from "@/stores/issues.store";
import { ROUTES } from "@/constants";
import { CreateIssueModal } from "./CreateIssueModal";
import { IssueList } from "./IssueList";

/** Keep direct/new and child-issue links on the same modal creation workflow. */
export function CreateIssuePage() {
  const repoId = useRepoId();
  const router = useRouter();
  const search = useSearchParams();
  const parentId = search.get("parentId") ?? undefined;
  const createIssue = useIssuesStore((s) => s.createIssue);
  const close = () =>
    router.replace(parentId ? ROUTES.issueDetail(repoId, parentId) : ROUTES.issues(repoId));
  return (
    <>
      <IssueList />
      <CreateIssueModal
        key={parentId}
        open
        parentId={parentId}
        onClose={close}
        onCreate={(payload) => createIssue(repoId, payload)}
      />
    </>
  );
}
