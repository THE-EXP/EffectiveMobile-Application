const express = require('express');
const app = express();
require('dotenv').config('./');
const pg = require('pg');
app.set(express.urlencoded({extended: true}));
//* Required Modules

const mainPort = process.env.HISTORY_SERVER_PORT || 8081; //* get app port from the config, otherwise use the default 8081
const table = process.env.USER_TABLE || 'test_table';
const pool = new pg.Pool();
// const client = new pg.Client(); //* connect a client, possibly not needed because we're using Pool from pg
async function init() {
    pool.query(
        `create table if not exists ${table} (
            ID bigserial,
            relevantUUID TEXT PRIMARY KEY,
            entryData TEXT NOT NULL
        );`
    );
}
init();
app.post('/api/addEntry', (req, res) =>{res.send(`Hi!\n${req.body.hi}`)});
app.get('/api/query', (req, res) =>{query(req, res);});

app.listen(mainPort, ()=>{console.log("Server started on port:", mainPort);}); //start the server on <mainPort> from 10:7