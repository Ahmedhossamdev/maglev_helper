<script lang="ts">
	import JsonTree from './JsonTree.svelte';
	import {
		countDifferences,
		getDiffStatus,
		isArray,
		isObject,
		isPrimitive,
		sortArrayValues,
		sortEntries
	} from '$lib/utils/jsonCompare';

	interface Props {
		value: unknown;
		otherValue: unknown;
		side: 'left' | 'right';
		label?: string;
		level?: number;
		isReference?: boolean;
		ignoredKeys?: string[];
	}

	let {
		value,
		otherValue,
		side,
		label,
		level = 0,
		isReference = false,
		ignoredKeys = []
	}: Props = $props();
	let expanded = $state(level < 2);

	const status = $derived(getDiffStatus(value, otherValue, side, ignoredKeys));
	const hasDiff = $derived(status !== 'same' && !isReference);
	const diffCount = $derived(countDifferences(value, otherValue, ignoredKeys));
	const arrayItems = $derived(isArray(value) ? sortArrayValues(value) : []);
	const otherArrayItems = $derived(isArray(otherValue) ? sortArrayValues(otherValue) : []);

	const otherValueFormatted = $derived(() => {
		if (isPrimitive(otherValue)) {
			return formatPrimitive(otherValue);
		}
		if (otherValue === undefined) {
			return 'missing';
		}
		return 'different';
	});

	function toggle() {
		expanded = !expanded;
	}

	function formatPrimitive(val: unknown): string {
		if (val === null) return 'null';
		if (val === undefined) return 'undefined';
		if (typeof val === 'string') return `"${val}"`;
		return String(val);
	}

	function getValueColorClass(val: unknown): string {
		if (typeof val === 'string') return 'text-green-600 dark:text-green-400';
		if (typeof val === 'number') return 'text-blue-600 dark:text-blue-400';
		if (typeof val === 'boolean') return 'text-blue-600 dark:text-blue-400 font-bold';
		if (val === null) return 'text-slate-500 dark:text-slate-400 italic';
		if (val === undefined) return 'text-slate-500 dark:text-slate-400 italic';
		return 'text-slate-900 dark:text-slate-100';
	}

	function getDiffClass(): string {
		if (isReference || status === 'same') return '';
		if (status === 'different')
			return 'bg-[#f8f8f8] dark:bg-slate-800/50 outline outline-1 outline-[#e0e0e0] dark:outline-slate-700'; // Very subtle gray bg
		return '';
	}

	function getDiffIndicator(): string {
		if (isReference || status === 'same') return '';
		if (status === 'different') return 'text-red-600 bg-red-50 border border-red-200';
		if (status === 'missing') return 'text-orange-600 bg-orange-50 border border-orange-200';
		if (status === 'added') return 'text-green-600 bg-green-50 border border-green-200';
		if (status === 'different')
			return 'text-red-600 bg-red-50 border border-red-200 dark:text-red-400 dark:bg-red-900/30 dark:border-red-700';
		if (status === 'missing')
			return 'text-orange-600 bg-orange-50 border border-orange-200 dark:text-orange-400 dark:bg-orange-900/30 dark:border-orange-700';
		if (status === 'added')
			return 'text-green-600 bg-green-50 border border-green-200 dark:text-green-400 dark:bg-green-900/30 dark:border-green-700';
		return '';
	}
</script>

<div class="font-sans text-[13px] leading-[1.5] tracking-wide">
	{#if label !== undefined}
		<div class="-mx-1 flex items-start rounded px-1 {getDiffClass()}">
			{#if isArray(value) || isObject(value)}
				<button
					onclick={toggle}
					class="mr-1 flex h-4 w-4 cursor-pointer items-center justify-center text-[10px] text-[#707070] select-none hover:text-[#333] dark:text-[#ABB2BF] dark:hover:text-[#E6E6E6]"
				>
					{expanded ? '▼' : '▶'}
				</button>
			{:else}
				<span class="mr-1 w-4 flex-shrink-0"></span>
			{/if}

			<span class="mr-1 flex-shrink-0 font-medium text-[#000080] select-text dark:text-[#C678DD]">
				{label}:
			</span>

			{#if isPrimitive(value)}
				<span class="{getValueColorClass(value)} font-mono select-text">
					{formatPrimitive(value)}
				</span>

				{#if hasDiff}
					<span
						class="ml-3 rounded px-1.5 py-0.5 text-[11px] {getDiffIndicator()} whitespace-nowrap select-none"
					>
						{#if status === 'different'}
							!= {otherValueFormatted()}
						{:else if status === 'missing'}
							missing
						{:else if status === 'added'}
							extra
						{/if}
					</span>
				{/if}
			{:else}
				<span class="text-slate-500 select-text dark:text-slate-400">
					{isArray(value) ? `Array[${value.length}]` : 'Object{...}'}
				</span>
				{#if !expanded && diffCount > 0 && !isReference}
					<span
						class="ml-3 rounded border border-red-100 bg-red-50 px-1.5 py-0.5 text-[11px] text-red-600 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400"
					>
						{diffCount} diffs
					</span>
				{/if}
			{/if}
		</div>
	{/if}

	{#if expanded}
		<div class="ml-5">
			{#if isArray(value)}
				{#each arrayItems as item, index (index)}
					{@const otherItem = otherArrayItems[index]}
					<JsonTree
						value={item}
						otherValue={otherItem}
						label={String(index)}
						{side}
						level={level + 1}
						{isReference}
						{ignoredKeys}
					/>
				{/each}
			{:else if isObject(value)}
				{#each sortEntries(value as Record<string, unknown>) as [key, childValue] (key)}
					{#if !ignoredKeys.includes(key)}
						<JsonTree
							value={childValue}
							otherValue={isObject(otherValue)
								? (otherValue as Record<string, unknown>)[key]
								: undefined}
							label={key}
							{side}
							level={level + 1}
							{isReference}
							{ignoredKeys}
						/>
					{/if}
				{/each}
			{/if}
		</div>
	{:else if !label && isPrimitive(value)}
		<span class="{getValueColorClass(value)} rounded px-1 select-text">
			{formatPrimitive(value)}
		</span>
	{/if}
</div>
