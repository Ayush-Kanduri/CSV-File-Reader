{
	try {
		function tableSorting() {
			const heading = document.querySelectorAll(".heading");
			const table = document.querySelector("table");
			const tableHeader = document.querySelector("thead");
			const tableBody = document.querySelector("tbody");
			const tableRows = tableBody.querySelectorAll("tr");
			const tableData = tableBody.querySelectorAll("td");
			const tableHeadings = table.querySelectorAll("th");

			heading.forEach(function (item) {
				item.addEventListener("click", function () {
					const icon = item.querySelector("i");
					if (icon.classList.contains("fa-sort-down")) {
						icon.classList.replace("fa-sort-down", "fa-sort-up");
					} else {
						icon.classList.replace("fa-sort-up", "fa-sort-down");
					}
				});
			});
		}
		tableSorting();
	} catch (error) {
		console.log(error);
	}
	try {
		function fileUpload() {
			const btn = document.querySelector(".upload-wrapper > .upload-btn");
			const file = document.querySelector(".upload-wrapper > input");

			file.addEventListener("change", handleFiles, false);
			function handleFiles() {
				const fileList = this.files;
				btn.textContent = fileList[0].name;
                btn.classList.add("active");
			}
		}
		fileUpload();
	} catch (error) {
		console.log(error);
	}
}
