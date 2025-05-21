import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './db';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { completeUserOnboarding } from './userOnboarding';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Instead of using bcrypt directly, call the API endpoint
        // This keeps bcrypt on the server side only
        try {
          const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            })
          });

          const data = await response.json();
          
          if (!response.ok || !data.success) {
            return null;
          }
          
          return data.user;
        } catch (error) {
          console.error('Error verifying credentials:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role || 'USER';
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string | null;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  // Ensure use of secure cookies in production
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? `__Secure-next-auth.session-token` 
        : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    }
  },
  // Use JWT secret in production for edge compatibility
  secret: process.env.NEXTAUTH_SECRET,
  // Custom pages for login, etc.
  pages: {
    signIn: '/login',
    newUser: '/dashboard',
  },
  // Events handlers
  events: {
    async signIn({ user }) {
      if (user?.id) {
        try {
          // Add starter credits if user doesn't have any
          await completeUserOnboarding(user.id);
        } catch (error) {
          console.error('Error during sign-in event:', error);
        }
      }
    }
  },
  // Debug mode in development
  debug: process.env.NODE_ENV === 'development',
}; 