type Id = number | string;

/** Toàn bộ đường dẫn của ứng dụng. Không viết cứng đường dẫn ở nơi khác. */
export const ROUTES = {
  home: "/",
  login: "/login",
  repositories: "/repositories",
  board: (repoId: Id) => `/repositories/${repoId}/board`,
  issues: (repoId: Id) => `/repositories/${repoId}/issues`,
  issueDetail: (repoId: Id, issueNumber: Id) => `/repositories/${repoId}/issues/${issueNumber}`,
  dashboard: (repoId: Id) => `/repositories/${repoId}/dashboard`,
} as const;
