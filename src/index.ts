import * as PostalMime from 'postal-mime'

export default {
	async email(message, env, ctx) {
		await handleEmail(message, env);
	},
} satisfies ExportedHandler<Env>;

async function handleEmail(message: ForwardableEmailMessage, env: Env) {
	const parser = new PostalMime.default()

	const rawEmail = new Response(message.raw)

	const email = await parser.parse(await rawEmail.arrayBuffer())

	await env.EMAIL_DB.prepare(
		`INSERT INTO messages (message_id, subject, date, "from", sender, html, text, in_reply_to, "references", delivered_to, return_path, headers, "to", cc, bcc, reply_to, attachments,) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
			email.messageId,
			email.subject || '',
			email.date || new Date().toISOString(),
			JSON.stringify(email.from),
			JSON.stringify(email.sender),
			email.html || '',
			email.text || '',
			email.inReplyTo || '',
			email.references || '',
			email.deliveredTo || '',
			email.returnPath || '',
			JSON.stringify(email.headers),
			JSON.stringify(email.to),
			JSON.stringify(email.cc),
			JSON.stringify(email.bcc),
			JSON.stringify(email.replyTo),
			JSON.stringify(email.attachments),
		).run()


	email.attachments.forEach(async attachment => {
		await env.EMAIL_BUCKET.put(`attachments/${email.messageId}/${attachment.filename}`, attachment.content);
	})
}