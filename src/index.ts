export default {
	async email(message, env, ctx) {
		if (message.to.includes("test@albin.com.bd")) {

			const key = Math.random().toString(36).substring(7);
			await env.EMAIL.put(key, await streamToArrayBuffer(message.raw, message.rawSize), {
				httpMetadata: message.headers,
			});

			const parsed = await streamToString(message.raw);
			const results = await saveMessage(env.DB, parsed + "\n" + JSON.stringify(message.headers));
			console.log(results);

			return;
		}
		try {
			await message.forward("md.albin.hossain@icloud.com");
		} catch (e: any) {
			console.log(e.message);
		}

		try {
			const db = env.DB;
			const parsed = await streamToString(message.raw);
			const results = await saveMessage(db, parsed + "\n" + JSON.stringify(message.headers));
			console.log(results);
		} catch (e: any) {
			console.log(e.message);
		}
	},

	async fetch(request, env, ctx): Promise<Response> {
		const destinationURL = "https://albin.com.bd";
		const statusCode = 301;
		return Response.redirect(destinationURL, statusCode);
	}
} satisfies ExportedHandler<Env>;

async function saveMessage(db: D1Database, message: String) {
	const query = 'INSERT INTO FormResponses(form_name, data) VALUES (?, ?)';

	const results = await db
		.prepare(query)
		.bind("EmailMessage", message)
		.run();

	return results;
};

async function streamToArrayBuffer(stream: ReadableStream<Uint8Array>, streamSize: number): Promise<Uint8Array> {
	let result = new Uint8Array(streamSize);
	let bytesRead = 0;
	const reader = stream.getReader();
	while (true) {
		const { done, value } = await reader.read();
		if (done) {
			break;
		}
		result.set(value, bytesRead);
		bytesRead += value.length;
	}
	return result;
}


async function streamToString(stream: ReadableStream<Uint8Array>): Promise<string> {
	return await new Response(stream).text();
}