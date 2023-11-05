const express = require('express');
const app = express();
require('dotenv').config('./');
const pg = require('pg');
app.set(express.urlencoded({extended: true}));
app.use(express.json());
//* Required Modules

const mainPort = process.env.HISTORY_SERVER_PORT || 8081; //* get app port from the config, otherwise use the default 8081
const table = process.env.HISTORY_TABLE || 'history_table';
const pool = new pg.Pool();
// const client = new pg.Client(); //* connect a client, possibly not needed because we're using Pool from pg
async function init() {
  pool.query(
    `create table if not exists ${table} (
      EventDate TEXT not null,
      relevantUUID TEXT not null,
      entryData TEXT not null
    );`
  );
}
init();
app.post('/api/addEntry', (req, res) =>{addEntry(req, res);});
app.get('/api/query', (req, res) =>{queryEdits(req, res);});

app.listen(mainPort, ()=>{console.log("Server started on port:", mainPort);}); //start the server on <mainPort> from 10:7

async function addEntry(req,res) {
  const client = await pool.connect();
  if(req.body != null) {
    switch(req.body.action) {
      case 'CREATE USER':
        client.query(`insert into ${table} (relevantUUID,EventDate,entryData) values ('${req.body.UUID}','${Date.now()}','${req.body.action + ' with username: ' + req.body.username + ' and email: ' + req.body.email}')`);
				console.log(`Adding CREATE event for user ${req.body.UUID}`);
        res.send('OK');
        break;
      case 'EDIT USERNAME':
        client.query(`insert into ${table} (relevantUUID,EventDate,entryData) values ('${req.body.UUID}','${Date.now()}','${req.body.action + ' ' + req.body.old_username + ' -> ' + req.body.new_username}')`);
				console.log(`Adding EDIT event for user ${req.body.UUID}`);
        res.send('OK');
        break;
      case 'EDIT EMAIL':
        client.query(`insert into ${table} (relevantUUID,EventDate,entryData) values ('${req.body.UUID}','${Date.now()}','${req.body.action + ' ' + req.body.old_email + ' -> ' + req.body.new_email}')`);
				console.log(`Adding EDIT event for user ${req.body.UUID}`);
				res.send('OK');
        break;
			case 'EDIT BOTH':
				client.query(`insert into ${table} (relevantUUID,EventDate,entryData) values ('${req.body.UUID}','${Date.now()}','${req.body.action + ' ' + req.body.old_email + ' -> ' + req.body.new_email}, ${req.body.old_username + ' -> ' + req.body.new_username}')`);
				console.log(`Adding EDIT event for user ${req.body.UUID}`);
				res.send('OK');
        break;
      default:
        res.send('OK');
				break;
    }
  client.release();
  }
}

async function queryEdits(req,res) {
  const client = await pool.connect();
  if (req.query.uuid != null) {
		var edits = await client.query(`select * from ${table} where uuid = ${req.query.uuid}`);
		res.json(JSON.stringify(edits.rows));
  } else {
		var edits = await client.query(`select * from ${table}`);
		res.json(edits.rows);
	}
  client.release();
}