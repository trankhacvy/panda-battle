import { type NextRequest, NextResponse } from "next/server";

const PUBLIC_PAGES = [
  "/", // Home page (Login)
  "/refresh", // Token refresh page
];

export async function middleware(req: NextRequest) {
  const cookieAuthToken = req.cookies.get("privy-token");
  const cookieSession = req.cookies.get("privy-session");
  const { pathname, searchParams } = req.nextUrl;

  const response = NextResponse.next();

  // console.log("cookieAuthToken", cookieAuthToken);
  // console.log("cookieSession", cookieSession);

  //   // Check for a `ref` query parameter in the URL and set the cookie
  //   const referralCode = searchParams.get("ref");
  //   if (referralCode) {
  //     response.cookies.set("referralCode", referralCode, {
  //       httpOnly: false,
  //       sameSite: "strict",
  //       path: "/",
  //       maxAge: 60 * 60 * 24 * 7, // 7 days
  //     });
  //   }

  // Skip middleware for public pages
  if (PUBLIC_PAGES.includes(pathname)) {
    return response;
  }

  // Skip middleware for Privy OAuth authentication flow
  if (
    req.nextUrl.searchParams.has("privy_oauth_code") ||
    req.nextUrl.searchParams.has("privy_oauth_state") ||
    req.nextUrl.searchParams.has("privy_oauth_provider")
  ) {
    return response;
  }

  // User authentication status check
  const definitelyAuthenticated = Boolean(cookieAuthToken); // User is definitely authenticated (has access token)
  const maybeAuthenticated = Boolean(cookieSession); // User might be authenticated (has session)

  // Handle token refresh cases
  if (!definitelyAuthenticated && maybeAuthenticated) {
    const redirectUrl = new URL("/refresh", req.url);
    // Ensure redirect_uri is the current page path
    redirectUrl.searchParams.set("redirect_uri", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Handle unauthenticated cases
  if (!definitelyAuthenticated && !maybeAuthenticated) {
    const loginUrl = new URL("/", req.url);
    // Ensure redirect_uri is the current page path
    loginUrl.searchParams.set("redirect_uri", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static, _next/image (Next.js internal files)
     * - favicons, fonts, images, pwa (static asset folders)
     * - favicon.ico, manifest.webmanifest, sitemap.xml, sw.js, robots.txt (metadata files)
     * - File extensions: svg, png, jpg, jpeg, gif, webp, woff2, ttf, ico
     */
    "/((?!api|_next/static|_next/image|favicons|fonts|images|pwa|favicon.ico|sitemap.xml|sw.js|manifest.webmanifest|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2|ttf|ico)).*)",
  ],
};
