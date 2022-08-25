//Displays the home page
module.exports.homepage = (req, res) => {
	return res.render("home", {
		title: "Home",
	});
};
