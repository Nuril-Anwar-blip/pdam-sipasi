import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const role = token.role as string;

    // Role Guards
    const routeAccess: Record<string, string[]> = {
      "/dashboard/admin": ["ADMIN"],
      "/dashboard/agendaris": ["AGENDARIS", "ADMIN"],
      "/dashboard/direktur": ["DIREKTUR", "ADMIN"],
      "/dashboard/staff": ["STAFF", "ADMIN"],
    };

    for (const [route, allowedRoles] of Object.entries(routeAccess)) {
      if (pathname.startsWith(route) && !allowedRoles.includes(role)) {
        //Redirect ke dashboard yang sesuai
        const dashboardMap:
          Record<string, string> = {
          STAFF: "/dashboard/staff",
          AGENDARIS: "/dashboard/agendaris",
          DIREKTUR: "/dashboard/direktur",
          ADMIN: "/dashboard/admin",
        };
        return NextResponse.redirect(
          new URL(dashboardMap[role] ?? "/login", req.url)
        );
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/user/:path*",
    "/api/audit-logs/:path*",
    "/api/stats/:path*",
  ],
};