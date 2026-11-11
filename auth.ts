import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { upsertGoogleUser, getUserById } from "@/lib/users";
import { logActivity } from "@/lib/activity";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  secret: process.env.AUTH_SECRET,
  pages: { signIn: "/login" },
  callbacks: {
    async signIn({ user, profile, account }) {
      const uid = (profile?.sub as string | undefined) ?? user?.id;
      if (!profile?.email || !uid) {
        console.error("[auth] signIn: missing email or uid", {
          hasEmail: !!profile?.email,
          hasUid: !!uid,
        });
        return false;
      }
      try {
        const upserted = await upsertGoogleUser({
          uid,
          name: user.name ?? profile.name ?? "Pengguna",
          email: profile.email,
          image:
            (profile as { picture?: string | null }).picture ?? user.image ?? null,
        });
        await logActivity(upserted.uid, "login");
      } catch (err) {
        console.error("[auth] signIn upsert failed", err);
        return false; // JANGAN return true kalau persist gagal
      }
      return true;
    },
    async jwt({ token, user, profile }) {
      const uid =
        (profile?.sub as string | undefined) ??
        (user as { id?: string } | undefined)?.id ??
        (token.uid as string | undefined);
      if (uid) token.uid = uid;
      return token;
    },
    async session({ session, token }) {
      const uid = token.uid as string | undefined;
      if (uid) {
        (session.user as { uid?: string }).uid = uid;
        if (process.env.NEXT_RUNTIME === "nodejs") {
          try {
            const u = await getUserById(uid);
            if (u) (session as { role?: string }).role = u.role;
          } catch (err) {
            console.error("[auth] session role lookup failed", err);
          }
        }
      }
      return session;
    },
  },
});
