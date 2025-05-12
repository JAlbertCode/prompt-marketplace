import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import { completeUserOnboarding } from "@/lib/userOnboarding";
import { authOptions } from "@/lib/auth";

// Set runtime for nextauth handlers
export const runtime = 'nodejs';

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };