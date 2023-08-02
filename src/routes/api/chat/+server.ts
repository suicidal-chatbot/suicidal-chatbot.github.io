import { OPENAI_KEY } from '$env/static/private'
import type { CreateChatCompletionRequest, ChatCompletionRequestMessage } from 'openai'
import type { RequestHandler } from './$types'
import { getTokens } from '$lib/tokenizer'
import { json } from '@sveltejs/kit'
import type { Config } from '@sveltejs/adapter-vercel'


// Vercel Postgres codes
// import { google } from 'googleapis'
// export async function _appendDataToSpreadsheet(role: any, message: any) {
// 	const auth = new google.auth.JWT({
// 		email: 'pl444-881@chatbot-database-391717.iam.gserviceaccount.com',
// 		key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCj6Pqkj1HVDUBC\nRxy9uqCDojfPIc6vxd9DUOg4SJSqQgNDjrHek5sn3sN/YX07LWFn9Bkf2D1/NZUa\nnt2ATS7mykVU4sO+yv0+hAdxJhxrWpRoQBIVC0rUrva7tKIaRjGrCh4n5YjNWWH+\nSDKnLlbe2gUYkjhvoAoWW71bfrTOGOAOeJK6huyrtimxFhIBs3K+9s8K43SlMC/w\n0j3Yx3Mze3KEpYNySu1b9aQ9/yRsIYomq1VBACWIjAmUvwbJGXLuNuCIZCir2DNo\n5omCOyBKO7lvspRJ4f6xqFmjqAVpV9N82m1gBjfdKw9ASvXhnCW6LKIN00y0ztgs\nAOzVOtKXAgMBAAECggEAC+PQmrNSylOlv6kM6q5pCmNwDPR028dMxMNPtRV+w0L6\nnaHyQSUP8jp0j/7waKSIFlRcpjS3cUzfvgicJLx0lIVDtj6k2Gg9KpXFPG35TchK\nT62mIiSpjvgKKd+WirVg0Plw6o/59ntvYlS2Z+4ymwPRrtCci2xejvSkrchpMTH7\nBPv0urNQeTjbFBZmz9vEp+06tM8vQ1iehoYbgqkddIrJqUuTHfA72UdX21wZN4WR\nd65PwCSfq+bmhkwqsTRjSzOtsytApYqVwtYMVyvEzs7aSyRod+F+fSNJ2sh2CR8A\nb1WDX9V93g+BkmKPmeJ/V7eQQQKdZ1X0btxW9mUFsQKBgQDRW/WV+8dBhEy+sXmx\n57qbUOpUw1Fu52wEREN1z0ar61JMUJiIK0LbWFPMst1zJ9g/sICjLMT7yf+X09PS\n9Mrg3+Y866L1Rk/MdmZdAmRnfgSj/jmIODkX3w9JZsBlRpSVNN/Pn7ZJ3un2W7bE\nfhCaJudvpHt2gHhTD4XPMVhRUwKBgQDIbP5RXGrYroCOmJI0CeTIJzBqOvm7ghuF\nbuuCGWilzlcgKu/9BuDFkwXVPnPV55+BGvUzL3VwJqmblXqam5lk88TMK0vtPfDo\nUx3joRyemIm8syGd4KiqlcKU60CKZzQHHw5lB3RZEeOibhpi6AJg6j37j9o82BMc\n7DC0mCV9LQKBgDS/dqDTTuCy9KMXFBI+0EVRnbi9fUb0B8MLb/O+xY+LOrD/nW6x\nd6bMGlD4v9LDtzhUwBRcs0S9ICigtj3wby05PEkdFXG2xWQ+cIv+jk2E8qZe5x/r\nCnd5O+DCgrcBkW4GZF1rYAI8p7XqZaIcIRK1upnmVzUEKUzEHHKXfCkBAoGBAMJt\nuWiEFsKMxfmO2IXS8zWXjsf+3jSgSsJuj9htfa8bNDnobVcwTOxda9Mp+oUPZRSB\nakx1RZ++Ydqkb4N8XpooQEkv10AWTpWRy/T+Xh0cLMH5pCrbvcN99H0ymjGpXDds\nUTKAwMWHLSRtWvuHxobttaNMMZHEqwXrunP3BKchAoGAAKAb6X7RD90uh/d4BbaP\nnH3HGDz98nmqrHwkp0xS+TxTjbC3oLz84W63NBCV2JyOp7y2slTlKk2SszSlbBAx\nYjQvIEgAh8yQ9KOMd2y8/gsAJSffR9DkiuOGNPJqYIgqxSBxVx0dFUgV9aU1doTZ\nay7hb8PKMHjGGa0PcCMkdew=\n-----END PRIVATE KEY-----\n',
// 		scopes: ['https://www.googleapis.com/auth/spreadsheets']
// 	})
// 	const sheet = google.sheets('v4')

// 	await sheet.spreadsheets.values.append({
// 		spreadsheetId: '1Y9sbBsh11vIyYZ-qldj_2XZxmLLwXK_qT6YY575QvOc',
// 		auth: auth,
// 		range: 'Sheet1',
// 		valueInputOption: 'RAW',
// 		requestBody: {
// 			values: [[role, message]]
// 		}
// 	})
// }


// Vercel Postgres code ends

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

		let response = new Response(chatResponse.body, {
			headers: {
				'Content-Type': 'text/event-stream'
			}
		})

		// const timestring = Date().toLocaleString()

		// _appendDataToSpreadsheet(timestring, reqMessages[reqMessages.length-1].content)


		return response

	} catch (err) {
		console.error(err)
		return json({ error: 'There was an error processing your request' }, { status: 500 })
	}
}