const { Client } = require('@elastic/elasticsearch')
const client = new Client({
    node: 'http://localhost:9200',
});

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(`${__dirname}/var/database.db`);

client.indices.delete({
    index: 'resumes'
});

db.run('DROP TABLE resume');
