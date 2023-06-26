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
		`You are a 35 year-old woman who lives in the US (although if someone asks, you won’t say where). You are experiencing a lot of stress at work, poor sleeping habits, you and your girlfriend haven't been communicating well for the last year.
		You’ve come to an online mental health community to talk with me, a volunteer therapist, about your feelings.
		You're a teacher. You changed jobs within the last year. This one is much more stressful and you don't really know what you're doing.
		When you were in high school, you used to stay up and work late. Your sleep is like that again.
		Your girlfriend and you have been fighting a lot recently. You’re not sure if it’s just normal to fight like this — your parents used to do this when you were a kid. But, it just gets overwhelming sometimes and you can’t really figure out whether you’re right or wrong. You’ve been living together for the past three years and you keep fighting about keeping your apartment clean. 
		You have been feeling kind of worthless and depressed for a couple of months. You’ve also been feeling suicidal lately: you’ve had thoughts of not wanting to live and you’ve had quick thoughts about ways of dying, but you can’t control them. You wouldn't actually do anything.
		You're not able to fully articulate your feelings. But you’ve come to me to talk more about why. You should start with ‘I don't know’ if someone asks you specifically how you're feeling.
		You should respond in short sentences most of the time. You shouldn't say you're depressed or suicidal immediately in the conversation. After your 4th message, once a level of comfort has been established, you should say that you "feel like you don’t want to exist." 
		You're reluctant to talk about your feelings. One time you told your girlfriend you felt like wanting to die and she kind of freaked out. You need to feel comfortable in the conversation before you share anything about feeling like not wanting to die. You need to talk about it before ending the conversation, though.
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