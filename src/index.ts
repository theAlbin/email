export default {
	async email(message, env, ctx) {
		try {
			saveEmail(message, env);
		} catch (e: any) {
			console.log(e.message);
		}

		// try {
		// 	await message.forward("md.albin.hossain@icloud.com");
		// } catch (e: any) {
		// 	console.log(e.message);
		// }
	},

	async fetch(request, env, ctx): Promise<Response> {
		return redirectToHome();
	}
} satisfies ExportedHandler<Env>;

function redirectToHome() {
	const destinationURL = "https://albin.com.bd";
	const statusCode = 301;
	return Response.redirect(destinationURL, statusCode);
}

async function saveEmail(message: ForwardableEmailMessage, env: Env) {
	const rawEmail = await streamToArrayBuffer(message.raw, message.rawSize);
	await env.EMAIL.put(`raw-email-${message.from}-${Date.now()}.eml`, rawEmail, {
		httpMetadata: message.headers,
	});
}

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