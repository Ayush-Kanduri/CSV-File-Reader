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
		function notification(END, type) {
			if (type === "error") END = true;
			if (type === "success") END = false;

			const toastContainer = document.querySelector(".toast-container");
			const toast = toastContainer.querySelector(".toast").cloneNode(true);
			toast.style.display = "block";

			if (type === "error") {
				toast.querySelector(".toast-body strong").textContent =
					"Please select a CSV File of Size <= 2MB ❌";
			}
			if (type === "success") {
				toast.querySelector(".toast-body strong").textContent =
					"File has been uploaded successfully 🔥";
			}

			toastContainer.appendChild(toast);

			const Toast = new bootstrap.Toast(toast);
			Toast.show();

			setTimeout(function () {
				toast.remove();
			}, 6500);
		}

		function fileUpload() {
			let END = false;
			notification(END, "error");
			notification(END, "success");

			const btn = document.querySelector(".upload-wrapper > .upload-btn");
			const file = document.querySelector(".upload-wrapper > input");
			const form = document.querySelector(".upload > form");
			const filename = document.querySelector(".filename > span");

			file.addEventListener("change", handleFiles, false);
			function handleFiles(e) {
				const fileList = this.files; // e.target.files;
				btn.textContent = fileList[0].name;
				btn.classList.add("active");
			}

			form.addEventListener("submit", uploadFiles, false);
			async function uploadFiles(e) {
				e.preventDefault();
				e.stopPropagation();

				if (file === null) notification(END, "error");
				if (END) return;
				if (file === "null") notification(END, "error");
				if (END) return;
				if (file === undefined) notification(END, "error");
				if (END) return;
				if (file === "undefined") notification(END, "error");
				if (END) return;
				if (file === "") notification(END, "error");
				if (END) return;

				//File Type must be CSV
				if (file.type.match("text/csv")) {
					//File Size must be less than equal to 2MB
					if (file.size <= 1024 * 1024 * 2) {
						notification(END, "success");
						try {
							let formSelf = e.target; //or formSelf = this;
							let formData = new FormData(formSelf);
							const response = await fetch("/upload", {
								method: "POST",
								body: formData,
							});
							const data = await response.json();
							filename.textContent = data.data.name;
						} catch (error) {
							console.log(error);
						}
					} else {
						notification(END, "error");
					}
				}
				if (END) return;
			}
		}
		fileUpload();
	} catch (error) {
		console.log(error);
	}
}
