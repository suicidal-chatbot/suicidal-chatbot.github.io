# suicidal-chatbot.github.io

## Project description

This project aims to prototype a chatbot that simulates a suicidal person seeking support.

## How to use it

Enter "pnpm i && pnpm run dev"

## Versions

### v1.0

This version outlines the basic structure of the webapp, including the two chatbots (one for conversation, another for feedback) and some additional features.

1. Added capability for two chatbots appear in one page (solved routing issue)
2. Added feedback chatbot functionality
3. Added textfield sync between two chatbots
    Adding id for two textfields make this possible
    After sending to chatbot, the textfield will be cleared, while getting feedback doesn't.
4. (Implemented, not sure) Hide feedback chatbot text field
5. Change names in conversation history to "Patient" and "Me"
6. Add color coding for feedback message
    Detect Yes and No and change the color of the bubble

### v1.1

This version added removing messages from conversation, a core functionality to facilitate training.

1. Implemented functionality to delete previous messages

### v1.2

1. Overall visual improvements and removal of unecessary elements

### v1.3

This version contains a number of major functionality and visual changes to improve user experience and expand scope of the web app.

1. Loop through each criteria
2. Associated issue: message mixing up
3. Add a second starting message (same as hugging face)
4. Change all prompts to be the same as chatbot 1 and 2 in the hugging face.
5. Fill the interface in one page.
6. Two sidebars should be smaller, allow collapsing
7. And then have a separate button to delete previous 2 messages (last user and assistant messages)
8. Remove delete pop up
9. Remove user and patient heading, avatar for message
10. Press enter to send message rather than send button
11. Associated issue: communicate pressing enter to send
12. Remove input suggestions/autofill (see if it’s a chrome feature)
13. Change advice text / header to be the same as hugging face
14. Change advice background (so it’s vertically aligned with the other sidebar / chatbot windows)
15. Look into whether start messages is successfully implemented
16. Add a toggle / accordion sidebar underneath the advice (left-hand) sidebar to show the system prompt and allow users to edit the system prompt.

## How to use it

## Acknowledgements
