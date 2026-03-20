import { NextResponse } from 'next/server';

export async function GET() {
	const apiUrl = process.env.BLUEPRINTOS_API_URL || '(not set)';
	const apiKey = process.env.BLUEPRINTOS_API_KEY ? 'set (' + process.env.BLUEPRINTOS_API_KEY.slice(0, 6) + '...)' : '(not set)';
	const authSecret = process.env.AUTH_SECRET ? 'set' : '(not set)';

	let apiHealth = 'unknown';
	let apiUserTest = 'unknown';

	try {
		const healthRes = await fetch(`${process.env.BLUEPRINTOS_API_URL || 'https://api.blueprintforscale.com'}/health`);
		apiHealth = `${healthRes.status} ${await healthRes.text()}`;
	} catch (e) {
		apiHealth = `error: ${e}`;
	}

	try {
		const userRes = await fetch(
			`${process.env.BLUEPRINTOS_API_URL || 'https://api.blueprintforscale.com'}/auth/user-by-email/martin@blueprintforscale.com`,
			{ headers: { 'x-api-key': process.env.BLUEPRINTOS_API_KEY || '' } }
		);
		apiUserTest = `${userRes.status} ${await userRes.text()}`;
	} catch (e) {
		apiUserTest = `error: ${e}`;
	}

	return NextResponse.json({
		env: { apiUrl, apiKey, authSecret },
		apiHealth,
		apiUserTest
	});
}
