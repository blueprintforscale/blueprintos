import { NextResponse } from 'next/server';
import { auth } from '@auth/authJs';

export async function GET() {
	try {
		const session = await auth();
		return NextResponse.json({ session, hasDb: !!session?.db, userRole: session?.db?.role });
	} catch (e) {
		return NextResponse.json({ error: String(e) });
	}
}
