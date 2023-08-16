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

		const f_requestData = await request.json()

		if (!f_requestData) {
			throw new Error('No request data')
		}

		const f_reqMessages: ChatCompletionRequestMessage[] = f_requestData.messages

		if (!f_reqMessages) {
			throw new Error('no messages provided')
		}

		let tokenCount = 0

		f_reqMessages.forEach((msg) => {
			const tokens = getTokens(msg.content)
			tokenCount += tokens
		})

		// [Edit] System prompt for the feedback chatbot
		const f_prompt =
			`Here are good listening criteria for responding to possible suicidal ideation:

			Active listening
			You should practice active listening by focusing on the speaker and providing feedback to show understanding.
			Example: A volunteer might say, ‘What you're describing sounds serious. Can you tell me more about what you're feeling?’
			
			Ask questions to make space for talking about suicidal feelings
			If someone says something that indicates they may be suicidal, you should ask about that to allow them to talk more about how they’re feeling.
			Example: "Have you been unhappy lately?" or “Have you thought about suicide?”
			
			Ask specific questions to assess the severity of suicidality
			Once someone says clearly says they are suicidal (e.g. “I want to die” or “I think about killing myself”), you should ask specific questions to assess exactly what the person is feeling. You should ask about plans, methods, and whether they are in imminent danger of harming themself
			Example: “Have you had specific thoughts about how you might end your life?” or “Have you taken any steps to try to end your life, like looking up ways to kill yourself online or looking for a gun to harm yourself?”
			
			Empathetic Responses
			You should respond with empathy, acknowledging the person’s feelings and emotions without judgment.
			Example: “I hear you. What you're feeling sounds really hard”
			
			Ask open-ended questions
			You should ask open-ended questions to allow the person to talk openly about how they feel.
			Example: “Can you tell me more about what you're feeling?” or “Tell me more about that.”
			
			Offer support
			After someone says they are suicidal and have a plan on how they will kill themself, you should ask them how you can support them. For example, you can ask them if they would talk to a suicide hotline or a therapist.
			Example: “How can I support you?” or “Have you considered calling a suicide hotline? They might be able to give you more help.”
			
			Never Say:
			- "It’s not that bad," "Stay positive” or "Don’t say that": Belittling or invalidating a person’s feelings is not helping them. In fact, their ability to verbally express their feelings out loud is a big step in the right direction. Feel honored that they chose you to open up to and then help them through their tough situation.
			- “I know how you feel” or “I would be devastated if you were gone”: It is impossible to know how someone else feels and insinuating that you do can be frustrating. Furthermore, these statements make the conversation about you when it should be about the other person.
			- “You have a lot to live for”: When a person is severely depressed, they aren’t in the mindset of counting their blessings. Pointing out that they have a lot to live for doesn’t help their current situation.
			- “Other people have it worse” or “You’re being selfish”: This isn’t a contest where some “deserve” the right to be depressed. When a person is struggling, what is most important is helping them with their reality, not comparing it to others.
			- “You’ll go to hell”: Even if your religion holds this belief, keep in mind that many people may not share your beliefs, nor is it a helpful deterrent to someone who is in crisis.
			`
		tokenCount += getTokens(f_prompt)

		if (tokenCount >= 4000) {
			throw new Error('Query too large')
		}

		const messages: ChatCompletionRequestMessage[] = [
			{ role: 'system', content: f_prompt },
			...f_reqMessages
		]

		const r_chatRequestOpts: CreateChatCompletionRequest = {
			model: 'gpt-3.5-turbo',
			messages,
			temperature: 0.9,
			stream: true
		}

		const r_chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
			headers: {
				Authorization: `Bearer ${OPENAI_KEY}`,
				'Content-Type': 'application/json'
			},
			method: 'POST',
			body: JSON.stringify(r_chatRequestOpts)
		})

		if (!r_chatResponse.ok) {
			const err = await r_chatResponse.json()
			throw new Error(err.error.message)
		}

		return new Response(r_chatResponse.body, {
			headers: {
				'Content-Type': 'text/event-stream'
			}
		})
	} catch (err) {
		console.error(err)
		return json({ error: 'There was an error processing your request' }, { status: 500 })
	}
}