const express = require('express')
const app = express()
const cors = require('cors');
const port = 3000
const dotenv = require('dotenv');
const fs = require("fs");
const {Client} = require('@elastic/elasticsearch')
const bodyParser = require("body-parser");
const mysql = require('mysql');

// load configs
    ['.env', '.env.local'].forEach((file) => {
    if (fs.existsSync(`${__dirname}/${file}`)) {
        dotenv.config({
            path: `${__dirname}/${file}`,
            override: true,
        });
    }
})

const elasticsearch = new Client({
    node: `https://${process.env.ELASTIC_HOST}`,
    auth: {
        username: process.env.ELASTIC_USER,
        password: process.env.ELASTIC_PASSWORD
    },
    tls: {
        ca: fs.readFileSync('./http_ca.crt'),
        rejectUnauthorized: false
    }
});

const connection = mysql.createConnection({
    host: process.env.DATABASE_URL,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    port: process.env.DATABASE_PORT,
    ssl: true,
    connectTimeout: 30 * 1000,
});

connection.connect();

// create database
connection.query(`
    CREATE TABLE IF NOT EXISTS resume
    (
        resume_id        INT PRIMARY KEY AUTO_INCREMENT,
        name             VARCHAR(255),
        email            VARCHAR(255),
        raw_data         TEXT,
        summary          TEXT,
        technologies     JSON,
        experience       JSON,
        total_experience INT,
        file             BLOB
    ) ENGINE = InnoDB`, function (err) {
    if (err) {
        throw err;
    }
});

// register middleware
app.use(bodyParser.json());
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
    const tags = JSON.parse(req.query.tags);
    console.log(tags);

    let query = null;

    if (tags.length) {
        query = {
            bool: {
                should: [
                    {
                        query_string: {
                            query: tags.join(' AND ')
                        }
                    },
                    {
                        terms: {
                            technologies: tags
                        }
                    }
                ]
            },
        };
    } else {
        query = {
            match_all: {},
        };
    }

    elasticsearch.search({
        index: 'resumes',
        query,
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
    connection.query(`SELECT * FROM resume WHERE resume_id = ?`, [id], function (err, results) {
        if (err) throw err;
        if (results.length === 0) {
            res.status(404);
            res.json({
                error: 'Such record is not found'
            });
            return;
        }

        const result = results[0];
        result.technologies = JSON.parse(result.technologies);
        result.experience = JSON.parse(result.experience);
        res.json(result);
    })
})

const fetchSummary = require('./openai');

app.post('/upload-resume', cors(corsOptions), function (req, res) {
    const response = fetchSummary(req.body.data);

    response.then((content) => {
            let total_experience = content.experience.reduce(function (a, b) {
                return a + parseInt(b.duration_in_months);
            }, 0)
            content.total_experience = total_experience;

            connection.query(
                'INSERT INTO resume (raw_data, name, email, summary, technologies, experience, total_experience) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [
                    req.body.data,
                    content.name,
                    content.email,
                    content.summary,
                    JSON.stringify(content.technologies),
                    JSON.stringify(content.experience),
                    total_experience,
                ],
                function (err, results, fields) {
                    if (err) throw err;
                    content.resume_id = results.insertId;

                    elasticsearch.index({
                        index: 'resumes',
                        document: content
                    }).then(res => {
                        console.log(res)
                    })

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
