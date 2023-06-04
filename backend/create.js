const dotenv = require('dotenv');
const fs = require("fs");
const {Client} = require('@elastic/elasticsearch');
const mysql = require("mysql");

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

elasticsearch.indices.create({
    index: 'resumes_' + (+new Date),
    aliases: {
        "resumes_new": {
            is_write_index: true
        }
    },
    mappings: {
        properties: {
            raw_data: {
                type: "text"
            },
            summary: {
                type: "text"
            },
            name: {
                type: "text"
            },
            email: {
                type: "text"
            },
            technologies: {
                type: "keyword"
            },
            experience: {
                type: "object",
                properties: {
                    company: {
                        type: "keyword",
                        fields: {
                            text: {
                                type: "text"
                            }
                        }
                    },
                    position: {
                        type: "text"
                    },
                    duration_in_months: {
                        type: "integer"
                    },
                    location: {
                        type: "text"
                    }
                }
            },
            total_experience: {
                type: "integer"
            }
        }
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

connection.query(`SELECT * FROM resume`, function (err, results) {
    if (err) throw err;

    results.forEach(function (result) {
        result.technologies = JSON.parse(result.technologies);
        result.experience = JSON.parse(result.experience);

        elasticsearch.index({
            index: 'resumes_new',
            document: result
        }).then(res => {
            console.log(res)
        }).catch(err => {
            console.error(err);
        })
    })
})
