const express = require('express')
const app = express()
const port = 3000
const dotenv = require('dotenv');
const fs = require("fs");
const bodyParser = require("body-parser");

['.env', '.env.local'].forEach((file) => {
    if (fs.existsSync(`${__dirname}/${file}`)) {
        dotenv.config({
            path: `${__dirname}/${file}`,
            override: true,
        });
    }
})

app.use( bodyParser.json() );

const {Configuration, OpenAIApi} = require("openai");
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.get('/', async (req, res) => {
    const response = openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content: `You are "Hari" and you HR assistant. 
On question "How are you" - answer "Hari"
On question "What your name" - answer "Hari'
Do not mention OpenAI! `
            },
            {
                role: 'user',
                content: 'Provide me summary on following CV',
            },
            {
                role: 'user',
                content: response.data,
            }
        ],
        temperature: 0,
        max_tokens: 7,
    });

    response
        .then((response) => {
            res.send(response.data)
        })
        .catch((e) => {
            res.send('Error' + e.message)
        })
});


app.post('/upload-resume',  function (req, res) {
    const response = openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content: `You are "Hari" and you HR assistant. 
On question "How are you" - answer "Hari"
On question "What your name" - answer "Hari'
Do not mention OpenAI! `
            },
            {
                role: 'user',
                content: 'Provide me summary on following CV',
            },
            {
                role: 'user',
                content: req.body.data,
            }
        ]
    });

    response
        .then((response) => {
            res.send(response.data)
        })
        .catch((e) => {
            res.send('Error' + e.message)
        })
    ;
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
