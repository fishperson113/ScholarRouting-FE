import { UseMutationOptions, DefaultOptions } from '@tanstack/react-query';

export const queryConfig = {
  queries: {
    // throwOnError: true,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes - scholarships don't change frequently
    gcTime: 1000 * 60 * 10, // 10 minutes cache (formerly cacheTime)
    // Network mode for better offline/slow network handling
    networkMode: 'online' as const,
  },
  mutations: {
    // Don't retry mutations by default
    retry: false,
  },
} satisfies DefaultOptions;

export type ApiFnReturnType<FnType extends (...args: any) => Promise<any>> =
  Awaited<ReturnType<FnType>>;

export type QueryConfig<T extends (...args: any[]) => any> = Omit<
  ReturnType<T>,
  'queryKey' | 'queryFn'
>;

export type MutationConfig<
  MutationFnType extends (...args: any) => Promise<any>,
> = UseMutationOptions<
  ApiFnReturnType<MutationFnType>,
  Error,
  Parameters<MutationFnType>[0]
>;
