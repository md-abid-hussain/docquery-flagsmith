import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  /**
   * Extend the built-in session types
   */
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      githubUsername?: string;
    };
  }
}

declare module "next-auth/jwt" {
  /**
   * Extend the built-in JWT types
   */
  interface JWT {
    id: string;
    githubUsername?: string;
  }
}
