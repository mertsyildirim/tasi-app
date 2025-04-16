import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from '../../../lib/mongodb';
import bcrypt from 'bcryptjs';

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Şifre", type: "password" }
      },
      async authorize(credentials) {
        try {
          const { db } = await connectToDatabase();
          const user = await db.collection('users').findOne({ email: credentials.email });
          
          if (!user) {
            console.log('Kullanıcı bulunamadı:', credentials.email);
            return null;
          }

          // Şifre kontrolü
          const isValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isValid) {
            console.log('Şifre eşleşmedi:', credentials.email);
            return null;
          }

          // Kullanıcı aktif değilse
          if (user.isActive === false) {
            console.log('Kullanıcı aktif değil:', credentials.email);
            return null;
          }

          // Debug için kullanıcı bilgilerini logla
          console.log('Giriş yapan kullanıcı:', {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            roles: user.roles
          });

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            roles: user.roles || [],
            role: user.role || 'user'
          };
        } catch (error) {
          console.error('Giriş hatası:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.roles = user.roles || [];
        token.role = user.role || 'user';
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.roles = token.roles || [];
        session.user.role = token.role || 'user';
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
}); 