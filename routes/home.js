//Require the existing Express
const express = require("express");
//Create a Local Router
const router = express.Router();

//Require Home Controller
const homeController = require("../controllers/home_controller");

//Access the Home Controller's homepage() Function @ '/' route.
router.get("/", homeController.homepage);

//Export the Router
module.exports = router;
