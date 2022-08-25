//Require Express Module for running the Express Server
const express = require("express");
//Create Express App for Request-Response Cycle & to create the Express Server
const app = express();
//Create Express Server Port
const port = process.env.PORT || 8000;
//Require the CORS Module for allowing Cross-Origin Requests
const cors = require("cors");
//Requires Express-EJS-Layouts Module
const expressLayouts = require("express-ejs-layouts");
//Require the Environment File for getting the Environment Variables
const env = require("./config/environment");
//Requires MongoDB
const db = require("./config/mongoose");
//Requires the index.js - Main Index Route File, from the Routes Folder.
const routes = require("./routes/index");

//Use the CORS Module
app.use(cors());
//Use the Express JSON Parser
app.use(express.json());
//Use the Express URL Encoded Parser
app.use(express.urlencoded({ extended: true }));
//Use the Routes Module
app.use("/", routes);

//Start the Express Server
app.listen(port, (err) => {
	if (err) {
		console.log(err);
		return;
	} else {
		console.log(`Server is running successfully on port ${port}`);
	}
});
