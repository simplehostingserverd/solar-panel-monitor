import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Simple temporary login - replace with your actual auth logic
        if (credentials?.username === "admin" && credentials?.password === "admin") {
          return {
            id: "admin-user",
            name: "Admin User",
            email: "admin@bishopsanpedro.org",
          }
        }
        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
})
