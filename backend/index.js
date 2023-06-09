const express = require('express')
const app = express()
const cors = require('cors');
const port = process.env.PORT || 3000;
const dotenv = require('dotenv');
const fs = require("fs");
const {Client} = require('@elastic/elasticsearch')
const bodyParser = require("body-parser");
const mysql = require('mysql');
const multer = require('multer');
const {GetTextFromPDF} = require('./pdfToText');

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
        file             MEDIUMBLOB
    ) ENGINE = InnoDB`, function (err) {
    if (err) {
        throw err;
    }
});

// register middleware
app.use(bodyParser.json());
app.use(cors())

// homepage
app.get('/api', (req, res) => {
    res.send('Hari!')
});

const corsOptions = {
    origin: '*',
};

// list
const indexName = 'resumes_new';
app.get('/api/list', cors(corsOptions), function (req, res) {
    console.log(req.query);

    let tags = req.query.tags ? JSON.parse(req.query.tags) : [];
    // normalize tags
    tags = tags.map((tag) => tag.toLowerCase());

    let companies = req.query.companies ? JSON.parse(req.query.companies) : [];

    // normalize companies
    companies = companies.map((company) => company.trim());

    let exp_min = null;
    let exp_max = null;

    if (req.query.exp) {
        [exp_min, exp_max] = req.query.exp.split('-').map(v => parseInt(v));
    }

    let query = {};

    if (tags.length || companies.length || (exp_min || exp_max)) {
        if (tags.length) {
            query['bool'] = {}
            query['bool']['should'] = [];
            query['bool']['should'].push({
                    query_string: {
                        query: tags.join(' AND ')
                    }
                });
            query['bool']['should'].push({
                terms: {
                    technologies: tags
                }
            });
        }

        if (companies.length) {
            query['bool'] = query['bool'] || {}
            query['bool']['must'] = query['bool']['must'] || [];
            query['bool']['must'].push({
                "query_string": {
                    "query": `*${companies.join('* OR *')}*`,
                    "default_field": "experience.company",
                    "fuzziness": 2
                }
            })
        }

        if (exp_min || exp_max) {
            query['bool'] = query['bool'] || {}
            query['bool']['must'] = query['bool']['must'] || [];
            const range = {
                range: {
                    total_experience: {}
                }
            };

            if (exp_min > -1) {
                range['range']['total_experience']['gte'] = exp_min;
            }

            if (exp_max) {
                range['range']['total_experience']['lte'] = exp_max;
            }

            query['bool']['must'].push(range)
        }
    } else {
        query = {
            match_all: {},
        };
    }


    let aggs = {
        companies: {
            terms: {
                field: "experience.company"
            }
        }
    };

    elasticsearch.search({
        index: indexName,
        query: query,
        aggs: aggs,
        size: 100
    }).then((result) => {
        let rows = [];
        result.hits.hits.forEach((hit) => {
            rows.push({
                score: hit._score,
                ...hit._source,
            })
        });

        res.json({
            rows,
            companies: result.aggregations['companies'].buckets
        });
    })
});

app.get('/api/resume/:id', cors(corsOptions), function (req, res) {
    const id = req.params.id;
    connection.query(`SELECT *
                      FROM resume
                      WHERE resume_id = ?`, [id], function (err, results) {
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

app.post('/api/upload-resume', cors(corsOptions), function (req, res) {
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
                    index: indexName,
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
        });
});


// Set up the storage configuration for multer
const storage = multer.memoryStorage();
// Set up the multer middleware with the storage configuration
const upload = multer({storage: storage});

app.post('/api/upload-files', cors(corsOptions), upload.array('data'), async function (req, res) {

    if (!req.files || req.files.length === 0) {
        return res.status(400).send('No files uploaded.');
    }

    const promises = req.files.map((file) => {
        return new Promise(async (resolve, reject) => {
            const fileStream = file.buffer;
            let text;

            //extract textfrom PDF
            try {
                text = await GetTextFromPDF(fileStream);
                console.log('PDF text:', text);
                // Process the extracted text as needed
            } catch (error) {
                console.error('Error extracting text from PDF:', error);
                reject(error);
                return;
            }

            //send to Gipity
            const response = fetchSummary(text);

            response.then((content) => {
                content.total_experience = content.experience.reduce(function (a, b) {
                    return a + parseInt(b.duration_in_months);
                }, 0);

                connection.query(
                    'INSERT INTO resume (raw_data, name, email, summary, technologies, experience, total_experience, file) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [
                        text,
                        content.name,
                        content.email,
                        content.summary,
                        JSON.stringify(content.technologies),
                        JSON.stringify(content.experience),
                        content.experience.reduce(function (a, b) {
                            return a + parseInt(b.duration_in_months);
                        }, 0),
                        fileStream
                    ],
                    function (err, results, fields) {
                        if (err) throw err;
                        content.resume_id = results.insertId;

                        elasticsearch.index({
                            index: indexName,
                            document: content
                        }).then(result => {
                            console.log(result)
                            resolve();
                        });
                    }
                );
            })
        })
    })

    Promise.all(promises).then(() => {
        res.send('Success');
    }).catch((e) => {
        res.status(400);
        res.send('Error '+e.message);
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
