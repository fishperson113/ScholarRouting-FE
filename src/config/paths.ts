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
    scholarshipDetail: {
      path: 'scholarships/:id',
      getHref: (id: string) => `/scholarships/${id}`,
    },
    applications: {
      path: 'applications',
      getHref: () => '/applications',
    },
    deadlines: {
      path: 'deadlines',
      getHref: () => '/deadlines',
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
