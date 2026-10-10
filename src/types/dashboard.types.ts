export interface MemberWorkload {
  login: string;
  avatarUrl: string;
  todo: number;
  inProgress: number;
  done: number;
}

export interface DailyClosedCount {
  /** Định dạng yyyy-MM-dd. */
  date: string;
  count: number;
}

export interface DashboardStats {
  /** Thứ Hai đầu tuần và Chủ nhật cuối tuần, định dạng yyyy-MM-dd. */
  weekStart: string;
  weekEnd: string;
  totalIssues: number;
  todo: number;
  inProgress: number;
  done: number;
  closedThisWeek: number;
  members: MemberWorkload[];
  dailyClosed: DailyClosedCount[];
}
