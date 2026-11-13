type Id = number | string;

/** Toàn bộ đường dẫn của ứng dụng. Không viết cứng đường dẫn ở nơi khác. */
export const ROUTES = {
  home: "/",
  login: "/login",
  repositories: "/repositories",
  settings: "/settings",
  board: (repoId: Id) => `/repositories/${repoId}/board`,
  issues: (repoId: Id) => `/repositories/${repoId}/issues`,
  issueCreate: (repoId: Id) => `/repositories/${repoId}/issues/new`,
  issueDetail: (repoId: Id, issueId: string) => `/repositories/${repoId}/issues/${issueId}`,
  dashboard: (repoId: Id) => `/repositories/${repoId}/dashboard`,
} as const;
