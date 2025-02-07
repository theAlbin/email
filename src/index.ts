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

	const messageId = email.messageId
	const subject = email.subject || ''
	const date = email.date || new Date().toISOString() || ''
	const from = JSON.stringify(email.from) || ''
	const sender = JSON.stringify(email.sender) || ''
	const html = email.html || ''
	const text = email.text || ''
	const inReplyTo = email.inReplyTo || ''
	const references = email.references || ''
	const deliveredTo = email.deliveredTo || ''
	const returnPath = email.returnPath || ''
	const headers = JSON.stringify(email.headers) || ''
	const to = JSON.stringify(email.to) || ''
	const cc = JSON.stringify(email.cc) || ''
	const bcc = JSON.stringify(email.bcc) || ''
	const replyTo = JSON.stringify(email.replyTo) || ''
	const attachments = JSON.stringify(email.attachments.map(function (attachment) {
		return {
			attachmentId: attachment.contentId,
			filename: attachment.filename,
			contentType: attachment.mimeType,
			disposition: attachment.disposition,
			related: attachment.related,
		}

	})) || ''

	const query = `INSERT INTO messages (message_id, "subject", "date", "from", sender, html, text, in_reply_to, "references", delivered_to, return_path, headers, "to", cc, bcc, reply_to, attachments) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

	await env.EMAIL_DB.prepare(query
	).bind(
		messageId,
		subject,
		date,
		from,
		sender,
		html,
		text,
		inReplyTo,
		references,
		deliveredTo,
		returnPath,
		headers,
		to,
		cc,
		bcc,
		replyTo,
		attachments
	).run()

	email.attachments.forEach(async attachment => {
		await env.EMAIL_BUCKET.put(`attachments/${email.messageId}/${attachment.contentId}`, attachment.content);
	})
}