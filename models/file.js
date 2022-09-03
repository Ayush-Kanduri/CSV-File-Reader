//Create the same instance of mongoose which is used in the MongoDB configuration inside config
const mongoose = require("mongoose");

//Require Multer Module for the File Uploading
const multer = require("multer");
//Require Path Module for the Directory
const path = require("path");
//The path where the Files will be uploaded
const FILE_PATH = path.join("/uploads/files");

//Create the DB Schema
const fileSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		path: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

//BACKEND VALIDATION :: Filter Function for File Uploading
const fileTypeFilter = (req, file, cb) => {
	//Accept the file if it is a CSV file & less than 2MB
	if (file.mimetype === "text/csv") {
		if (file.size > 1024 * 1024 * 2) {
			cb(new Error("File is too large. Max size is 2MB"), false);
		} else {
			cb(null, true);
		}
	} else {
		cb(new Error("Invalid File Type"), false);
	}
};

//Setting up the Disk Storage Engine
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname, "..", FILE_PATH));
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(null, file.fieldname + "-" + uniqueSuffix);
	},
});

//Static Function :: Attaching the Disk Storage Engine to the Multer
fileSchema.statics.uploadedFile = multer({
	storage: storage,
	fileFilter: fileTypeFilter,
}).single("file");

//Static Variable :: FILE_PATH should be available globally in the FILE Model using this VARIABLE & should tell the controller where the path would be.
fileSchema.statics.filePath = FILE_PATH;

//Create a Model/Collection to populate the data with the same name for the schema in the DB
const File = mongoose.model("File", fileSchema);

//Export the Model/Collection
module.exports = File;
