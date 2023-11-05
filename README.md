# Prerequisites
* install latest Node.js package from [here](https://nodejs.org/en/download/current)
* do the same for postgresql [download](https://www.postgresql.org/download/)
* set up postgres however you like but do also install PgAdmin with it and create a `Project_Test` database in it(or edit .env key `PGDATABASE` to `postgres`)
* Edit the .env found in the project's root directory to include the password of the root account postgres
* launch both programs using `node index.js` and `node history.js`
* import postman collection to postman to easily send the requests to the services or use any other suitable method of sending requests