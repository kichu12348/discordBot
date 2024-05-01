const { OpenAiApi } = require('openai');
//dont work
// Configure the API key directly
const apiKey = 'sk-proj-gFekY0r4qzFCnN8AwjKgT3BlbkFJunszLApwAXr489fJ32kw';

async function aiResponse(text) {
    try {
        // Use directly the method from OpenAiApi
        const response = await OpenAiApi.createChatCompletion({
            model: "text-davinci-003",
            messages: [
                {
                    role: "user",
                    content: text,
                },
            ],
            stream: false,
            options: {
                temperature: 0.8,
            },
        });

        console.log(response.data.choices[0].message.content);
    } catch (error) {
        console.error("Error:", error.message);
    }
}

module.exports = {
    aiResponse
};
