import { RepositoryMembers } from "@/components/repositories/RepositoryMembers";

// The shared auth boundary waits for the client session before rendering this page.
export const instant = false;

export default function MembersPage() {
  return <RepositoryMembers />;
}
