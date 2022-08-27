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
//Requires the Node SASS Middleware Module
const sassMiddleware = require("node-sass-middleware");
//Require Path Module for the Directory
const path = require("path");
//Require File System Module for the Directory
const fs = require("fs");
//Require the Environment File for getting the Environment Variables
const env = require("./config/environment");
//Requires the Custom Middleware
const customMiddleware = require("./config/middleware");
//Require the View Helpers
const viewHelpers = require("./config/view-helpers")(app);
//Requires MongoDB
const db = require("./config/mongoose");
//Requires the index.js - Main Index Route File, from the Routes Folder.
const routes = require("./routes/index");

//Use the CORS Module
app.use(cors());
//We have to put SASS just before the server is starting, because the files should be pre-compiled before the server starts. Whenever templates/browser ask for it, these pre-compiled files will be served.
//Middleware - SASS Middleware
//SASS Middleware should only Run in Development Mode
if (env.name == "development") {
	app.use(
		sassMiddleware({
			//Where to look for the SASS files
			src: path.join(__dirname, env.asset_path, "scss"),
			//Where to put the compiled CSS files
			dest: path.join(__dirname, env.asset_path, "css"),
			//Reports error. If in production mode, set as false.
			// debug: true,
			debug: false,
			//The code should be in a single line - "compressed" or multiple lines - "expanded"
			outputStyle: "extended",
			//Prefix for the CSS files - where to look out for the css files in the assets folder
			prefix: "/css",
		})
	);
}
//Use the Express JSON Parser
app.use(express.json());
//Use the Express URL Encoded Parser
app.use(express.urlencoded({ extended: true }));
//Middleware - Express App uses Static Files in the Assets Folder
app.use(express.static(env.asset_path));
//Middleware - Make the 'uploads' path available to the browser
app.use("/uploads", express.static(__dirname + "/uploads"));
//Middleware - Make the 'server_storage' path available to the browser
app.use("/server_storage", express.static(__dirname + "/server_storage"));
//Middleware - Express App uses expressLayouts to tell the App that the Views which are going to be rendered belongs to some layout or uses Partials-Layouts.
app.use(expressLayouts);

//Set Up - Extract Styles and Scripts from Sub Pages into the Layout.
app.set("layout extractStyles", true);
//Set Up - Extract Styles and Scripts from Sub Pages into the Layout.
app.set("layout extractScripts", true);
//Set Up - Template Engine as EJS
app.set("view engine", "ejs");
//Set Up - Template Engine Views Folder Path (..../views)
app.set("views", path.join(__dirname, "views"));

//Middleware - Creates Server Storage Folder & Sub Folders, if not exists
app.use(customMiddleware.createServerStorage);
//Middleware - Creates Uploads Folder & Sub Folders, if not exists
app.use(customMiddleware.createUploads);
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
