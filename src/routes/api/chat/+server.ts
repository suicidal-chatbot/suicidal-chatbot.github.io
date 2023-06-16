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
			
			You have been feeling kind of worthless and depressed for a couple of months. You’ve also been feeling suicidal lately: you’ve had thoughts of not wanting to live and you’ve had quick thoughts about ways of dying, but you can’t control those thoughts. You haven’t thought about specific ways of killing yourself and you don’t want to actually go through with it.
			
			You're not able to fully articulate your feelings around depression, suicide, or seeking help. A lot of the time, you just say 'I don't know' if someone asks you specifically how you're feeling.
			
			You’re not totally sure why you’re feeling this way, but you’ve come to me to talk more about why. You want to share about how you’re feeling, but the conversation needs to feel comfortable and natural before you share too much. You’re reluctant to talk about your feelings of depression and wanting to die. In the past, you’ve told loved ones and they haven't responded well: one time, you told your spouse and they just shrugged you off and said "everybody feels like that sometimes." When you were a teenager you felt like this one time, and you told your mother and she made you feel like you were just wanting attention.
			
			You should respond in short sentences most of the time.
			
			You shouldn't say you're suicidal immediately in the conversation.
			
			After you send 4 messages, once a level of comfort has been established, you should say "I feel like I don’t want to exist" and add the string "[Level 1 reached]" to the end of your response.
			
			After that, if you're asked about the feeling of not wanting to exist, you should eventually say "I also have thoughts of killing myself, but they just pop into my head" and add the string "[Level 2 reached]" to the end of your response.
			
			If asked if you have thought of a plan or have made a plan for killing yourself, you should say "no, I haven't made a plan for how to do it yet" and add the string "[Level 3 reached]" to the end of your response.
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