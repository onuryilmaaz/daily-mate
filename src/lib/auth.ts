import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User.model";

export const authOptions = {
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Credentials Provider
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await connectDB();

          // Kullanıcıyı veritabanından bul (şifre dahil)
          const user = await User.findOne({
            email: credentials.email.toLowerCase(),
          }).select("+password");

          if (!user) {
            return null;
          }

          // Şifreyi doğrula (sadece credentials provider için)
          if (user.provider === "credentials") {
            const isValidPassword = await bcrypt.compare(
              credentials.password,
              user.password
            );

            if (!isValidPassword) {
              return null;
            }
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            surname: user.surname,
          };
        } catch (error) {
          console.error("Giriş hatası:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async signIn({ user, account, profile }: any) {
      // Google OAuth ile giriş yapıldığında
      if (account?.provider === "google") {
        try {
          await connectDB();

          // Kullanıcı daha önce kayıt olmuş mu kontrol et
          const existingUser = await User.findOne({
            $or: [
              { email: user.email },
              { googleId: account.providerAccountId },
            ],
          });

          if (existingUser) {
            // Google ID'yi güncelle (eğer yoksa)
            if (!existingUser.googleId && account.providerAccountId) {
              existingUser.googleId = account.providerAccountId;
              existingUser.provider = "google";
              await existingUser.save();
            }

            // Kullanıcı bilgilerini güncelle
            user.id = existingUser._id.toString();
            user.name = existingUser.name;
            user.surname = existingUser.surname;
          } else {
            // Google'dan gelen isme göre name ve surname'i ayır
            const fullName = profile?.name || user.name || "";
            const nameParts = fullName.split(" ");
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(" ") || "";

            // Yeni kullanıcı oluştur
            const newUser = new User({
              email: user.email,
              name: firstName,
              surname: lastName,
              provider: "google",
              googleId: account.providerAccountId,
            });

            await newUser.save();

            user.id = newUser._id.toString();
            user.name = newUser.name;
            user.surname = newUser.surname;
          }

          return true;
        } catch (error) {
          console.error("Google OAuth error:", error);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.surname = user.surname;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.surname = token.surname as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    signUp: "/register",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
