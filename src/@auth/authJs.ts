import NextAuth from 'next-auth';
import { User } from '@auth/user';
import { createStorage } from 'unstorage';
import memoryDriver from 'unstorage/drivers/memory';
import vercelKVDriver from 'unstorage/drivers/vercel-kv';
import { UnstorageAdapter } from '@auth/unstorage-adapter';
import type { NextAuthConfig } from 'next-auth';
import type { Provider } from 'next-auth/providers';
import Credentials from 'next-auth/providers/credentials';
import { authSignIn, authSignUp, authGetDbUserByEmail, authCreateDbUser } from './authApi';

const storage = createStorage({
	driver: process.env.VERCEL
		? vercelKVDriver({
				url: process.env.AUTH_KV_REST_API_URL,
				token: process.env.AUTH_KV_REST_API_TOKEN,
				env: false
			})
		: memoryDriver()
});

export const providers: Provider[] = [
	Credentials({
		async authorize(formInput) {
			const email = formInput?.email as string;
			const password = formInput?.password as string;
			const formType = formInput?.formType as string;
			const displayName = formInput?.displayName as string;

			if (!email || !password) return null;

			if (formType === 'signup') {
				if (!displayName) return null;

				const res = await authSignUp(email, password, displayName);

				if (!res.ok) return null;

				return { email };
			}

			// Sign in
			const res = await authSignIn(email, password);

			if (!res.ok) return null;

			return { email };
		}
	})
];

const config = {
	theme: { logo: '/assets/images/logo/logo.svg' },
	adapter: UnstorageAdapter(storage),
	pages: {
		signIn: '/sign-in'
	},
	providers,
	basePath: '/auth',
	trustHost: true,
	callbacks: {
		authorized() {
			return true;
		},
		jwt({ token, trigger, user }) {
			if (trigger === 'update') {
				token.name = user.name;
			}

			return token;
		},
		async session({ session }) {
			if (session) {
				const response = await authGetDbUserByEmail(session.user.email);

				if (response.ok) {
					session.db = (await response.json()) as User;
					return session;
				}

				if (response.status === 404) {
					const newUserResponse = await authCreateDbUser({
						email: session.user.email,
						displayName: session.user.name
					});

					if (newUserResponse.ok) {
						session.db = (await newUserResponse.json()) as User;
						return session;
					}
				}
			}

			return null;
		}
	},
	session: {
		strategy: 'jwt',
		maxAge: 30 * 24 * 60 * 60
	},
	debug: process.env.NODE_ENV !== 'production'
} satisfies NextAuthConfig;

export type AuthJsProvider = {
	id: string;
	name: string;
	style?: {
		text?: string;
		bg?: string;
	};
};

export const authJsProviderMap: AuthJsProvider[] = providers
	.map((provider) => {
		const providerData = typeof provider === 'function' ? provider() : provider;

		return {
			id: providerData.id,
			name: providerData.name,
			style: {
				text: (providerData as { style?: { text: string } }).style?.text,
				bg: (providerData as { style?: { bg: string } }).style?.bg
			}
		};
	})
	.filter((provider) => provider.id !== 'credentials');

export const { handlers, auth, signIn, signOut } = NextAuth(config);
