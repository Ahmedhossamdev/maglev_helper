import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { url1, url2 } = await request.json();

		const [response1, response2] = await Promise.all([
			fetch(url1)
				.then((r) => r.json())
				.catch((e) => ({ error: e.message })),
			fetch(url2)
				.then((r) => r.json())
				.catch((e) => ({ error: e.message }))
		]);

		return json({ response1, response2 });
	} catch (error) {
		return json(
			{ error: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
};
