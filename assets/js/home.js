{
	try {
		const success = {
			upload: "File has been uploaded successfully 🔥",
			delete: "File has been deleted successfully 🔥",
		};
		const error = {
			upload: "Please select a CSV File of Size <= 2MB ❌",
			delete: "Error in deleting the file ❌",
		};
		const Page = {
			Current_Records: [],
			Records: [],
			Total_Rows: 0,
			Total_Rows_Per_Page: 10,
			Total_Pages: 0,
			Current_Page: 1,
		};
		const filesDiv = document.querySelector(".files");
		let selectedFile = undefined;
		let deletedFile = undefined;

		function notification(type, message) {
			const toastContainer = document.querySelector(".toast-container");
			const toast = toastContainer.querySelector(".toast").cloneNode(true);
			const toastMessage = toast.querySelector(".toast-body strong");
			toast.style.display = "block";

			if (type === "error") toastMessage.textContent = error[message];
			if (type === "success") toastMessage.textContent = success[message];

			toastContainer.appendChild(toast);

			const Toast = new bootstrap.Toast(toast);
			Toast.show();

			setTimeout(() => toast.remove(), 6500);
		}

		function deleteFile(filesDiv) {
			try {
				const filename = filesDiv.querySelectorAll(".filename > span > i");
				filename.forEach((icon) => {
					icon.addEventListener("click", async function (e) {
						e.stopPropagation();
						const id = e.target.getAttribute("data-id");
						const response = await fetch(`/delete/${id}`, {
							method: "DELETE",
						});
						const data = await response.json();
						if (data.data === "success") {
							notification("success", "delete");
							e.target.parentElement.parentElement.remove();
							deletedFile = data.filename;
							deleteTable();
						} else {
							notification("error", "delete");
							return;
						}
					});
				});
			} catch (error) {
				console.log(error);
			}
		}

		function deleteTable() {
			try {
				const btns = document.querySelectorAll(".pagination button");
				if (deletedFile === selectedFile) {
					document.querySelector("table").remove();
					btns.forEach((item) => (item.style.display = "none"));
					document.querySelector(".table").style.overflowX = "hidden";
				}
			} catch (error) {
				console.log(error);
			}
		}

		function selectFile(filesDiv) {
			filesDiv.querySelectorAll(".filename").forEach(function (item) {
				item.addEventListener("click", async function (e) {
					e.stopPropagation();
					filesDiv.querySelectorAll(".filename").forEach(function (file) {
						if (file !== item) file.classList.remove("active");
						if (file === item) file.classList.add("active");
					});
					try {
						const id = item.getAttribute("data-id");
						const response = await fetch(`/read/${id}`, {
							method: "GET",
						});
						const data = await response.json();
						if (data.response !== "success") return;
						Page.Records = data.data;
						selectedFile = data.filename;
						pagination();
						tableSort();
					} catch (error) {
						console.log(error);
					}
				});
			});
		}

		function createTable(records) {
			const tableDiv = document.querySelector(".table");
			const headingsArray = Object.keys(records[0]);
			let headingContent = ``;
			let bodyContent = ``;

			for (let heading in headingsArray) {
				headingContent += `
				<th scope="col" class="heading" data-index=${heading}>
					${headingsArray[heading]}&emsp;<i class="fa-solid fa-sort-up"></i>
				</th>`;
			}

			for (let record of records) {
				let data = ``;
				for (let key in record) {
					data += `
					<td>${record[key]}</td>`;
				}
				bodyContent += `
				<tr>
					${data}
				</tr>`;
			}

			let table = `
			<table class="table table-dark table-hover">
				<thead>
					<tr>
						${headingContent}
					</tr>
				</thead>
				<tbody class="table-group-divider">
					${bodyContent}
				</tbody>
			</table>`;

			document.querySelector(".table").style.overflowX = "scroll";
			document.querySelectorAll(".pagination button").forEach((item) => {
				item.style.display = "initial";
			});

			tableDiv.innerHTML = table;
		}

		function fileUpload() {
			let END = false;
			let records = [];
			let status = false;

			const btn = document.querySelector(".upload-wrapper > .upload-btn");
			const file = document.querySelector(".upload-wrapper > input");
			const form = document.querySelector(".upload > form");

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

				if (file === null || file === undefined) {
					notification("error", "upload");
					return;
				}
				if (file === "null" || file === "undefined") {
					notification("error", "upload");
					return;
				}
				if (file === "") {
					notification("error", "upload");
					return;
				}

				//File Type must be CSV
				if (file.files[0].type.match("text/csv")) {
					//File Size must be less than equal to 2MB
					if (file.files[0].size <= 1024 * 1024 * 2) {
						notification("success", "upload");
						try {
							let formSelf = e.target; //or formSelf = this;
							let formData = new FormData(formSelf);
							e.target.reset();
							btn.textContent = "Choose File";
							btn.classList.remove("active");
							const response = await fetch("/upload", {
								method: "POST",
								body: formData,
							});
							const data = await response.json();

							filesDiv.innerHTML += `<div class="filename" data-id="${data.data._id}">
							<span>${data.data.name}&emsp;<i class="fa-solid fa-trash" data-id='${data.data._id}'></i></span></div>`;

							deleteFile(filesDiv);
							selectFile(filesDiv);
						} catch (error) {
							console.log(error);
						}
					} else {
						notification("error", "upload");
						return;
					}
				}
			}
		}

		//Function :: Used for the Sorting Mechanism
		function sort(ColumnIndex, type) {
			const table = document.querySelector("table");
			const tbody = table.tBodies[0];
			const rows = Array.from(tbody.rows);

			//Decides whether the rows should be sorted in ascending or descending order
			const order = type === "ascending" ? 1 : -1;

			//To check whether the column is a number column or a string column
			const Data = rows[0].cells[ColumnIndex].textContent.trim();

			let sortedRows = [];

			// if (Data === "") return;

			if (isNaN(Data)) {
				//Sort each Row :: This is a sorting function with a comparator function which decides the order/placement of the rows
				sortedRows = rows.sort((a, b) => {
					//Selects nth column data in the row for the comparison
					const a_ColumnData = a.cells[ColumnIndex].textContent
						.trim()
						.toLowerCase();
					const b_ColumnData = b.cells[ColumnIndex].textContent
						.trim()
						.toLowerCase();

					//Returns the order/placement of the rows as per the type of sorting
					return a_ColumnData > b_ColumnData ? 1 * order : -1 * order;
				});
			} else {
				//Sort each Row :: This is a sorting function with a comparator function which decides the order/placement of the rows
				sortedRows = rows.sort((a, b) => {
					//Selects nth column data in the row for the comparison
					const a_ColumnData = Number(
						a.cells[ColumnIndex].textContent.trim()
					);
					const b_ColumnData = Number(
						b.cells[ColumnIndex].textContent.trim()
					);

					//Returns the order/placement of the rows as per the type of sorting
					return a_ColumnData > b_ColumnData ? 1 * order : -1 * order;
				});
			}

			// ---------------------------------------
			//If a > b & type is 'ascending' then,
			//Return 1 :: Swap the rows
			//If a < b & type is 'ascending' then,
			//Return -1 :: Don't swap the rows

			//If a > b & type is 'descending' then,
			//Return -1 :: Don't swap the rows
			//If a < b & type is 'descending' then,
			//Return 1 :: Swap the rows
			// ---------------------------------------

			//Deletes the existing rows in the table body
			while (tbody.firstChild) {
				tbody.removeChild(tbody.firstChild);
			}

			//Appends the sorted rows to the table body
			tbody.append(...sortedRows);
		}

		function tableSort() {
			try {
				const heading = document.querySelectorAll(".heading");

				heading.forEach(function (item) {
					item.addEventListener("click", function () {
						for (let head of heading) head.style.backgroundColor = "";
						this.style.backgroundColor = "#59ce8f";
						const icon = item.querySelector("i");
						const index = item.getAttribute("data-index");
						if (icon.classList.contains("fa-sort-down")) {
							sort(index, "ascending");
							icon.classList.replace("fa-sort-down", "fa-sort-up");
						} else {
							sort(index, "descending");
							icon.classList.replace("fa-sort-up", "fa-sort-down");
						}
					});
				});
			} catch (error) {
				// console.log(error);
			}
		}

		function pagination() {
			Page.Current_Records = Page.Records.slice(0, Page.Total_Rows_Per_Page);
			Page.Current_Page = 1;

			createTable(Page.Current_Records);

			Page.Total_Rows = Page.Records.length;
			Page.Total_Pages = Math.ceil(
				Page.Total_Rows / Page.Total_Rows_Per_Page
			);

			// nextPage();
			// previousPage();
		}

		function nextPage() {
			const nxt = document.querySelector(".pagination > button.next-btn");
			if (Page.Current_Page === Page.Total_Pages) nxt.style.display = "none";

			nxt.addEventListener("click", function (e) {
				e.preventDefault();
				e.stopPropagation();
				// if (Page.Current_Page < Page.Total_Pages) {
				// 	Page.Current_Page++;
				// 	let start = Page.Current_Page * Page.Total_Rows_Per_Page;
				// 	let end = start - Page.Total_Rows_Per_Page;
				// 	console.log(end, start);
				// 	Page.Current_Records = Page.Records.slice(end, start);
				// 	createTable(Page.Current_Records);
				// 	if (Page.Current_Page === Page.Total_Pages) {
				// 		nxt.style.display = "none";
				// 		return;
				// 	} else {
				// 		nxt.style.display = "inline-block";
				// 	}
				// }
				if (Page.Current_Page < Page.Total_Pages) {
					let start = Page.Current_Page * Page.Total_Rows_Per_Page;
					let end = start + Page.Total_Rows_Per_Page;
					console.log("Current Page:", Page.Current_Page);
					console.log("Start:", start, "End:", end);
					Page.Current_Records = Page.Records.slice(start, end);
					createTable(Page.Current_Records);
					Page.Current_Page++;
					if (Page.Current_Page === Page.Total_Pages) {
						nxt.style.display = "none";
						return;
					} else {
						nxt.style.display = "inline-block";
					}
				}
			});
		}

		function previousPage() {
			const prev = document.querySelector(".pagination > button.prev-btn");
			if (Page.Current_Page === 1) prev.style.display = "none";

			prev.addEventListener("click", function (e) {
				e.preventDefault();
				e.stopPropagation();
				if (Page.Current_Page > 1) {
					Page.Current_Page--;
					let start = Page.Current_Page * Page.Total_Rows_Per_Page;
					let end = start - Page.Total_Rows_Per_Page;
					console.log("Current Page:", Page.Current_Page);
					console.log("Start:", end, "End:", start);
					Page.Current_Records = Page.Records.slice(end, start);
					createTable(Page.Current_Records);
					if (Page.Current_Page === 1) {
						prev.style.display = "none";
						return;
					} else {
						prev.style.display = "inline-block";
					}
				}
			});
		}

		tableSort();
		fileUpload();
		deleteFile(filesDiv);
		selectFile(filesDiv);
		nextPage();
		previousPage();
	} catch (error) {
		console.log(error);
	}
}
