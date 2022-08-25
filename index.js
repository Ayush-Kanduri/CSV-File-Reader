const express = require("express");
const app = express();
const port = process.env.PORT || 8000;
const cors = require("cors");
const dotenv = require("dotenv").config();
const expressLayouts = require("express-ejs-layouts");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(port, (err) => {
	if (err) {
		console.log(err);
		return;
	} else {
		console.log(`Server is running successfully on port ${port}`);
	}
});
