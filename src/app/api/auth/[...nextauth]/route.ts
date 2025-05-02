import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";

// Define types for our session
interface ExtendedJWT extends JWT {
  credits?: number;
}

// For development, we'll use JWT-only mode without a database adapter
export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account, profile }) {
      // Initial sign in
      if (account && profile) {
        // Add initial credits for new users
        if (!token.credits) {
          token.credits = 1000; // Starting with 1000 credits ($1.00)
        }
      }
      
      return token as ExtendedJWT;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      
      // Add user's credit balance to the session
      if (session.user && typeof (token as ExtendedJWT).credits !== 'undefined') {
        session.user.credits = (token as ExtendedJWT).credits;
      }
      
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };