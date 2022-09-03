const File = require("../models/file");
const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse");

//Displays the Home Page
module.exports.homepage = async (req, res) => {
	try {
		let files = await File.find({});
		return res.render("home", {
			title: "Home",
			files: files,
		});
	} catch (error) {
		console.log(error);
		return res.render("home", {
			title: "Home",
		});
	}
};

//Uploads the File to the Server Uploads & Database
module.exports.upload = async (req, res) => {
	// ----------------------------------------------------------------------------
	// fieldname: 'file' --> name of the input field in the form
	// originalname: 'programs.csv' --> name of the file on the user's computer
	// encoding: '7bit' --> file encoding
	// mimetype: 'text/csv' --> mime type of the file
	// destination: 'XYZ' --> destination path of the folder where the file is saved
	// filename: 'abc' --> new name of the file
	// path: 'XYZ/abc' --> absolute path of the file
	// size: 60 --> size of the file in bytes
	// ----------------------------------------------------------------------------

	//If there is no file uploaded, then delete existing files from the server
	try {
		const file = await File.find({});
		//If there are no files in the Database
		if (file.length === 0) {
			//Read all Files in the Server Uploads
			const files = await fs.promises.readdir(
				path.join(__dirname, "..", File.filePath)
			);
			//Delete existing Files from the Server Uploads
			for (let file of files) {
				fs.unlinkSync(path.join(__dirname, "..", File.filePath, file));
			}
		}
	} catch (error) {
		console.log(error);
		//Return the Error
		return res.status(500).json({
			message: "Internal Server Error",
			error: error.message,
		});
	}

	try {
		let file = {};
		//Call the FILE Model's Static Method to upload the File.
		File.uploadedFile(req, res, async (err) => {
			let error = "Error in uploading the file!";
			//Return the Error
			if (err) {
				console.log(error);
				return res.status(500).json({
					message: error,
					error: err.message,
				});
			}

			//Create the File in the Database
			file = await File.create({
				name: req.file.originalname,
				path: File.filePath + "/" + req.file.filename,
				status: false,
			});
			//Call the FILE Model's Static Global Variable to get the File Path.

			//Return the Response
			return res.status(200).json({
				message: "Upload Successful!",
				data: file,
			});
		});
	} catch (error) {
		console.log(error);
		//Return the Error
		return res.status(500).json({
			message: "Internal Server Error",
			error: error.message,
		});
	}
};

//Deletes the File from the Server Uploads & Database
module.exports.delete = async (req, res) => {
	try {
		let file = await File.findById(req.params.id);
		let filename = file.name;

		//If the File is not found in the Database
		if (!file) {
			return res.status(404).json({
				message: "File not found!",
				data: "error",
			});
		}

		//If the File Path already exists in the Database
		if (file.path) {
			//If the File already exists in the "/uploads/files" Directory
			if (fs.existsSync(path.join(__dirname, "..", file.path))) {
				//Delete that File from the Directory
				fs.unlinkSync(path.join(__dirname, "..", file.path));
			}
		}
		//Delete the File from the Database
		await file.remove();

		//Return the Response
		return res.status(200).json({
			message: "File Deleted Successfully!",
			data: "success",
			filename: filename,
		});
	} catch (error) {
		console.log(error);
		//Return the Error
		return res.status(500).json({
			message: "Internal Server Error",
			error: error.message,
		});
	}
};

//Reads the File from the Server Uploads & Database
module.exports.read = async (req, res) => {
	try {
		const id = req.params.id;
		const file = await File.findById(id);
		const filePath = path.join(__dirname, "..", file.path);
		const records = [];

		//Initialize the CSV Parser
		const parser = parse(
			{
				delimiter: ",",
				columns: true, // --> Array of Objects
				//columns: false, --> Array of Arrays
			},
			(err, data) => {
				//Return the Error
				if (err) {
					console.log(err);
					return res.status(500).json({
						message: "Internal Server Error",
						error: err.message,
					});
				}
				//Push the Data into the Array
				records.push(data);
			}
		);

		//Read the CSV File
		fs.createReadStream(filePath).pipe(parser);

		//Wait for the Parser to finish the work
		await new Promise((resolve) => {
			parser.on("finish", () => {
				resolve();
			});
		});

		//Close the readable stream
		parser.end();

		//Return the Parsed Data
		return res.status(200).json({
			message: "File Read Successfully!",
			response: "success",
			data: records[0],
			filename: file.name,
		});
	} catch (error) {
		console.log(error);
		//Return the Error
		return res.status(500).json({
			message: "Internal Server Error",
			error: error.message,
		});
	}
};

// ---------------------------------------------------------------
// Array of Arrays //
//---------------
//Heading Columns
//---------------
// [
// "id",
// "location_id",
// "organization_id",
// "service_id",
// "name",
// "title",
// "email",
// "department"
// ],
//------------
//Data Columns
//------------
// [
// 	"1",
// 	"1",
// 	"",
// 	"",
// 	"Susan Houston",
// 	"Director of Older Adult Services",
// 	"",
// 	""
// ],
// ---------------------------------------------------------------
