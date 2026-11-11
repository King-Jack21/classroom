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
    async signIn({ user, profile }) {
      try {
        if (profile?.email && user?.id) {
          const upserted = await upsertGoogleUser({
            uid: user.id,
            name: user.name ?? profile.name ?? "Pengguna",
            email: profile.email,
            image:
              (profile as { picture?: string | null }).picture ?? user.image ?? null,
          });
          await logActivity(upserted.uid, "login");
        }
      } catch {
        // Kegagalan Redis saat callback tidak menggagalkan login;
        // data profil diverifikasi ulang di server component via requireUser.
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.uid = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      (session.user as { uid?: string }).uid = token.uid as string | undefined;
      // Pengambilan role dari Redis hanya dijalankan di runtime Node (server component/route),
      // bukan di middleware edge.
      if (process.env.NEXT_RUNTIME === "nodejs" && token.uid) {
        const u = await getUserById(token.uid as string);
        if (u) {
          (session as { role?: string }).role = u.role;
        }
      }
      return session;
    },
  },
});
