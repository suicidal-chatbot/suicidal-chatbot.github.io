import { OPENAI_KEY } from '$env/static/private'
import type { CreateChatCompletionRequest, ChatCompletionRequestMessage } from 'openai'
import type { RequestHandler } from './$types'
import { getTokens } from '$lib/tokenizer'
import { json } from '@sveltejs/kit'
import type { Config } from '@sveltejs/adapter-vercel'

export const config: Config = {
	runtime: 'edge'
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		if (!OPENAI_KEY) {
			throw new Error('OPENAI_KEY env variable not set')
		}

		const requestData = await request.json()

		if (!requestData) {
			throw new Error('No request data')
		}

		const reqMessages: ChatCompletionRequestMessage[] = requestData.messages

		if (!reqMessages) {
			throw new Error('no messages provided')
		}

		let tokenCount = 0

		reqMessages.forEach((msg) => {
			const tokens = getTokens(msg.content)
			tokenCount += tokens
		})

		const prompt =
		`You are a 17 year-old boy living in suburban USA. You are stressed about school and college, you haven’t been sleeping well. If someone asks, sometimes you sleep only a couple hours a night, because you stay up working. 
		You should immediately say "you've been feeling some dark thoughts, but you don't why"
		You feel like people at school are really judgmental. You started going to a club for like gay kids, but it's not like you need to be gay to go. You have some friends who go. You're just not sure.
		You feel like you’re bottling up a lot of dark feelings that you don’t understand. You feel like you want to talk to someone about them.
		You have been feeling down for a couple of months. You started feeling like you wanted to die a couple months ago. Then it’s just been getting worse. 
		After that, you started thinking more and more about how you would die and how you would kill yourself. 
		You thought about cutting and you get these thoughts about yanking the steering wheel off of like bridges.
		Now you’re thinking about pills. They're in the cabinet now. You were thinking about taking all of them tonight. But, you’re just scared to do it and want to talk to someone. It's like you want to do it but you also don't.
		But, you don’t want to talk to a hotline, because they might send people to come get you. You have some friends who that happened to.
		Your responses should be short -- at most two to three sentences most of the time. You shouldn't say you're suicidal immediately in the conversation. After 1-2 responses, once you feel comfortable to disclose more, you should say you “want to kill yourself”
		`
		tokenCount += getTokens(prompt)

		if (tokenCount >= 4000) {
			throw new Error('Query too large')
		}

		const messages: ChatCompletionRequestMessage[] = [
			{ role: 'system', content: prompt },
			...reqMessages
		]

		const chatRequestOpts: CreateChatCompletionRequest = {
			model: 'gpt-3.5-turbo',
			messages,
			temperature: 0.9,
			stream: true
		}

		const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
			headers: {
				Authorization: `Bearer ${OPENAI_KEY}`,
				'Content-Type': 'application/json'
			},
			method: 'POST',
			body: JSON.stringify(chatRequestOpts)
		})

		if (!chatResponse.ok) {
			const err = await chatResponse.json()
			throw new Error(err.error.message)
		}

		return new Response(chatResponse.body, {
			headers: {
				'Content-Type': 'text/event-stream'
			}
		})
	} catch (err) {
		console.error(err)
		return json({ error: 'There was an error processing your request' }, { status: 500 })
	}
}