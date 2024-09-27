// middleware.ts

import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Custom logic can be added here if needed
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow unauthenticated access to specific paths
        if (
          pathname.startsWith("/login") ||
          pathname.startsWith("/register") ||
          pathname.startsWith("/faqs") ||
          pathname.startsWith("/pricing") ||
          pathname.startsWith("/verify") ||
          pathname.startsWith("/api/auth")
        ) {
          return true;
        }

        // Protect admin routes
        if (pathname.startsWith("/admin")) {
          return token?.role === "ADMIN";
        }

        // Protect dashboard and other authenticated routes
        return !!token;
      },
    },
  }
);

// Specify the paths to apply the middleware
export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
