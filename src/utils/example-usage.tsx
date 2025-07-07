// Example of how to use the new file loader utility instead of raw-loader imports
// This replaces the need for ?raw imports

import { loadFileSync, createCodeExample, loadMultipleFiles } from './file-loader';

// Example 1: Simple server component using file loader
export function SimpleCodeExample() {
	// This runs at build time (server-side)
	const nextConfigContent = loadFileSync('./next.config.ts');

	return (
		<div>
			<h3>Next.js Configuration</h3>
			<pre>
				<code>{nextConfigContent}</code>
			</pre>
		</div>
	);
}

// Example 2: Advanced documentation component (similar to your existing components)
export function AdvancedDocumentationExample() {
	// Load multiple files at once
	const fileContents = loadMultipleFiles([
		'./src/components/LightDarkModeToggle.tsx',
		'./src/components/PageBreadcrumb.tsx',
		'./package.json'
	]);

	// Create code examples with metadata
	const examples = Object.entries(fileContents).map(([filePath, content]) => {
		const name = filePath.split('/').pop() || filePath;
		const language = filePath.endsWith('.tsx') ? 'typescript' : filePath.endsWith('.json') ? 'json' : 'text';

		return {
			name,
			content,
			language,
			filePath
		};
	});

	return (
		<div>
			<h2>Code Examples</h2>
			{examples.map((example, index) => (
				<div key={index}>
					<h3>{example.name}</h3>
					<pre data-language={example.language}>
						<code>{example.content}</code>
					</pre>
				</div>
			))}
		</div>
	);
}

// Example 3: Replace your existing raw imports
// Instead of:
// import ComponentRaw from '../../components/MyComponent.tsx?raw';

// Use this approach:
export function ReplacementExample() {
	const componentContent = loadFileSync('./src/components/LightDarkModeToggle.tsx');
	const componentExample = createCodeExample('./src/components/LightDarkModeToggle.tsx', 'Light/Dark Toggle');

	return (
		<div>
			<h3>{componentExample.name}</h3>
			<pre data-language={componentExample.language}>
				<code>{componentExample.content}</code>
			</pre>
		</div>
	);
}

// Example 4: How to migrate your existing documentation components
// If you have components like AutocompleteDoc.tsx that import many raw files,
// you can refactor them like this:

export function MigratedDocumentationComponent() {
	// Instead of individual raw imports, load all files at once
	const componentFiles = [
		'./src/components/ui/components/autocomplete/Autocomplete.tsx',
		'./src/components/ui/components/autocomplete/BasicAutocomplete.tsx',
		'./src/components/ui/components/autocomplete/DisabledOptions.tsx'
		// ... more files
	];

	const rawContents = loadMultipleFiles(componentFiles);

	// Create a mapping of component names to their raw content
	const componentExamples = componentFiles.reduce(
		(acc, filePath) => {
			const componentName = filePath.split('/').pop()?.replace('.tsx', '') || '';
			acc[componentName] = rawContents[filePath];
			return acc;
		},
		{} as Record<string, string>
	);

	return (
		<div>
			<h2>Autocomplete Components</h2>
			{Object.entries(componentExamples).map(([name, content]) => (
				<div key={name}>
					<h3>{name}</h3>
					<pre data-language="typescript">
						<code>{content}</code>
					</pre>
				</div>
			))}
		</div>
	);
}

// Example 5: Error handling and fallbacks
export function SafeFileLoader({ filePath }: { filePath: string }) {
	try {
		const content = loadFileSync(filePath);
		return (
			<pre>
				<code>{content}</code>
			</pre>
		);
	} catch (error) {
		return (
			<div>
				<p>Error loading file: {filePath}</p>
				<p>{error instanceof Error ? error.message : 'Unknown error'}</p>
			</div>
		);
	}
}

// Export utility functions for easy use in other components
export { loadFileSync, createCodeExample, loadMultipleFiles, getFileLanguage } from './file-loader';
