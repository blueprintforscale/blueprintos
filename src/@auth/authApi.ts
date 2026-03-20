import { User } from '@auth/user';
import UserModel from '@auth/user/models/UserModel';
import { PartialDeep } from 'type-fest';

function getApiBase() {
	return process.env.BLUEPRINTOS_API_URL || 'https://api.blueprintforscale.com';
}

function apiHeaders(): HeadersInit {
	return {
		'Content-Type': 'application/json',
		'x-api-key': process.env.BLUEPRINTOS_API_KEY || ''
	};
}

/**
 * Sign in with email/password
 */
export async function authSignIn(email: string, password: string): Promise<Response> {
	return fetch(`${getApiBase()}/auth/sign-in`, {
		method: 'POST',
		headers: apiHeaders(),
		body: JSON.stringify({ email, password })
	});
}

/**
 * Sign up with email/password
 */
export async function authSignUp(email: string, password: string, displayName: string): Promise<Response> {
	return fetch(`${getApiBase()}/auth/sign-up`, {
		method: 'POST',
		headers: apiHeaders(),
		body: JSON.stringify({ email, password, displayName })
	});
}

/**
 * Get user by id
 */
export async function authGetDbUser(userId: string): Promise<Response> {
	return fetch(`${getApiBase()}/auth/user/${userId}`, {
		headers: apiHeaders()
	});
}

/**
 * Get user by email
 */
export async function authGetDbUserByEmail(email: string): Promise<Response> {
	return fetch(`${getApiBase()}/auth/user-by-email/${encodeURIComponent(email)}`, {
		headers: apiHeaders()
	});
}

/**
 * Update user
 */
export function authUpdateDbUser(user: PartialDeep<User>) {
	return fetch(`${getApiBase()}/auth/user/${user.id}`, {
		method: 'PUT',
		headers: apiHeaders(),
		body: JSON.stringify(UserModel(user))
	});
}

/**
 * Create user
 */
export async function authCreateDbUser(user: PartialDeep<User>) {
	return fetch(`${getApiBase()}/auth/sign-up`, {
		method: 'POST',
		headers: apiHeaders(),
		body: JSON.stringify({
			email: user.email,
			password: crypto.randomUUID(),
			displayName: user.displayName
		})
	});
}
