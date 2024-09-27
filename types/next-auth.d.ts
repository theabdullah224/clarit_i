// types/next-auth.d.ts

import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { Role } from "../prisma/schema"; // Adjust the import path based on your project structure

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's role */
      role: Role;
      /** The user's id */
      id: string;
    } & DefaultSession["user"];
  }

  /**
   * Custom user object returned by the adapter
   */
  interface User extends DefaultUser {
    role: Role;
    id: string; // Ensure that 'id' is included
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    id: string;
  }
}
