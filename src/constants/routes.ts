type Id = number | string;

/** Toàn bộ đường dẫn của ứng dụng. Không viết cứng đường dẫn ở nơi khác. */
export const ROUTES = {
  home: "/",
  login: "/login",
  repositories: "/projects",
  settings: "/settings",
  board: (repoId: Id) => `/projects/${repoId}/board`,
  issues: (repoId: Id) => `/projects/${repoId}/issues`,
  issueCreate: (repoId: Id) => `/projects/${repoId}/issues/new`,
  issueDetail: (repoId: Id, issueId: string) => `/projects/${repoId}/issues/${issueId}`,
  dashboard: (repoId: Id) => `/projects/${repoId}/dashboard`,
} as const;
