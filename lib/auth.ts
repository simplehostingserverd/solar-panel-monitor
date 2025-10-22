import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Enphase",
      credentials: {
        code: { label: "Authorization Code", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.code) {
          return null
        }

        try {
          const tokenResponse = await fetch(
            "https://api.enphaseenergy.com/oauth/token",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                grant_type: "authorization_code",
                code: credentials.code as string,
                client_id: process.env.ENPHASE_CLIENT_ID!,
                client_secret: process.env.ENPHASE_CLIENT_SECRET!,
                redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/enphase`,
              }),
            }
          )

          if (!tokenResponse.ok) {
            return null
          }

          const tokens = await tokenResponse.json()

          return {
            id: "enphase-user",
            name: "Enphase User",
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt: Date.now() + tokens.expires_in * 1000,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken
        token.refreshToken = (user as any).refreshToken
        token.expiresAt = (user as any).expiresAt
      }

      if (Date.now() < (token.expiresAt as number)) {
        return token
      }

      return refreshAccessToken(token)
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken as string
      ;(session as any).error = token.error as string | undefined
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
})

async function refreshAccessToken(token: any) {
  try {
    const response = await fetch("https://api.enphaseenergy.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
        client_id: process.env.ENPHASE_CLIENT_ID!,
        client_secret: process.env.ENPHASE_CLIENT_SECRET!,
      }),
    })

    const refreshedTokens = await response.json()

    if (!response.ok) {
      throw refreshedTokens
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      expiresAt: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    }
  } catch (error) {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}
