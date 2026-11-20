import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Refreshes the Supabase session cookie and keeps signed-out visitors out of /admin and /account. */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const { pathname } = request.nextUrl;
  const isLogin = pathname.startsWith("/account/login");
  if (!url || !key) {
    if (pathname.startsWith("/admin")) return NextResponse.redirect(new URL("/account/login?next=/admin", request.url));
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isLogin && (pathname.startsWith("/admin") || pathname.startsWith("/account"))) {
    const login = new URL("/account/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }
  return response;
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*", "/auth/:path*"],
};
