const { Client } = require('@elastic/elasticsearch')
const client = new Client({
    node: 'http://localhost:9200',
});

const mysql = require('mysql');
const connection = mysql.createConnection({
    host: process.env.DATABASE_URL,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    port: process.env.DATABASE_PORT,
    ssl: true,
    connectTimeout: 30*1000,
});

connection.connect();

client.indices.delete({
    index: 'resumes'
});

connection.query('DROP TABLE resume');
