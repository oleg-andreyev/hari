const express = require('express')
const app = express()
const cors = require('cors');
const port = 3000
const dotenv = require('dotenv');
const fs = require("fs");
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(`${__dirname}/var/database.db`);
const { Client } = require('@elastic/elasticsearch')
console.log("Using Elastic: "+process.env.ELASTIC_SEARCH_HOST_PORT)
const elasticsearch = new Client({
    node: process.env.ELASTIC_SEARCH_HOST_PORT,
});

const bodyParser = require("body-parser");

// create database
db.run('CREATE TABLE IF NOT EXISTS `resume` (resume_id INTEGER PRIMARY KEY, `name` VARCHAR(255), email VARCHAR(255), raw_data TEXT, summary TEXT, technologies TEXT, experience TEXT, total_experience INTEGER)', function (err) {
    console.log(err);
});

// load configs
['.env', '.env.local'].forEach((file) => {
    if (fs.existsSync(`${__dirname}/${file}`)) {
        dotenv.config({
            path: `${__dirname}/${file}`,
            override: true,
        });
    }
})

// register middleware
app.use( bodyParser.json() );
app.use(cors())

// homepage
app.get('/', (req, res) => {
    res.send('Hari!')
});

const corsOptions = {
    origin: '*',
};

// list
app.get('/list', cors(corsOptions), function (req, res) {
    const stmt = db.prepare('SELECT * FROM resume LIMIT ?, ?');
    const page = 1;
    const limit = 10;
    const offset = page - 1;


    elasticsearch.search({
        index: 'resumes',
        query: {
            match_all: {},
            // query_string: {
            //     query: 'react AND 2 year',
            //     fuzziness: 2,
            // }
            // match: {
            //     summary: {
            //         query: 'typescript 2 years'
            //     }
            // }
        },
        size: 100
    }).then((result) => {
        let rows = [];
        result.hits.hits.forEach((hit) => {
            rows.push({
                score: hit._score,
                ...hit._source,
            })
        });

        res.json(rows);
    })
});

app.get('/resume/:id', cors(corsOptions), function (req, res) {
    const id = req.params.id;
    const stmt = db.prepare('SELECT * FROM resume WHERE resume_id = ?');
    stmt.get(id, function (err, result) {
        result.technologies = JSON.parse(result.technologies);
        result.experience = JSON.parse(result.experience);
        res.json(result);
    })
})

const fetchSummary = require('./openai');

app.post('/upload-resume', cors(corsOptions), function (req, res) {
    const response = fetchSummary(req.body.data);

    response
        .then((content) => {
            // db.run('CREATE TABLE IF NOT EXISTS `resume` (resume_id INTEGER PRIMARY KEY, `name` VARCHAR(255), email VARCHAR(255), raw_data TEXT, summary TEXT, technologies TEXT, experience TEXT)', function (err) {
            const stmt = db.prepare('INSERT INTO resume (raw_data, name, email, summary, technologies, experience, total_experience) VALUES (?, ?, ?, ?, ?, ?, ?)');
            let total_experience = content.experience.reduce(function (a, b) {
                return a + parseInt(b.duration_in_months);
            }, 0)
            content.total_experience = total_experience;

            stmt.run(
                req.body.data,
                content.name,
                content.email,
                content.summary,
                JSON.stringify(content.technologies),
                JSON.stringify(content.experience),
                total_experience,
                function () {
                    db.get('SELECT last_insert_rowid()', function (err, result) {
                        content.resume_id = result['last_insert_rowid()'];
                        elasticsearch.index({
                            index: 'resumes',
                            document: content
                        }).then(res => console.log(res))

                        res.json(content);
                    })
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
