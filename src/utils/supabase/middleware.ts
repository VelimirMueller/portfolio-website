import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Refreshes the Supabase session cookie on the way through middleware and
 * returns the signed-in user (or null). Never throws.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Missing config (e.g. CI without Supabase env) or an unreachable auth
  // server both count as signed out — the guard then redirects to login.
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );
    const { data } = await supabase.auth.getUser();
    return { response, user: data.user };
  } catch {
    return { response, user: null };
  }
}
