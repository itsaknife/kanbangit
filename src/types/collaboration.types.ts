export interface CollaborationMember {
  id: string;
  login: string;
  name: string;
  avatarUrl: string | null;
}
export interface Worklog {
  id: string;
  issueId: string;
  memberId: string;
  member: CollaborationMember;
  issue: { id: string; issueCode: string; title: string };
  startAt: string;
  endAt: string;
  description: string | null;
  durationMinutes: number;
  selectedMinutes: number;
  createdAt: string;
  updatedAt: string;
  canEdit: boolean;
  canDelete: boolean;
}
export interface WorklogPayload {
  startAt: string;
  endAt: string;
  description?: string;
  memberId?: string;
}
export interface TimeQuery {
  issueId?: string;
  memberId?: string;
  period?: string;
  from?: string;
  to?: string;
}
export interface WorklogResult {
  data: Worklog[];
  canView: boolean;
  canManage: boolean;
  currentMemberId: string;
  totalMinutes: number;
  daily: { date: string; durationMinutes: number }[];
  range: { from: string | null; to: string | null; timezone: string };
}
export interface TimeSummary {
  directMinutes: number | null;
  combinedMinutes: number | null;
  estimateMinutes: number | null;
  combinedEstimateMinutes: number;
  directOverEstimate: boolean;
  combinedOverEstimate: boolean;
  directVisible: boolean;
  treeVisible: boolean;
}
export interface Attachment {
  id: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
}
export interface Comment {
  id: string;
  issueId: string;
  authorId: string;
  author: CollaborationMember;
  content: string;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
  canEdit: boolean;
  canDelete: boolean;
}
export interface MentionNotification {
  id: string;
  repositoryId: string;
  issueId: string;
  commentId: string;
  readAt: string | null;
  createdAt: string;
  issue: { id: string; issueCode: string; title: string } | null;
}
