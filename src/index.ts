import { simpleParser } from 'mailparser';

export default {
	async email(message, env, ctx) {
		if (message.to.includes("test@albin.com.bd")) {
			await env.EMAIL.put(message.from +'-'+ Date.now.toString(), message.raw);

			try {
				// const buffer = await streamToBuffer(message.raw);
				// const parsed = await simpleParser(buffer);
				// const results = await saveMessage(env.DB, parsed.subject + "\n" + parsed.from?.text + "\n" + parsed.to + "\n" + (parsed.html || parsed.text || " "));

				const parsed = await streamToString(message.raw);
				const results = await saveMessage(env.DB, parsed);
				console.log(results);
			} catch (e: any) {
				console.log(e.message);
			}
			return;
		}
		try {
			await message.forward("md.albin.hossain@icloud.com");
		} catch (e: any) {
			console.log(e.message);
		}

		try {
			const db = env.DB;
			const buffer = await streamToBuffer(message.raw);
			const parsed = await simpleParser(buffer);
			const results = await saveMessage(db, parsed.subject + "\n" + parsed.from?.text + "\n" + parsed.to + "\n" + (parsed.html || parsed.text || " "));
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

async function streamToBuffer(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
	const reader = stream.getReader();
	const chunks = [];
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		chunks.push(value);
	}
	return Buffer.concat(chunks.map(chunk => Buffer.from(chunk)));
};


async function streamToString(stream: ReadableStream<Uint8Array>): Promise<string> {
	return await new Response(stream).text();
}