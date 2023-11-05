const express = require('express');
const app = express();
const http = require('http');
require('dotenv').config('./');
const crypto = require('crypto');
const pg = require('pg');
app.set(express.urlencoded({extended: true}));
//* Required Modules

const mainPort = process.env.MAIN_SERVER_PORT || 8080; //* get app port from the config, otherwise use the default 8080
const table = process.env.USER_TABLE || 'test_table';
const pool = new pg.Pool();
// const client = new pg.Client(); //* connect a client, possibly not needed because we're using Pool from pg
async function init() {
    pool.query(
        `create table if not exists ${table} (
            ID bigserial,
            UUID TEXT,
            EMAIL TEXT NOT NULL,
            USERNAME TEXT NOT NULL,
            PRIMARY KEY (UUID)
        );`
    );
}
init();
app.post('/api/addUser', (req, res) =>{addUser(req, res)});
app.put('/api/editUser', (req, res) =>{editUser(req, res)});
app.get('/api/query', (req, res) =>{queryUsers(req, res)});

app.listen(mainPort, ()=>{console.log("Server started on port:", mainPort);}); //start the server on <mainPort> from 10:7



async function addUser(req, res) {
    const client = await pool.connect();
    if (req.query != null) {
        var username = req.query.username;
        var email = req.query.email;
        var result = await client.query(`select * from ${table} where username='${username}' or email='${email}'`);
        if (result == null) {
            var result = await client.query(`insert into ${table} (USERNAME, EMAIL, UUID) values ('${username}', '${email}', '${crypto.randomUUID()}')`);
            //http.request(); //* placeholder for history service
            res.send(`user ${username} has been succesfully created\n${JSON.stringify(result)}`);
        } else {
            res.send(`User with this username and/or email already exists!\nPlease chose another username and/or use different email address`);
        }
    } else if (req.query.username == null) {
        res.status(400).send(`<username> can not be blank!`);
    } else if (req.query.email == null) {
        res.status(400).send(`<email> can not be blank!`);
    }
    client.release();
}

async function editUser(req, res) {
    const client = await pool.connect();
    if (req.query != null) {
        var change = req.query.username;
        var new_username = req.query.new_username;
        var new_email = req.query.new_email;
        var user = await client.query(`select uuid from ${table} where username = '${change}'`);
        user = user.rows[0].uuid
        if (user == null) {
            res.send(`No user with provided username(${change}) exists!`)
        } else if (new_email != null) {
            client.query(`update ${table} set email = '${new_email}' where uuid = '${user}'`);
            res.send(`New email for user ${change} is now ${new_email}`);
        } else if (new_username != null) {
            client.query(`update ${table} set username = '${new_username}' where uuid = '${user}'`);
            res.send(`New username for user ${change} is now ${new_username}`);
        }
    }
    client.release();
}

async function queryUsers(req, res) {
    const client = await pool.connect();
    if (req.query != null) {
        var qType = req.query.queryBy
        switch (qType) {
            case 'username':
                if (req.query.username != null){
                    var result = await client.query(`select * from ${table} where username = '${req.query.username}'`);
                    res.send(JSON.stringify(result.rows));
                } else {
                    res.send(`Username expected, got <Null> instead`);
                }
                break;
            case 'email':
                if (req.query.username != null){
                    var result = await client.query(`select * from ${table} where email = '${req.query.email}'`);
                    res.send(JSON.stringify(result.rows));
                } else {
                    res.send(`Email expected, got <Null> instead`);
                }
                break;
            case 'uuid':
                if (req.query.username != null){
                    var result = await client.query(`select * from ${table} where uuid = '${req.query.uuid}'`);
                    res.send(JSON.stringify(result.rows));
                } else {
                    res.send(`UUID expected, got <Null> instead`);
                }
                break;
            default:
                res.send(`can't query by ${qType}`)
        }
    } else {
        res.send(`Null query recieved`)
    }
    client.release();
}