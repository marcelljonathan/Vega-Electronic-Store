import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// The admin site is served on its own address: admin.localhost while
// developing, or any host whose first part ends in "-admin" (e.g.
// vega-admin.vercel.app) once deployed.
function isAdminHost(host: string) {
  const hostname = host.split(":")[0];
  return hostname.startsWith("admin.") || /^[^.]+-admin\./.test(hostname);
}

// Runs before each page request:
// 1. picks the site — admin addresses show the pages in app/admin, and the
//    store address can't reach /admin at all;
// 2. keeps the Supabase sign-in fresh, renewing an expiring session.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminHost = isAdminHost(request.headers.get("host") ?? "");

  let target: URL | null = null;
  if (adminHost) {
    target = request.nextUrl.clone();
    target.pathname = `/admin${pathname === "/" ? "" : pathname}`;
  } else if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    target = request.nextUrl.clone();
    target.pathname = "/_not-found-admin"; // no such page → the 404 page
  }

  const makeResponse = () =>
    target
      ? NextResponse.rewrite(target, { request })
      : NextResponse.next({ request });

  let response = makeResponse();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = makeResponse();
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Checks the session with Supabase, renewing it if needed.
  await supabase.auth.getClaims();

  return response;
}

export const config = {
  // Skip static files and images — only pages need the session check.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
