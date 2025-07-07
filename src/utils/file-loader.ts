// Reliable file loading utilities that work with both webpack and turbopack
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Load file contents at build time (server-side only)
 * Works in server components, getStaticProps, and API routes
 */
export function loadFileSync(filePath: string): string {
	if (typeof window !== 'undefined') {
		throw new Error('loadFileSync can only be used on the server side');
	}

	try {
		const fullPath = resolve(process.cwd(), filePath);
		return readFileSync(fullPath, 'utf8');
	} catch (error) {
		console.error(`Failed to load file: ${filePath}`, error);
		throw error;
	}
}

/**
 * Create a loader function that works with your documentation components
 * Similar to how raw-loader works but more reliable
 */
export function createRawImport(filePath: string) {
	return () => loadFileSync(filePath);
}

/**
 * Batch load multiple files (useful for documentation pages)
 */
export function loadMultipleFiles(filePaths: string[]): Record<string, string> {
	const results: Record<string, string> = {};

	for (const filePath of filePaths) {
		try {
			results[filePath] = loadFileSync(filePath);
		} catch (error) {
			console.error(`Failed to load ${filePath}:`, error);
			results[filePath] = `// Error loading ${filePath}`;
		}
	}

	return results;
}

/**
 * For client-side usage - load file contents from public directory
 */
export async function loadPublicFile(publicPath: string): Promise<string> {
	const response = await fetch(publicPath);

	if (!response.ok) {
		throw new Error(`Failed to load file: ${publicPath} (${response.status})`);
	}

	return response.text();
}

/**
 * Utility to extract file extension and determine language for syntax highlighting
 */
export function getFileLanguage(filePath: string): string {
	const ext = filePath.split('.').pop()?.toLowerCase();

	const languageMap: Record<string, string> = {
		ts: 'typescript',
		tsx: 'typescript',
		js: 'javascript',
		jsx: 'javascript',
		json: 'json',
		css: 'css',
		scss: 'scss',
		sass: 'sass',
		md: 'markdown',
		html: 'html',
		xml: 'xml',
		yml: 'yaml',
		yaml: 'yaml',
		sh: 'bash',
		bash: 'bash'
	};

	return languageMap[ext || ''] || 'text';
}

/**
 * Helper for creating code examples like in your documentation
 */
export function createCodeExample(filePath: string, displayName?: string) {
	const content = loadFileSync(filePath);
	const language = getFileLanguage(filePath);
	const name = displayName || filePath.split('/').pop() || filePath;

	return {
		name,
		content,
		language,
		filePath
	};
}
