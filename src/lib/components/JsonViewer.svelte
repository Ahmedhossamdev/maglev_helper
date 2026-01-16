<script lang="ts">
	import JsonTree from './JsonTree.svelte';

	interface Props {
		data: unknown;
		otherData?: unknown;
		focusPath?: string;
		ignoredKeys?: string[];
		mode?: 'local' | 'production';
	}

	let { data, otherData, ignoredKeys = [], mode = 'local' }: Props = $props();
</script>

<div class="h-full bg-white font-sans text-sm dark:bg-slate-900">
	<div class="min-h-full p-4 font-mono">
		{#if data !== undefined}
			<JsonTree
				value={data}
				otherValue={otherData}
				side={mode === 'local' ? 'left' : 'right'}
				isReference={mode === 'production'}
				{ignoredKeys}
				level={0}
			/>
		{:else}
			<div class="py-8 text-center text-slate-400 italic">No JSON data</div>
		{/if}
	</div>
</div>
