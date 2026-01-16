export type DiffStatus = 'same' | 'different' | 'missing' | 'added';

export function isArray(value: unknown): value is unknown[] {
	return Array.isArray(value);
}

export function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !isArray(value);
}

export function isPrimitive(value: unknown): boolean {
	return !isArray(value) && !isObject(value);
}

function stableStringify(value: unknown, ignoredKeys: string[] = []): string {
	if (value === null) return 'null';
	if (value === undefined) return 'undefined';
	if (typeof value === 'number' && Number.isNaN(value)) return 'NaN';
	if (isArray(value)) {
		const normalized = value.map((item) => stableStringify(item, ignoredKeys)).sort();
		return `[${normalized.join(',')}]`;
	}
	if (isObject(value)) {
		const entries = Object.keys(value)
			.filter((key) => !ignoredKeys.includes(key))
			.sort()
			.map((key) => `${key}:${stableStringify(value[key], ignoredKeys)}`);
		return `{${entries.join(',')}}`;
	}
	return JSON.stringify(value);
}

export function deepEqualIgnoreOrder(a: unknown, b: unknown, ignoredKeys: string[] = []): boolean {
	if (Object.is(a, b)) return true;
	if (isArray(a) && isArray(b)) {
		if (a.length !== b.length) return false;
		const aSorted = a.map((item) => stableStringify(item, ignoredKeys)).sort();
		const bSorted = b.map((item) => stableStringify(item, ignoredKeys)).sort();
		return aSorted.every((value, index) => value === bSorted[index]);
	}
	if (isObject(a) && isObject(b)) {
		const aKeys = Object.keys(a)
			.filter((k) => !ignoredKeys.includes(k))
			.sort();
		const bKeys = Object.keys(b)
			.filter((k) => !ignoredKeys.includes(k))
			.sort();
		if (aKeys.length !== bKeys.length) return false;
		return aKeys.every(
			(key, index) => key === bKeys[index] && deepEqualIgnoreOrder(a[key], b[key], ignoredKeys)
		);
	}
	return false;
}

export function getDiffStatus(
	value: unknown,
	otherValue: unknown,
	side: 'left' | 'right',
	ignoredKeys: string[] = []
): DiffStatus {
	if (otherValue === undefined) {
		return side === 'left' ? 'missing' : 'added';
	}
	return deepEqualIgnoreOrder(value, otherValue, ignoredKeys) ? 'same' : 'different';
}

export function countDifferences(a: unknown, b: unknown, ignoredKeys: string[] = []): number {
	if (a === undefined && b === undefined) return 0;
	if (a === undefined || b === undefined) return 1;
	if (isPrimitive(a) || isPrimitive(b)) {
		return deepEqualIgnoreOrder(a, b, ignoredKeys) ? 0 : 1;
	}
	if (isArray(a) && isArray(b)) {
		const aSorted = a.map((item) => stableStringify(item, ignoredKeys)).sort();
		const bSorted = b.map((item) => stableStringify(item, ignoredKeys)).sort();
		let i = 0;
		let j = 0;
		let diff = 0;
		while (i < aSorted.length || j < bSorted.length) {
			if (i >= aSorted.length) {
				diff += 1;
				j += 1;
				continue;
			}
			if (j >= bSorted.length) {
				diff += 1;
				i += 1;
				continue;
			}
			if (aSorted[i] === bSorted[j]) {
				i += 1;
				j += 1;
			} else if (aSorted[i] < bSorted[j]) {
				diff += 1;
				i += 1;
			} else {
				diff += 1;
				j += 1;
			}
		}
		return diff;
	}
	if (isObject(a) && isObject(b)) {
		const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
		let diff = 0;
		for (const key of keys) {
			if (ignoredKeys.includes(key)) continue;
			diff += countDifferences(a[key], b[key], ignoredKeys);
		}
		return diff;
	}
	return deepEqualIgnoreOrder(a, b, ignoredKeys) ? 0 : 1;
}

export function sortEntries(obj: Record<string, unknown>): [string, unknown][] {
	return Object.entries(obj).sort(([a], [b]) => a.localeCompare(b));
}

export function sortArrayValues(values: unknown[]): unknown[] {
	return [...values].sort((a, b) => stableStringify(a).localeCompare(stableStringify(b)));
}

export function parsePath(path: string): (string | number)[] {
	if (!path) return [];
	const tokens: (string | number)[] = [];
	const regex = /\[(\d+)\]|[^.[\]]+/g;
	let match: RegExpExecArray | null;
	while ((match = regex.exec(path)) !== null) {
		if (match[1] !== undefined) {
			tokens.push(Number(match[1]));
		} else if (match[0]) {
			tokens.push(match[0]);
		}
	}
	return tokens;
}

export function getByPath(obj: unknown, path: string): unknown {
	if (!path) return obj;
	const tokens = parsePath(path);
	let current: unknown = obj;
	for (const token of tokens) {
		if (current === null || current === undefined) return undefined;
		if (isObject(current) || isArray(current)) {
			current = (current as Record<string | number, unknown>)[token];
		} else {
			return undefined;
		}
	}
	return current;
}
