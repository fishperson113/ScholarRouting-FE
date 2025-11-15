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
    profile: {
      path: 'profile',
      getHref: () => '/profile',
    },
    crm: {
      path: 'crm',
      getHref: () => '/crm',
    },
  },

  admin: {
    root: {
      path: 'admin',
      getHref: () => '/admin',
    },
    dashboard: {
      path: 'admin/dashboard',
      getHref: () => '/admin/dashboard',
    },
    conversations: {
      path: 'admin/conversations',
      getHref: () => '/admin/conversations',
    },
    conversationDetail: {
      path: 'admin/conversations/:id',
      getHref: (id: string) => `/admin/conversations/${id}`,
    },
  },
} as const;
