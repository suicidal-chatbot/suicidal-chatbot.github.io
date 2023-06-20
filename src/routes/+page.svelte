<script lang="ts">
// Progress
// 1. Added capability for two chatbots appear in one page (solved routing issue)
// 2. Added feedback chatbot functionality
// 3. Added textfield sync between two chatbots
// 	* Adding id for two textfields make this possible
// 	* After sending to chatbot, the textfield will be cleared, while getting feedback doesn't.
// 4. (Implemented, not sure) Hide feedback chatbot text field
// 5. Change names in conversation history to "Patient" and "Me"
// 6. Add color coding for feedback message
// 	* Detect Yes and No and change the color of the bubble

// Plan
// 1. Add a button to switch between two prompts
// 2. Facilitate deleting previous messages
// 3. Complete recode for improved performance
// 4. More user-centered feedback interface

// Issues
// Feedback Functionality
// Observed Issues: 
//         1. Line break doesn't work
//         2. Requires a sperate input box
//		   3. Feedback message doesn't match the hugging face prototype

	import ChatMessage from '$lib/components/ChatMessage.svelte'
	import FeedbackMessage from '$lib/components/FeedbackMessage.svelte'
	import type { ChatCompletionRequestMessage } from 'openai'
	import { SSE } from 'sse.js'
	

	let query: string = ''
	let answer: string = ''
	let loading: boolean = false
	let chatMessages: ChatCompletionRequestMessage[] = []
	let scrollToDiv: HTMLDivElement

	function scrollToBottom() {
		setTimeout(function () {
			scrollToDiv.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' })
		}, 100)
	}

	// Chatbot
	const handleSubmit = async () => {
		loading = true
		chatMessages = [...chatMessages, { role: 'user', content: query }]

		const eventSource = new SSE('/api/chat', {
			headers: {
				'Content-Type': 'application/json'
			},
			payload: JSON.stringify({ messages: chatMessages})
		})

		query = ''

		eventSource.addEventListener('error', handleError)

		eventSource.addEventListener('message', (e) => {
			scrollToBottom()
			try {
				loading = false
				if (e.data === '[DONE]') {
					chatMessages = [...chatMessages, { role: 'assistant', content: answer }]
					answer = ''
					return
				}

				const completionResponse = JSON.parse(e.data)
				const [{ delta }] = completionResponse.choices

				if (delta.content) {
					answer = (answer ?? '') + delta.content
				}
			} catch (err) {
				handleError(err)
			}
		})
		eventSource.stream()
		scrollToBottom()
	}

	let f_answer: string = ''
	let f_loading: boolean = false
	let f_chatMessages: ChatCompletionRequestMessage[] = []
	let f_scrollToDiv: HTMLDivElement

	// Construct chat history from chatMessages object
	function construct_chat_history(chatMessages: ChatCompletionRequestMessage[]) {
		let history = 'Patient: Hi. I’ve had a tough time recently and I wanted to talk to someone about it. '
		for (let i in chatMessages) {
			let role =''
			if (chatMessages[i].role == 'user') {
				role = 'Me'
			} else {
				role = 'Patient: '
			}
			const content = chatMessages[i].content
			history += `${role}: ${content}\n`
		}
		return history
	}

	const f_handleSubmit = async () => {
		f_loading = true
		query = `The following is a ongoing conversation between me and my friend: ${construct_chat_history(chatMessages)}
		Here is my message that I'm planning on sending next: "${query}".
		Evaluate this message in the context of the above conversation, based on the following criterion:
		1. Acknowledge and validate their feelings: Let the person know that it's okay to be struggling and that you understand what they are going through. Example: "I'm sorry to hear that" or "It sounds like what you're experiencing is really difficult"
    	2. Ask open-ended questions: Ask the person questions that encourage them to open up about their feelings. Example: "Can you tell me more about what you're feeling?"
    	3. Reassure them: Let them know that you are there for them and that you care about them. Example: "I want you to know that I care about how you're doing and I'm here to listen"
    	4. Assess the level of suicidal ideation: Ask the person to explain the intensity of their suicidal thoughts. Ask them to describe their thoughts and feelings in detail. Example: "Have you thought about suicide?" or "Have you made any plans to follow through?"
    	5. Encourage them to connect with resources: Once the person has said they're suicidal or want to kill themself, you should ask that they get help from a mental health professional or support group. Example: "Would you be open to reaching out to someone who can help you more, like a suicide hotline?"
		If you think my message meets the above standard, start your reply with “yes”.
		If not, start your reply with “No”, then explain why my message doesn't meet the standard, and give me high-level suggestions that I can do better in my message. Be friendly and succinct (at most four sentences). Only give abstract instructions, such as “you can apply more active listening skills”, “you can encourage your friend”, etc.
		`
		f_chatMessages = [...f_chatMessages, { role: 'user', content: query }]

		const eventSource = new SSE('/api/feedback', {
			headers: {
				'Content-Type': 'application/json'
			},
			payload: JSON.stringify({ messages: f_chatMessages})
		})

		query = ''

		eventSource.addEventListener('error', f_handleError)

		eventSource.addEventListener('message', (e) => {
			scrollToBottom()
			try {
				f_loading = false
				if (e.data === '[DONE]') {
					f_chatMessages = [...f_chatMessages, { role: 'assistant', content: f_answer }]
					f_answer = ''
					return
				}

				const completionResponse = JSON.parse(e.data)
				const [{ delta }] = completionResponse.choices

				if (delta.content) {
					f_answer = (f_answer ?? '') + delta.content
				}
			} catch (err) {
				f_handleError(err)
			}
		})
		eventSource.stream()
		scrollToBottom()
	}


	function handleError<T>(err: T) {
		loading = false
		query = ''
		answer = ''
		console.error(err)
	}

	function f_handleError<T>(err: T) {
		f_loading = false
		query = ''
		f_answer = ''
		console.error(err)
	}
</script>

<body class="background">
<!-- Hint panel -->
<div class="flex">
	<div class="flex flex-col pt-4 w-[500px] px-8 gap-2 my-8 -ml-64">
		<h1 class="text-2xl font-bold w-full">Conversation Hints</h1>
		<p class="text-sm">Use these templates for inspirations of your conversation</p>
		<div class="flex flex-col p-8 bg-white rounded-md my-8 gap-2">
			<h2 class="text-xl">&#128161 Reflection</h2>
			<p>I am hearing you &#x5B member's words &#93 and &#x5B member's words &#93</p>
			<h2 class="text-xl">&#128161 Labeling Emotions</h2>
			<p>It sounds like you are feeling &#x5B feeling &#93 about &#x5B topic &#93</p>
			<h2 class="text-xl">&#128161 Asking questions</h2>
			<p>How would you like &#x5B person &#93 to respond?</p>
			<p>What is the most important thing you want &#x5B person &#93 to understand?</p>
			<p>What needs to change?</p>
			<p>What do you like about this situation?</p>
			<p>What is the worst case scenario?</p>
			<h2 class="text-xl">&#128161 Empathy</h2>
			<p>I can see why you are feeling &#x5B feeling &#93, I would feel &#x5B feeling &#93 too.</p>
			<p>I would be asking the same question you are.</p>
			<h2 class="text-xl">&#128161 Lived Experience</h2>
			<h2 class="text-xl">Listener Support</h2>
		</div>
	</div>
<!-- Conversation panel -->
<div class="flex flex-col pt-4 w-[500px] px-8 bg-white rounded-md my-8 gap-2">
	<div class="flex flex-col pt-4 w-[400px] gap-2">
		<h1 class="text-2xl font-bold w-full">Patient Chatbot</h1>
		<p class="text-sm">Chat with it to help it out</p>
	</div>
	<div class="h-[600px] w-full rounded-md p-4 overflow-y-auto flex flex-col gap-4">
		<div class="flex flex-col gap-2">
			<ChatMessage type="assistant" message="Hi. I’ve had a tough time recently and I wanted to talk to someone about it." />
			{#each chatMessages as message}
				<ChatMessage type={message.role} message={message.content} />
			{/each}
			{#if answer}
				<ChatMessage type="assistant" message={answer} />
			{/if}
			{#if loading}
				<ChatMessage type="assistant" message="Loading.." />
			{/if}
		</div>
		<div class="" bind:this={scrollToDiv} />
	</div>
	<form
		class="flex w-full rounded-md gap-4 p-4"
		on:submit|preventDefault={() => handleSubmit()}
	>
		<input type="text" id="chatbot_input" class="input input-bordered w-full" bind:value={query} />
		<button type="submit" class="btn bg-green-500"> Send </button>
	</form>
</div>
<!-- Feedback panel -->
<div class="flex flex-col w-[300px] px-8">
	<div class="flex flex-col pt-4 w-[500px] px-8 bg-white rounded-md my-8 gap-2">
		<div class="flex flex-col pt-4 w-[400px] gap-2">
			<h1 class="text-2xl font-bold w-full">Feedback</h1>
			<p class="text-sm">Improve your counseling with feedback</p>
		</div>
		<div class="h-[600px] w-full rounded-md p-4 overflow-y-auto flex flex-col gap-4">
			<div class="flex flex-col gap-2">
				{#each f_chatMessages as message}
					<!-- User message for testing, comment out in demo -->
					<!-- {#if message.role === 'user'}
						<FeedbackMessage type={message.role} message={message.content} />
					{/if} -->
					<!-- Above is user message for testing -->
					{#if message.role === 'assistant'}
						<FeedbackMessage type={message.role} message={message.content} />
					{/if}
				{/each}
				{#if f_answer}
					<FeedbackMessage type="assistant" message={f_answer} />
				{/if}
				{#if f_loading}
					<FeedbackMessage type="assistant" message="Loading.." />
				{/if}
			</div>
			<div class="" bind:this={f_scrollToDiv} />
		</div>
		<form
			class="flex w-full rounded-md gap-4 p-4"
			on:submit|preventDefault={() => f_handleSubmit()}
		>
			<input type="text" id="feedback_input" class="input input-bordered w-full" bind:value={query} />
			<button type="submit" class="btn bg-blue-500"> Get feedback </button>
		</form>
	</div>
</div>
</div>
</body>

<style>
	.background {
		background-color: rgb(245, 245, 245);
	}

	/* Feedback input box hide code */
	/* #feedback_input {
		display: none;
	} */
</style>

