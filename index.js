const express = require('express');
const app = express();
require('dotenv').config('./');
const crypto = require('crypto');
const pg = require('pg');
app.set(express.urlencoded({extended: true}));
//* Required Modules

const mainPort = process.env.MAIN_SERVER_PORT || 8080; //* get app port from the config, otherwise use the default 8080
const table = process.env.USER_TABLE || 'test_table';
const pool = new pg.Pool();
// const client = new pg.Client();
async function init(pool) {
    pool.query(
        `create table if not exists ${table} (
            UUID SERIAL PRIMARY KEY,
            EMAIL TEXT NOT NULL,
            USERNAME TEXT NOT NULL
        );`
    );
}
init(pool);
app.post('/api/addUser', (req, res) =>{addUser(req, res, pool)});
app.put('/api/editUser', (req, res) =>{editUser(req, res, pool)});
app.get('/api/query', (req, res) =>{queryUsers(req, res, pool)});

app.listen(mainPort, ()=>{console.log("Server started on port:", mainPort);}); //start the server on <mainPort> from 9:7



async function addUser(req, res, pool) {
    const client = await pool.connect();
    if (req.query != null) {
        var username = req.query.username;
        var email = req.query.email;
        pool.query(`insert into ${table} (USERNAME, EMAIL) values ('${username}', '${email}')`);
        res.send(`user ${username} has been succesfully created`);
    } else if (req.query.username == null) {
        res.status(400).send(`<username> can not be blank`)
    } else if (req.query.email == null) {
        res.status(400).send(`<email> can not be blank`)
    }
    //client.release();
}

async function editUser(req, res, pool) {
    const client = await pool.connect();

    client.release();
}

async function queryUsers(req, res, pool) {
    const client = await pool.connect();

    client.release();
}