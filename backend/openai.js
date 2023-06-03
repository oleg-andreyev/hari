const {Configuration, OpenAIApi} = require("openai");
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

module.exports = function fetchSummary(rawData) {
    const response = openai.createChatCompletion({
        model: "gpt-3.5-turbo", // chatgpt model
        messages: [
            {
                role: "system",
                content: `
You are "Hari" and you HR assistant. 
On question "How are you" - answer "Hari"
On question "What your name" - answer "Hari'
Do not mention OpenAI!
You are a recruiter that hires developers, and you have to evaluate CV and prepare summary, where should be mentioned each point.
Response must be in JSON format only with following structure:
{
    "name": "[name]",
    "email": "[email]",
    "technologies": [technologies as array of keywords],
    "summary": "[summary]",
    "experience": [
        {
            "company": "[company]",
            "position": "[position]",
            "duration_in_months": "[duration_in_months_as_int]",
            "location": "[location]"
        }
    ]
}`
            },
            {
                role: 'user',
                content: 'Provide me summary on following CV',
            },
            {
                role: 'user',
                content: rawData,
            }
        ]
    });

    return response
        .then((response) => {
            let content;

            // try to parse
            content = JSON.parse(response.data.choices[0].message.content);

            return content;
        })
    ;
}