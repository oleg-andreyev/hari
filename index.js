
const openai = require('openai')
const express = require('express')
const app = express()
const port = 3000
const dotenv = require('dotenv');
const fs = require("fs");

['.env', '.env.local'].forEach((file) => {
    if (fs.existsSync(file)) {
        dotenv.config({
            path: `${__dirname}/${file}`,
            override: true,
        });
    }
})

app.get('/', async (req, res) => {
    const {Configuration, OpenAIApi} = require("openai");
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    const response = openai.createCompletion({
        model: "text-davinci-003",
        prompt: "Say this is a test",
        temperature: 0,
        max_tokens: 7,
    });

    response
        .then((response) => {
            res.send(response.data)
        })
        .catch((e) => {
            res.send('Error'+e.message)
        })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
