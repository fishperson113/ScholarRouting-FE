export const paths = {
  home: {
    path: '/',
    getHref: () => '/',
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
