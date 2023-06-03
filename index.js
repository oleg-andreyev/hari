
const openai = require('openai')
const express = require('express')
const app = express()
const port = 3000

const configuration = new openai.Configuration({
    organization: "YOUR_ORG_ID",
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new openai.OpenAIApi (configuration);
const response = await openai.listEngines();

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
