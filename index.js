const express = require('express');
const app = express();
const axios = require('axios'); //* currently easy to use and test, changing to MQTT exchange might be more foolproof and secure than current design
require('dotenv').config('./');
const crypto = require('crypto');
const pg = require('pg');
app.set(express.urlencoded({extended: true}));
app.use(express.json());
//* Required Modules

const mainPort = process.env.MAIN_SERVER_PORT || 8080; //* get app port from the config, otherwise use the default 8080
const table = process.env.USER_TABLE || 'test_table';
const pool = new pg.Pool();
// const client = new pg.Client(); //* connect a client, possibly not needed because we're using Pool from pg
async function init() {
  pool.query(
    `create table if not exists ${table} (
      UUID TEXT,
      USERNAME TEXT NOT NULL,
      EMAIL TEXT NOT NULL,
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
		var randomUUID = crypto.randomUUID();
    console.log(username, email, randomUUID);
    var result = await client.query(`select * from ${table} where username='${username}' or email='${email}'`);
    if (result.rows[0] == null) {
      var result = await client.query(`insert into ${table} (USERNAME, EMAIL, UUID) values ('${username}', '${email}', '${randomUUID}')`);
			console.log(await axios.request({
				method: 'POST',
				baseURL: 'http://localhost:8081/api/',
				url: `/addEntry`,
				data: {
					UUID: randomUUID,
					action: 'CREATE USER',
					username: username,
					email: email
				}
			}).then((response) => {console.log(JSON.stringify(response.data))}).catch((err) =>{if(err){console.error(err);}}));
      res.send(`user ${username} has been succesfully created\nUser's UUID is ${randomUUID}`);
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
    var user = await client.query(`select * from ${table} where username = '${change}'`);
    if (user == null) {
      res.send(`No user with provided username(${change}) exists!`)
    } else if (new_username != null && new_email != null){
      client.query(`update ${table} set username = '${new_username}', email = '${new_email}' where uuid = '${user.rows[0].uuid}'`);
      console.log(await axios.request({
				method: 'POST',
				baseURL: 'http://localhost:8081/api/',
				url: `/addEntry`,
				data: {
					UUID: user.rows[0].uuid,
					action: 'EDIT BOTH',
          old_email: user.rows[0].email,
          new_email: new_email,
					old_username: user.rows[0].username,
          new_username: new_username
				}
			}).then((response) => {console.log(JSON.stringify(response.data))}).catch((err) =>{if(err){console.error(err);}}));
      res.send(`New username for user ${change} is now ${new_username}, and new email is ${new_email}`);
    } else if (new_username == null) {
      client.query(`update ${table} set email = '${new_email}' where uuid = '${user.rows[0].uuid}'`);
      console.log(await axios.request({
				method: 'POST',
				baseURL: 'http://localhost:8081/api/',
				url: `/addEntry`,
				data: {
					UUID: user.rows[0].uuid,
					action: 'EDIT EMAIL',
					old_email: user.rows[0].email,
          new_email: new_email
				}
			}).then((response) => {console.log(JSON.stringify(response.data))}).catch((err) =>{if(err){console.error(err);}}));
      res.send(`New email for user ${change} is now ${new_email}`);
    } else if (new_email == null) {
      client.query(`update ${table} set username = '${new_username}' where uuid = '${user.rows[0].uuid}'`);
      console.log(await axios.request({
				method: 'POST',
				baseURL: 'http://localhost:8081/api/',
				url: `/addEntry`,
				data: {
					UUID: user.rows[0].uuid,
					action: 'EDIT USERNAME',
					old_username: user.rows[0].username,
          new_username: new_username
				}
			}).then((response) => {console.log(JSON.stringify(response.data))}).catch((err) =>{if(err){console.error(err);}}));
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
          res.json(result.rows);
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
          res.json(result.rows);
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