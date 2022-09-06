//Require the Dotenv Library
const dotenv = require("dotenv").config();
//Require Path Module for the Directory
const path = require("path");
//Require File System Module for the Directory
const fs = require("fs");
//Require the Rotating File Stream Module for Logging
const rfs = require("rotating-file-stream");

//Log Directory
const logDirectory = path.join(__dirname, "../production_logs");
//Ensure Log Directory exists, if not, Create it
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
//User is accessing our Website, so, Access Log Stream
const accessLogStream = rfs.createStream("access.log", {
	interval: "1d",
	path: logDirectory,
});

//Development Environment
const development = {
	name: "development",
	asset_path: process.env.DEVELOPMENT_ASSET_PATH,
	db: process.env.DEVELOPMENT_DB,
	db_name: process.env.DEVELOPMENT_DB_NAME,
	deployment: process.env.DEVELOPMENT_DEPLOYMENT,
};

//Production Environment
const production = {
	name: "production",
	asset_path: process.env.ASSET_PATH,
	db: process.env.DB,
	db_name: process.env.DB_NAME,
	deployment: process.env.DEPLOYMENT,
};

process.env["NODE_ENV"] = "production";
console.log(process.env.NODE_ENV);

//Exporting the Environment Variables
module.exports =
	eval(process.env.NODE_ENV) == undefined
		? development
		: eval(process.env.NODE_ENV);
