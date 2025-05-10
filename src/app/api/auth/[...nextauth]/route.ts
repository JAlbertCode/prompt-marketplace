import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";
import { completeUserOnboarding } from "@/lib/userOnboarding";

// Define types for our session
interface ExtendedJWT extends JWT {
  credits?: number;
}

// Set runtime for nextauth handlers
export const runtime = 'nodejs';

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
        // If this is a new sign-in, ensure the user has credits
        if (token.sub) {
          try {
            // Call onboarding to add default credits (1 million) if needed
            await completeUserOnboarding(token.sub);
            
            // Update the token to reflect new default credits
            token.credits = 1_000_000;
          } catch (error) {
            console.error('Error during user onboarding:', error);
          }
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
  events: {
    // Run onboarding when a user signs in
    async signIn({ user }) {
      if (user?.id) {
        try {
          await completeUserOnboarding(user.id);
        } catch (error) {
          console.error('Error during sign-in onboarding:', error);
        }
      }
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };