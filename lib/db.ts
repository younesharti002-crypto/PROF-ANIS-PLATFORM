import { neon } from '@neondatabase/serverless';

function resolveDatabaseUrl() {
  const isV2Preview = process.env.VERCEL_GIT_COMMIT_REF === 'prof-anis-v2';

  if (isV2Preview) {
    const v2Url = process.env.PROF_ANIS_V2_DATABASE_URL;
    if (!v2Url) {
      throw new Error('PROF_ANIS_V2_DATABASE_URL is not configured for prof-anis-v2');
    }
    return v2Url;
  }

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not configured');
  return url;
}

export function db() {
  return neon(resolveDatabaseUrl());
}
