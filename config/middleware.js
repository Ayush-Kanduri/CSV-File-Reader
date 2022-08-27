const path = require("path");
const fs = require("fs");

//Create Uploads Folder if it doesn't exist
module.exports.createUploads = async (req, res, next) => {
	try {
		let directory = path.join(__dirname, "..", "/uploads");
		if (!fs.existsSync(directory)) fs.mkdirSync(directory);
		directory = path.join(__dirname, "..", "/uploads/files");
		if (!fs.existsSync(directory)) fs.mkdirSync(directory);
	} catch (error) {
		console.log(error);
	}
	next();
};

//Create Server Storage Folder if it doesn't exist
module.exports.createServerStorage = async (req, res, next) => {
	try {
		let directory = path.join(__dirname, "..", "/server_storage");
		if (!fs.existsSync(directory)) fs.mkdirSync(directory);
		directory = path.join(__dirname, "..", "/server_storage/images");
		if (!fs.existsSync(directory)) fs.mkdirSync(directory);
		directory = path.join(__dirname, "..", "/server_storage/videos");
		if (!fs.existsSync(directory)) fs.mkdirSync(directory);
	} catch (error) {
		console.log(error);
	}
	next();
};
