import Google from '@auth/express/providers/google';
import GitHub from '@auth/express/providers/github';
import { db } from './persistence/database';

// Minimal implementation of an Auth.js adapter for LibSQL
// With extensive error logging to debug Configuration errors
function LibSQLAdapter() {
    return {
        async createUser(user: any) {
            console.log("ADAPTER: createUser called", { email: user.email });
            try {
                if (!db) throw new Error("Database not initialized");
                const id = crypto.randomUUID();
                await db.execute({
                    sql: `INSERT INTO users (id, name, email, emailVerified, image) VALUES (?, ?, ?, ?, ?) RETURNING *`,
                    args: [
                        id,
                        user.name ?? null,
                        user.email ?? null,
                        user.emailVerified ?? null,
                        user.image ?? null
                    ]
                });
                console.log("ADAPTER: createUser SUCCESS", { id });
                return { ...user, id };
            } catch (error) {
                console.error("ADAPTER ERROR: createUser FAILED", error);
                throw error;
            }
        },
        async getUser(id: string) {
            console.log("ADAPTER: getUser called", { id });
            try {
                if (!db) return null;
                const rs = await db.execute({ sql: `SELECT * FROM users WHERE id = ?`, args: [id] });
                console.log("ADAPTER: getUser result", { found: !!rs.rows[0] });
                return rs.rows[0] as any || null;
            } catch (error) {
                console.error("ADAPTER ERROR: getUser FAILED", error);
                throw error;
            }
        },
        async getUserByEmail(email: string) {
            console.log("ADAPTER: getUserByEmail called", { email });
            try {
                if (!db) return null;
                const rs = await db.execute({ sql: `SELECT * FROM users WHERE email = ?`, args: [email] });
                console.log("ADAPTER: getUserByEmail result", { found: !!rs.rows[0] });
                return rs.rows[0] as any || null;
            } catch (error) {
                console.error("ADAPTER ERROR: getUserByEmail FAILED", error);
                throw error;
            }
        },
        async updateUser(user: any) {
            console.log("ADAPTER: updateUser called", { id: user.id });
            try {
                if (!db) throw new Error("Database not initialized");
                await db.execute({
                    sql: `UPDATE users SET name = ?, email = ?, emailVerified = ?, image = ? WHERE id = ?`,
                    args: [user.name, user.email, user.emailVerified, user.image, user.id]
                });
                console.log("ADAPTER: updateUser SUCCESS");
                return user;
            } catch (error) {
                console.error("ADAPTER ERROR: updateUser FAILED", error);
                throw error;
            }
        },
        async getUserByAccount({ provider, providerAccountId }: any) {
            console.log("ADAPTER: getUserByAccount called", { provider, providerAccountId });
            try {
                if (!db) return null;
                const rs = await db.execute({
                    sql: `SELECT u.* FROM users u JOIN accounts a ON u.id = a.userId WHERE a.provider = ? AND a.providerAccountId = ?`,
                    args: [provider, providerAccountId]
                });
                console.log("ADAPTER: getUserByAccount result", { found: !!rs.rows[0] });
                return rs.rows[0] as any || null;
            } catch (error) {
                console.error("ADAPTER ERROR: getUserByAccount FAILED", error);
                throw error;
            }
        },
        async linkAccount(account: any) {
            console.log("ADAPTER: linkAccount called", { provider: account.provider, userId: account.userId });
            try {
                if (!db) throw new Error("Database not initialized");
                await db.execute({
                    sql: `INSERT INTO accounts (id, userId, type, provider, providerAccountId, refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    args: [
                        crypto.randomUUID(),
                        account.userId,
                        account.type,
                        account.provider,
                        account.providerAccountId,
                        account.refresh_token ?? null,
                        account.access_token ?? null,
                        account.expires_at ?? null,
                        account.token_type ?? null,
                        account.scope ?? null,
                        account.id_token ?? null,
                        account.session_state ?? null
                    ]
                });
                console.log("ADAPTER: linkAccount SUCCESS");
                return account;
            } catch (error) {
                console.error("ADAPTER ERROR: linkAccount FAILED", error);
                throw error;
            }
        },
        async createSession({ sessionToken, userId, expires }: any) {
            console.log("ADAPTER: createSession called", { userId });
            try {
                if (!db) throw new Error("Database not initialized");
                await db.execute({
                    sql: `INSERT INTO sessions (id, sessionToken, userId, expires) VALUES (?, ?, ?, ?)`,
                    args: [crypto.randomUUID(), sessionToken, userId, expires.toISOString()]
                });
                console.log("ADAPTER: createSession SUCCESS");
                return { sessionToken, userId, expires };
            } catch (error) {
                console.error("ADAPTER ERROR: createSession FAILED", error);
                throw error;
            }
        },
        async getSessionAndUser(sessionToken: string) {
            console.log("ADAPTER: getSessionAndUser called");
            try {
                if (!db) return null;
                const sessionRs = await db.execute({ sql: `SELECT * FROM sessions WHERE sessionToken = ?`, args: [sessionToken] });
                if (!sessionRs.rows[0]) {
                    console.log("ADAPTER: getSessionAndUser - no session found");
                    return null;
                }
                const session = sessionRs.rows[0] as any;
                session.expires = new Date(session.expires);

                const userRs = await db.execute({ sql: `SELECT * FROM users WHERE id = ?`, args: [session.userId] });
                if (!userRs.rows[0]) {
                    console.log("ADAPTER: getSessionAndUser - no user found for session");
                    return null;
                }
                const user = userRs.rows[0] as any;
                console.log("ADAPTER: getSessionAndUser SUCCESS");
                return { session, user };
            } catch (error) {
                console.error("ADAPTER ERROR: getSessionAndUser FAILED", error);
                throw error;
            }
        },
        async updateSession({ sessionToken }: any) {
            console.log("ADAPTER: updateSession called (no-op)");
            return null;
        },
        async deleteSession(sessionToken: string) {
            console.log("ADAPTER: deleteSession called");
            try {
                if (!db) return;
                await db.execute({ sql: `DELETE FROM sessions WHERE sessionToken = ?`, args: [sessionToken] });
                console.log("ADAPTER: deleteSession SUCCESS");
            } catch (error) {
                console.error("ADAPTER ERROR: deleteSession FAILED", error);
                throw error;
            }
        }
    };
}

console.log("========================================");
console.log("DEBUG: Initializing Auth Config");
console.log("DEBUG: Env Check", {
    AUTH_SECRET: !!process.env.AUTH_SECRET,
    AUTH_SECRET_LENGTH: process.env.AUTH_SECRET?.length || 0,
    AUTH_GOOGLE_ID: !!process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: !!process.env.AUTH_GOOGLE_SECRET ? "Set (length: " + process.env.AUTH_GOOGLE_SECRET.length + ")" : "Missing",
    AUTH_GITHUB_ID: !!process.env.AUTH_GITHUB_ID,
    AUTH_GITHUB_SECRET: !!process.env.AUTH_GITHUB_SECRET ? "Set (length: " + process.env.AUTH_GITHUB_SECRET.length + ")" : "Missing",
    AUTH_URL: process.env.AUTH_URL || "NOT SET",
});
console.log("========================================");

export const authConfig = {
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            allowDangerousEmailAccountLinking: true,
        }),
        GitHub({
            clientId: process.env.AUTH_GITHUB_ID,
            clientSecret: process.env.AUTH_GITHUB_SECRET,
            allowDangerousEmailAccountLinking: true,
        }),
    ],
    adapter: LibSQLAdapter(),
    secret: process.env.AUTH_SECRET,
    trustHost: true,
    basePath: '/api/auth',
    debug: true,
    callbacks: {
        async redirect({ url, baseUrl }: any) {
            // ALWAYS redirect to the frontend after any auth action (signin/signout)
            const frontendUrl = process.env.CORS_ORIGIN?.split(',')[0] || 'http://localhost:5174';
            console.log("AUTH CALLBACK: REDIRECT", { url, baseUrl, redirectTo: frontendUrl });

            // Always return the frontend URL
            return frontendUrl;
        },
        async signIn({ user, account, profile }: any) {
            console.log("AUTH CALLBACK: SIGNIN ATTEMPT", {
                provider: account?.provider,
                email: user?.email,
                accountId: account?.providerAccountId,
                userExists: !!user?.id
            });
            return true;
        },
        async jwt({ token, user, account }: any) {
            if (account) {
                console.log("AUTH CALLBACK: JWT (New Signin)", {
                    provider: account.provider,
                    sub: token.sub
                });
            }
            return token;
        },
        async session({ session, token }: any) {
            console.log("AUTH CALLBACK: SESSION", {
                userId: session?.user?.id,
                sessionToken: !!token
            });
            // IMPORTANT: Copy user id from token to session
            if (token?.sub) {
                session.user = session.user || {};
                session.user.id = token.sub;
            }
            return session;
        },
    },
};
