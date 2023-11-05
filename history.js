const express = require('express');
const app = express();
require('dotenv').config('./');
const pg = require('pg');
app.set(express.urlencoded({extended: true}));
//* Required Modules

const mainPort = process.env.HISTORY_SERVER_PORT || 8081; //* get app port from the config, otherwise use the default 8081
const table = process.env.HISTORY_TABLE || 'history_table';
const pool = new pg.Pool();
// const client = new pg.Client(); //* connect a client, possibly not needed because we're using Pool from pg
async function init() {
    pool.query(
        `create table if not exists ${table} (
            Edit-Date TEXT not null,
            relevantUUID TEXT PRIMARY KEY,
            entryData TEXT NOT NULL
        );`
    );
}
init();
app.post('/api/addEntry', (req, res) =>{addEntry(req, res);});
app.get('/api/query', (req, res) =>{queryEdits(req, res);});

app.listen(mainPort, ()=>{console.log("Server started on port:", mainPort);}); //start the server on <mainPort> from 10:7

async function addEntry(req,res) {
    
}

async function queryEdits(req,res) {

}