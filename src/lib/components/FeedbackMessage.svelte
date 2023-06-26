<script lang="ts">
	import type { ChatCompletionRequestMessageRoleEnum } from 'openai'
	export let type: ChatCompletionRequestMessageRoleEnum
	export let message: string
</script>

<div class="chat {type === 'user' ? 'chat-end' : 'chat-start'} justify-end">
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