import ky, { KyInstance } from 'ky';

export const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || '';

let globalHeaders: Record<string, string> = {};

let _api: KyInstance | null = null;

function getApi(): KyInstance {
	if (!_api) {
		const prefix = API_BASE_URL
			? `${API_BASE_URL}/api`
			: typeof window !== 'undefined'
				? `${window.location.origin}/api`
				: '/api';

		_api = ky.create({
			prefixUrl: prefix,
			hooks: {
				beforeRequest: [
					(request) => {
						Object.entries(globalHeaders).forEach(([key, value]) => {
							request.headers.set(key, value);
						});
					}
				]
			},
			retry: {
				limit: 2,
				methods: ['get', 'put', 'head', 'delete', 'options', 'trace']
			}
		});
	}

	return _api;
}

export const api = new Proxy({} as KyInstance, {
	get(_target, prop) {
		return (getApi() as Record<string | symbol, unknown>)[prop];
	}
});

export const setGlobalHeaders = (headers: Record<string, string>) => {
	globalHeaders = { ...globalHeaders, ...headers };
};

export const removeGlobalHeaders = (headerKeys: string[]) => {
	headerKeys.forEach((key) => {
		delete globalHeaders[key];
	});
};

export const getGlobalHeaders = () => {
	return globalHeaders;
};

export default api;
