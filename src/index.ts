import * as PostalMime from 'postal-mime'

export default {
	async email(message, env, ctx) { await handleEmail(message, env); },
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
	const attachments = email.attachments || []

	if (attachments) {
		for (const attachment of attachments) {
			const attachmentKey = `attachments/${messageId}/${attachment.contentId}${attachment.filename}`
			await env.EMAIL_BUCKET.put(attachmentKey, attachment.content)
		}
	}

	const query = `INSERT INTO messages (message_id, "subject", "date", "from", sender, html, text, in_reply_to, "references", delivered_to, return_path, headers, "to", cc, bcc, reply_to, attachments) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

	await env.EMAIL_DB.prepare(query
	).bind(
		email.messageId,
		email.subject || '',
		email.date || new Date().toISOString() || '',
		JSON.stringify(email.from) || '',
		JSON.stringify(email.sender) || '',
		email.html || '',
		email.text || '',
		email.inReplyTo || '',
		email.references || '',
		email.deliveredTo || '',
		email.returnPath || '',
		JSON.stringify(email.headers) || '',
		JSON.stringify(email.to) || '',
		JSON.stringify(email.cc) || '',
		JSON.stringify(email.bcc) || '',
		JSON.stringify(email.replyTo) || '',
		JSON.stringify(email.attachments)
	).run()

}