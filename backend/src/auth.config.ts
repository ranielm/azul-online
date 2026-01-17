import Google from '@auth/express/providers/google';
import GitHub from '@auth/express/providers/github';
import { db } from './persistence/database';

// Minimal implementation of an Auth.js adapter for LibSQL
// Since Auth.js adapters are complex, we will focus on the core methods
// required for basic OAuth login.
function LibSQLAdapter() {
    return {
        async createUser(user: any) {
            if (!db) throw new Error("Database not initialized");
            const id = crypto.randomUUID();
            await db.execute({
                sql: `INSERT INTO users (id, name, email, emailVerified, image) VALUES (?, ?, ?, ?, ?) RETURNING *`,
                args: [id, user.name, user.email, user.emailVerified, user.image]
            });
            return { ...user, id };
        },
        async getUser(id: string) {
            if (!db) return null;
            const rs = await db.execute({ sql: `SELECT * FROM users WHERE id = ?`, args: [id] });
            return rs.rows[0] as any || null;
        },
        async getUserByEmail(email: string) {
            if (!db) return null;
            const rs = await db.execute({ sql: `SELECT * FROM users WHERE email = ?`, args: [email] });
            return rs.rows[0] as any || null;
        },
        async updateUser(user: any) {
            if (!db) throw new Error("Database not initialized");
            await db.execute({
                sql: `UPDATE users SET name = ?, email = ?, emailVerified = ?, image = ? WHERE id = ?`,
                args: [user.name, user.email, user.emailVerified, user.image, user.id]
            });
            return user;
        },
        async getUserByAccount({ provider, providerAccountId }: any) {
            if (!db) return null;
            const rs = await db.execute({
                sql: `SELECT u.* FROM users u JOIN accounts a ON u.id = a.userId WHERE a.provider = ? AND a.providerAccountId = ?`,
                args: [provider, providerAccountId]
            });
            return rs.rows[0] as any || null;
        },
        async linkAccount(account: any) {
            if (!db) throw new Error("Database not initialized");
            await db.execute({
                sql: `INSERT INTO accounts (id, userId, type, provider, providerAccountId, refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [
                    crypto.randomUUID(), account.userId, account.type, account.provider, account.providerAccountId,
                    account.refresh_token, account.access_token, account.expires_at, account.token_type, account.scope, account.id_token, account.session_state
                ]
            });
            return account;
        },
        async createSession({ sessionToken, userId, expires }: any) {
            if (!db) throw new Error("Database not initialized");
            await db.execute({
                sql: `INSERT INTO sessions (id, sessionToken, userId, expires) VALUES (?, ?, ?, ?)`,
                args: [crypto.randomUUID(), sessionToken, userId, expires.toISOString()]
            });
            return { sessionToken, userId, expires };
        },
        async getSessionAndUser(sessionToken: string) {
            if (!db) return null;
            const sessionRs = await db.execute({ sql: `SELECT * FROM sessions WHERE sessionToken = ?`, args: [sessionToken] });
            if (!sessionRs.rows[0]) return null;
            const session = sessionRs.rows[0] as any;
            session.expires = new Date(session.expires); // Convert back to Date

            const userRs = await db.execute({ sql: `SELECT * FROM users WHERE id = ?`, args: [session.userId] });
            if (!userRs.rows[0]) return null;
            const user = userRs.rows[0] as any;

            return { session, user };
        },
        async updateSession({ sessionToken }: any) {
            // No-op for now unless needed
            return null;
        },
        async deleteSession(sessionToken: string) {
            if (!db) return;
            await db.execute({ sql: `DELETE FROM sessions WHERE sessionToken = ?`, args: [sessionToken] });
        }
    };
}

export const authConfig = {
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
        GitHub({
            clientId: process.env.AUTH_GITHUB_ID,
            clientSecret: process.env.AUTH_GITHUB_SECRET,
        }),
    ],
    adapter: LibSQLAdapter(),
    secret: process.env.AUTH_SECRET,
    trustHost: true,
    basePath: '/api/auth',
};
