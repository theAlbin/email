/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async email(message, env, ctx) {
		if(message.to.includes("test@albin.com.bd")){
			try {
				const db = env.DB;
				const reader = message.raw.getReader();
				let result = '';
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					result += new TextDecoder().decode(value);
				}
				const results = await saveMessage(db, result);
				console.log(results);
			} catch (e: any) {
				console.log(e.message);
			}
			return;
		}
		try {
			await message.forward("md_albin_hossain@zohomail.com");
		} catch (e: any) {
			console.log(e.message);
		}
		try {
			await message.forward("md.albin.hossain@icloud.com");
		} catch (e: any) {
			console.log(e.message);
		}
		try {
			await message.forward("md_albin_hossain@hotmail.com");
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