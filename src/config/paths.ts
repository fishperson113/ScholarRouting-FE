export const paths = {
  home: {
    path: '/',
    getHref: () => '/',
  },

  auth: {
    register: {
      path: '/auth/register',
      getHref: (redirectTo?: string | null | undefined) =>
        `/auth/register${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
    },
    login: {
      path: '/auth/login',
      getHref: (redirectTo?: string | null | undefined) =>
        `/auth/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
    },
  },

  app: {
    root: {
      path: '/',
      getHref: () => '/',
    },
    scholarships: {
      path: 'scholarships',
      getHref: () => '/scholarships',
    },
    applications: {
      path: 'applications',
      getHref: () => '/applications',
    },
    deadlines: {
      path: 'deadlines',
      getHref: () => '/deadlines',
    },
    discussions: {
      path: 'discussions',
      getHref: () => '/discussions',
    },
    discussion: {
      path: 'discussions/:discussionId',
      getHref: (id: string) => `/discussions/${id}`,
    },
    users: {
      path: 'users',
      getHref: () => '/users',
    },
    profile: {
      path: 'profile',
      getHref: () => '/profile',
    },
  },
} as const;
