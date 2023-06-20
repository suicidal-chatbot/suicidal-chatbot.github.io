<script lang="ts">
	import type { ChatCompletionRequestMessageRoleEnum } from 'openai'
	export let type: ChatCompletionRequestMessageRoleEnum
	export let message: string
</script>

<div class="chat {type === 'user' ? 'chat-end' : 'chat-start'} justify-end">
	<div class="chat-image avatar">
		<div class="w-10 rounded-full">
			<img
				src="https://ui-avatars.com/api/?name={type === 'user' ? 'Me' : 'F'}"
				alt="{type} avatar"
			/>
		</div>
	</div>
	<div class="chat-header">
		{type === 'user' ? 'Me' : 'Feedback'}
	</div>
	<!-- <div class="chat-bubble {type === 'user' ? 'bg-green-600' : 'bg-blue-600'}">
		{message}
	</div> -->
	<div class="chat-bubble {message.slice(0,3) === 'Yes' ? 'color_coding1' : 'color_coding2'}">
		{message}
	</div>
</div>

<style>
.color_coding1 {
	background-color: rgb(0, 121, 10);
}

.color_coding2 {
	background-color: rgb(137, 0, 0);
}
</style>