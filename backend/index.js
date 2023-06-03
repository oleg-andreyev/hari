const express = require('express')
const app = express()
var cors = require('cors')
const port = 3000
const dotenv = require('dotenv');
const fs = require("fs");
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(`${__dirname}/var/database.db`);


const bodyParser = require("body-parser");

db.run('CREATE TABLE IF NOT EXISTS `resume` (resume_id INTEGER PRIMARY KEY, `name` VARCHAR(255), email VARCHAR(255), raw_data TEXT, summary TEXT, technologies TEXT, experience TEXT)', function (err) {
    console.log(err);
});

['.env', '.env.local'].forEach((file) => {
    if (fs.existsSync(`${__dirname}/${file}`)) {
        dotenv.config({
            path: `${__dirname}/${file}`,
            override: true,
        });
    }
})

app.use( bodyParser.json() );
app.use(cors())

const {Configuration, OpenAIApi} = require("openai");
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.get('/', (req, res) => {
    res.send('Heri!')
});

const corsOptions = {
    origin: '*',
};

app.get('/list', cors(corsOptions), function (req, res) {
    const stmt = db.prepare('SELECT * FROM resume LIMIT ?, ?');
    const page = 1;
    const limit = 10;
    const offset = page - 1;

    stmt.all(page, limit, function (err, rows) {
        rows = [].concat(rows).map(function (row) {
            row.technologies = JSON.parse(row.technologies)
            row.experience = JSON.parse(row.experience)

            return row;
        })

        res.json(rows);
    })
})

app.post('/upload-resume', cors(corsOptions), function (req, res) {
    const response = openai.createChatCompletion({
        model: "gpt-3.5-turbo-0301", // chatgpt model
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
            "company": "[company1]",
            "position": "[position1]",
            "duration": "[duration_in_months1]",
            "location": "[location1]"
        },
        {
            "company": "[company2]",
            "position": "[position2]",
            "duration": "[duration_in_months2]",
            "location": "[location2]"
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
                content: req.body.data,
            }
        ]
    });

    response
        .then((response) => {
            let content;
            try {
                content = JSON.parse(response.data.choices[0].message.content);
            } catch (e) {
                res.json(
                    {
                        error: e.message,
                        text: response.data.choices[0].message.content,
                    }
                )
            }
            // db.run('CREATE TABLE IF NOT EXISTS `resume` (resume_id INTEGER PRIMARY KEY, `name` VARCHAR(255), email VARCHAR(255), raw_data TEXT, summary TEXT, technologies TEXT, experience TEXT)', function (err) {
            const stmt = db.prepare('INSERT INTO resume (raw_data, name, email, summary, technologies, experience) VALUES (?, ?, ?, ?, ?, ?)');
            stmt.run(
                req.body.data,
                content.name,
                content.email,
                content.summary,
                JSON.stringify(content.technologies),
                JSON.stringify(content.experience),
                function () {
                    res.json(content);
                }
            );
        })
        .catch((e) => {
            res.json({
                error: 'Error' + e.message
            })
        })
    ;
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
