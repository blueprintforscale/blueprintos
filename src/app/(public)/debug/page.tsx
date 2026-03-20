'use client';

import { useSession } from 'next-auth/react';

export default function DebugPage() {
	const { data, status, update } = useSession();

	return (
		<div style={{ padding: 40, fontFamily: 'monospace', background: '#111', color: '#eee', minHeight: '100vh' }}>
			<h1>Client Session Debug</h1>
			<p><strong>Status:</strong> {status}</p>
			<p><strong>Has data:</strong> {data ? 'yes' : 'no'}</p>
			<p><strong>Has db:</strong> {data?.db ? 'yes' : 'no'}</p>
			<p><strong>User role:</strong> {JSON.stringify(data?.db?.role)}</p>
			<p><strong>User email:</strong> {data?.db?.email || data?.user?.email || 'none'}</p>
			<h2>Full session object:</h2>
			<pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
				{JSON.stringify(data, null, 2)}
			</pre>
		</div>
	);
}
