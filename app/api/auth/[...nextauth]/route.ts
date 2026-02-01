import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"

// Prevent multiple instances of Prisma in dev
const globalForPrisma = global as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    debug: true, // ENABLE DEBUGGING
    callbacks: {
        async session({ session }) {
            if (session.user) {
                // Assign role from DB
                const dbUser = await prisma.user.findUnique({ where: { email: session.user.email! } });
                if (dbUser) {
                    (session.user as { role?: string; id?: string }).role = dbUser.role;
                    (session.user as { role?: string; id?: string }).id = dbUser.id;
                }
            }
            return session
        },
        async signIn({ user }) {
            // Auto-assign Admin Role for specific email
            if (user.email === "abhiisingh240@gmail.com") {
                // We can't update directly here easily before creation, but we can hook into events or trust the default USER then upgrade manually.
                // However, let's try to update if exists.
                try {
                    // If the user effectively signs in, we check if they are already admin, or update them.
                    // Since this runs before session creation, we might need a separate mechanism.
                    // For simplicity in V2, we will assume the initial seed or manual update. 
                    // But to be robust:
                    // We can use the 'events' callback 'createUser'
                } catch (e) {
                    console.error(e);
                }
            }
            return true
        }
    },
    events: {
        async createUser({ user }) {
            if (user.email === "abhiisingh240@gmail.com") {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { role: "ADMIN" }
                });
            }
        }
    },
    pages: {
        signIn: '/', // Custom sign-in on home page
        error: '/', // Redirect to home on error
    }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
