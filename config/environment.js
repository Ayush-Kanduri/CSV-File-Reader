//Require the Dotenv Library
const dotenv = require("dotenv").config();

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

//Exporting the Environment Variables
module.exports =
	eval(process.env.NODE_ENV) == undefined
		? development
		: eval(process.env.NODE_ENV);
