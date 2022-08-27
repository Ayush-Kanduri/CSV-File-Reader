//Require the existing Express
const express = require("express");
//Create a Local Router
const router = express.Router();

//Require Home Controller
const homeController = require("../controllers/home_controller");

//Access the Home Controller's homepage() Function @ '/' route.
router.get("/", homeController.homepage);
//Access the Home Controller's upload() Function @ '/upload' route.
router.post("/upload", homeController.upload);
//Access the Home Controller's delete() Function @ '/delete/:id' route.
router.delete("/delete/:id", homeController.delete);

//Export the Router
module.exports = router;
