

const config = {};

config.salt_work_factor = 10;
config.db = {};
config.db.host = 'mongo'; //change it to 'localhost' if NOT using docker compose to run the app.
config.db.port = '27017';
config.db.database = 'firmwareDB';

module.exports = config;
