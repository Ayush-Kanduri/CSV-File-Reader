{
	try {
		const success = {
			upload: "File has been uploaded successfully 🔥",
			delete: "File has been deleted successfully 🔥",
		};
		const error = {
			upload: "Please select a CSV File of Size <= 2MB ❌",
			delete: "Error in deleting the file ❌",
			search: "Please select a column to search ❌",
		};
		let Page = {
			Current_Records: [],
			Records: [],
			Total_Rows: 0,
			Total_Rows_Per_Page: 100,
			Total_Pages: 0,
			Current_Page: 1,
		};
		const filesDiv = document.querySelector(".files");
		let selectedFile = undefined;
		let deletedFile = undefined;
		let activeColumn = undefined;
		let searchFlag = false;

		function tooltip() {
			try {
				const options = {
					animation: true,
					html: true,
					placement: "right",
					trigger: "hover",
					delay: { show: 300, hide: 100 },
				};
				const tooltipTriggerList = document.querySelectorAll(
					'[data-bs-toggle="tooltip"]'
				);

				const tooltipList = [...tooltipTriggerList].map(
					(ele) => new bootstrap.Tooltip(ele, options)
				);
				tooltipList.forEach((ele) => {
					ele.tip.classList.add("tooltip");
				});
			} catch (error) {
				// console.log(error);
			}
		}

		function search() {
			const searchInput = document.querySelector(".form-control");

			tooltip();
			searchFlag = false;
			searchInput.style.cursor = "not-allowed";
			searchInput.disabled = true;

			searchInput.addEventListener("input", (e) => {
				const searchValue = e.target.value;
				if (searchValue === "") {
					if (Page.Records.length !== 0) {
						pagination();
						tableSort();
					}
				}
				if (activeColumn === undefined) {
					notification("error", "search");
					return;
				}
				searchFlag = true;
				Page.Current_Records = Page.Records.filter((record) => {
					const key = activeColumn.textContent.trim();
					return record[key]
						.toLowerCase()
						.includes(searchValue.toLowerCase());
				});
				Page.Total_Rows = Page.Current_Records.length;
				Page.Total_Pages = Math.ceil(
					Page.Total_Rows / Page.Total_Rows_Per_Page
				);
				Page.Current_Page = 1;

				const pages = document.querySelector(".pages");
				pages.querySelectorAll("li").forEach(function (item) {
					item.remove();
				});

				pagination(searchValue);
				tableSort();
			});
		}

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
				const searchInput = document.querySelector(".form-control");
				const table = document.querySelector("table");
				if (deletedFile === selectedFile) {
					if (table) table.remove();
					btns.forEach((item) => (item.style.display = "none"));
					document.querySelector(".table").style.overflowX = "hidden";
					document.querySelectorAll("#pie > *").forEach((item) => {
						item.remove();
					});
					document.querySelectorAll("#stats > *").forEach((item) => {
						item.remove();
					});
					document.querySelector(".chart").style.height = "auto";
					document.querySelector(".chart").style.overflowX = "hidden";
					document.querySelector(".chart2").style.height = "auto";
					document.querySelector(".chart2").style.overflowX = "hidden";

					Page = {
						Current_Records: [],
						Records: [],
						Total_Rows: 0,
						Total_Rows_Per_Page: Page.Total_Rows_Per_Page,
						Total_Pages: 0,
						Current_Page: 1,
					};

					selectedFile = undefined;
					deletedFile = undefined;
					activeColumn = undefined;
					document.querySelectorAll(".pages li").forEach(function (item) {
						item.remove();
					});
					searchInput.value = "";
					searchInput.style.cursor = "not-allowed";
					searchInput.disabled = true;
					searchFlag = false;
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
						deletedFile = selectedFile;
						deleteTable();
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
			const chart1 = document.querySelector(".chart");
			const chart2 = document.querySelector(".chart2");

			if (records.length === 0) {
				tableDiv.style.display = "none";
				tableDiv.style.overflowX = "hidden";
				chart1.style.display = "none";
				chart1.style.overflowX = "hidden";
				chart2.style.display = "none";
				chart2.style.overflowX = "hidden";
				chart1.style.height = "auto";
				chart2.style.height = "auto";
				return;
			} else {
				tableDiv.style.display = "initial";
				tableDiv.style.overflowX = "scroll";
				chart1.style.display = "initial";
				chart1.style.overflowX = "scroll";
				chart2.style.display = "initial";
				chart2.style.overflowX = "scroll";
				chart1.style.height = "500px";
				chart2.style.height = "500px";
			}

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

		function createChart(heading, index) {
			const Frequency = new Map();
			const Percentage = new Map();
			let sum = 0;

			for (let record of Page.Records) {
				if (Frequency.has(record[heading])) {
					Frequency.set(
						record[heading],
						Frequency.get(record[heading]) + 1
					);
				} else {
					Frequency.set(record[heading], 1);
				}
			}

			google.charts.load("current", { packages: ["corechart", "bar"] });
			google.charts.setOnLoadCallback(drawChart);
			google.charts.setOnLoadCallback(drawPieChart);

			for (const value of Frequency.values()) sum += value;

			for (let [key, value] of Frequency) {
				Percentage.set(key, (Number(value) * 100) / sum);
			}

			function drawChart() {
				const data = new google.visualization.arrayToDataTable([
					[heading, "Percentage"],
					...Percentage,
				]);

				const options = {
					width: 800,
					height: 450,
					backgroundColor: {
						fill: "#000000",
						fillOpacity: 1,
					},
					titleTextStyle: {
						color: "#e8f9fd",
						fontSize: 20,
						fontName: "poppins",
						bold: true,
						italic: false,
						underline: false,
					},
					legend: {
						position: "right",
						textStyle: {
							color: "#e8f9fd",
							fontSize: 15,
							fontName: "poppins",
						},
					},
					tooltip: { textStyle: { fontName: "poppins" } },
					is3D: true,
					chart: {
						title: "Frequency Distribution of " + heading.toUpperCase(),
						subtitle: "Percentage",
					},
					annotations: { textStyle: { fontName: "poppins" } },
					chartArea: {
						backgroundColor: {
							fill: "#000000",
							fillOpacity: 1,
						},
					},
					colors: ["#59ce8f"],
					isStacked: "true",
					axes: {
						x: {
							0: {
								side: "bottom",
								// label: "Percentage",
							},
						},
					},
					bar: { groupWidth: "60%" },
					vAxis: {
						minValue: 0,
						title: "PERCENTAGE",
						textStyle: {
							color: "#e8f9fd",
							fontSize: 15,
							fontName: "poppins",
						},
						titleTextStyle: {
							color: "#e8f9fd",
							fontSize: 15,
							fontName: "poppins",
							bold: true,
						},
					},
					hAxis: {
						title: heading.toUpperCase(),
						textStyle: {
							color: "#e8f9fd",
							fontSize: 15,
							fontName: "poppins",
						},
						titleTextStyle: {
							color: "#e8f9fd",
							fontSize: 15,
							fontName: "poppins",
							bold: true,
						},
					},
				};

				document.querySelector("#stats").style.display = "flex";
				document.querySelector("#stats").style.overflowX = "scroll";
				document.querySelector(".chart").style.overflowX = "scroll";
				document.querySelector(".chart").style.height = "500px";

				const div = document.getElementById("stats");

				const chart = new google.charts.Bar(div);
				chart.draw(data, google.charts.Bar.convertOptions(options));
			}

			function drawPieChart() {
				const data = google.visualization.arrayToDataTable([
					[heading, "Percentage"],
					...Percentage,
				]);

				const options = {
					width: 800,
					height: 450,
					title: "Frequency Distribution of " + heading.toUpperCase(),
					is3D: true,
					legend: {
						textStyle: {
							color: "#e8f9fd",
							fontSize: 17,
						},
					},
					titleTextStyle: {
						color: "#e8f9fd",
						fontSize: 20,
						bold: true,
						italic: false,
						underline: false,
					},
					backgroundColor: {
						fill: "#000000",
						fillOpacity: 1,
						// stroke: "#59ce8f",
						// strokeWidth: 8,
					},
					colors: [
						"#8479f3",
						"#59ce8f",
						"#ed2d2d",
						"#faac33",
						"#fe60d7",
						"#44cfe4",
						"#e2b855",
						"#55e2ae",
						"#a855e2",
						"#e25855",
					],
					pieSliceText: "percentage",
					pieSliceTextStyle: {
						color: "#000000",
						fontSize: 16,
						bold: true,
					},
				};

				document.querySelector("#pie").style.display = "flex";
				document.querySelector("#pie").style.overflowX = "scroll";
				document.querySelector(".chart2").style.overflowX = "scroll";
				document.querySelector(".chart2").style.height = "500px";

				const div = document.getElementById("pie");

				const chart = new google.visualization.PieChart(div);
				chart.draw(data, options);
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
				const Columns = new Map();

				heading.forEach(function (item) {
					if (!Columns.has(item.textContent.trim())) {
						Columns.set(item.textContent.trim(), false);
					}
					item.addEventListener("click", function () {
						const searchInput = document.querySelector(".form-control");
						searchInput.style.cursor = "initial";
						searchInput.disabled = false;
						searchFlag = true;

						for (let head of heading) head.classList.remove("active");
						this.classList.add("active");
						for (let head of heading) {
							head.querySelector("i").classList.remove("active");
						}
						const icon = item.querySelector("i");
						const index = item.getAttribute("data-index");
						createChart(item.textContent.trim(), index);
						if (!Columns.get(item.textContent.trim())) {
							Columns.set(item.textContent.trim(), true);
							if (activeColumn === undefined) {
								icon.classList.add("active");
								sort(index, "ascending");
								activeColumn = this;
								return;
							}
							icon.classList.add("active");
							activeColumn = this;
						} else {
							icon.classList.add("active");
							activeColumn = this;
						}
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

		function pagination(searchValue = "") {
			let start = 0;
			let end = Page.Total_Rows_Per_Page;

			if (searchFlag) {
				Page.Current_Records = Page.Records.filter((record) => {
					const key = activeColumn.textContent.trim();
					return record[key]
						.toLowerCase()
						.includes(searchValue.toLowerCase());
				});
				Page.Total_Rows = Page.Current_Records.length;
			} else {
				Page.Current_Records = Page.Records.slice(start, end);
				Page.Total_Rows = Page.Records.length;
			}
			Page.Current_Page = 1;
			Page.Total_Pages = Math.ceil(
				Page.Total_Rows / Page.Total_Rows_Per_Page
			);

			const pages = document.querySelector(".pages");
			pages.querySelectorAll("li").forEach(function (item) {
				item.remove();
			});

			createTable(Page.Current_Records);
			document.querySelector("#stats").style.display = "none";
			document.querySelector("#stats").style.overflowX = "hidden";
			document.querySelector(".chart").style.overflowX = "hidden";
			document.querySelector(".chart").style.height = "auto";
			document.querySelector("#pie").style.display = "none";
			document.querySelector("#pie").style.overflowX = "hidden";
			document.querySelector(".chart2").style.overflowX = "hidden";
			document.querySelector(".chart2").style.height = "auto";

			const nxt = document.querySelector("button.next-btn");
			const prev = document.querySelector("button.prev-btn");
			prev.style.display = "none";
			if (Page.Total_Pages === 1) nxt.style.display = "none";
			if (Page.Total_Pages === 1) prev.style.display = "none";

			if (searchFlag) {
				if (activeColumn !== undefined) {
					const heading = document.querySelectorAll(".heading");
					const arr = [];
					for (let head of heading) arr.push(head.textContent.trim());
					if (arr.includes(activeColumn.textContent.trim())) {
						let index = activeColumn.getAttribute("data-index");
						let column = undefined;
						for (let item of heading) {
							if (item.getAttribute("data-index") == index) {
								column = item;
								break;
							}
						}
						let icon = activeColumn.querySelector("i");
						if (icon.classList.contains("fa-sort-down")) {
							icon = column.querySelector("i");
							icon.classList.remove("fa-sort-up");
							icon.classList.add("fa-sort-down");
							icon.classList.add("active");
							sort(index, "descending");
						} else {
							icon = column.querySelector("i");
							icon.classList.remove("fa-sort-down");
							icon.classList.add("fa-sort-up");
							icon.classList.add("active");
							sort(index, "ascending");
						}
						column.classList.add("active");
						activeColumn = column;
						createChart(column.textContent.trim(), index);
					}
				}
			}

			for (let i = 0; i < Page.Total_Pages; i++) {
				const page = document.createElement("li");
				page.classList.add("page");
				page.setAttribute("data-page", i + 1);
				if (i === 0) page.classList.add("active");
				let p = document.createElement("p");
				p.textContent = i + 1;
				page.appendChild(p);
				if (Page.Total_Pages === 1) {
					pages.appendChild(page);
					return;
				}
				page.addEventListener("click", function () {
					for (let item of document.querySelectorAll(".page")) {
						item.classList.remove("active");
					}
					page.classList.add("active");
					Page.Current_Page = Number(this.querySelector("p").textContent);
					let start = (Page.Current_Page - 1) * Page.Total_Rows_Per_Page;
					let end = Page.Current_Page * Page.Total_Rows_Per_Page;
					Page.Current_Records = Page.Records.slice(start, end);

					createTable(Page.Current_Records);
					tableSort();

					if (activeColumn !== undefined) {
						const heading = document.querySelectorAll(".heading");
						const arr = [];
						for (let head of heading) arr.push(head.textContent.trim());
						if (arr.includes(activeColumn.textContent.trim())) {
							let index = activeColumn.getAttribute("data-index");
							let column = undefined;
							for (let item of heading) {
								if (item.getAttribute("data-index") == index) {
									column = item;
									break;
								}
							}
							let icon = activeColumn.querySelector("i");
							if (icon.classList.contains("fa-sort-down")) {
								icon = column.querySelector("i");
								icon.classList.remove("fa-sort-up");
								icon.classList.add("fa-sort-down");
								icon.classList.add("active");
								sort(index, "descending");
							} else {
								icon = column.querySelector("i");
								icon.classList.remove("fa-sort-down");
								icon.classList.add("fa-sort-up");
								icon.classList.add("active");
								sort(index, "ascending");
							}
							column.classList.add("active");
							activeColumn = column;
							createChart(column.textContent.trim(), index);
						}
					}

					if (Page.Current_Page === Page.Total_Pages) {
						nxt.style.display = "none";
					} else if (Page.Current_Page === 1) {
						prev.style.display = "none";
					} else {
						nxt.style.display = "inline-block";
						prev.style.display = "inline-block";
					}
				});
				pages.appendChild(page);
			}
		}

		function nextPage() {
			const nxt = document.querySelector(".pagination > button.next-btn");
			if (Page.Total_Pages === 1) nxt.style.display = "none";
			if (Page.Current_Page === Page.Total_Pages) nxt.style.display = "none";

			nxt.addEventListener("click", function (e) {
				e.preventDefault();
				e.stopPropagation();
				if (Page.Current_Page < Page.Total_Pages) {
					let start = Page.Current_Page * Page.Total_Rows_Per_Page;
					let end = start + Page.Total_Rows_Per_Page;

					Page.Current_Records = Page.Records.slice(start, end);
					createTable(Page.Current_Records);
					tableSort();

					if (activeColumn !== undefined) {
						const heading = document.querySelectorAll(".heading");
						const arr = [];
						for (let head of heading) arr.push(head.textContent.trim());
						if (arr.includes(activeColumn.textContent.trim())) {
							let index = activeColumn.getAttribute("data-index");
							let column = undefined;
							for (let item of heading) {
								if (item.getAttribute("data-index") == index) {
									column = item;
									break;
								}
							}
							let icon = activeColumn.querySelector("i");
							if (icon.classList.contains("fa-sort-down")) {
								icon = column.querySelector("i");
								icon.classList.remove("fa-sort-up");
								icon.classList.add("fa-sort-down");
								icon.classList.add("active");
								sort(index, "descending");
							} else {
								icon = column.querySelector("i");
								icon.classList.remove("fa-sort-down");
								icon.classList.add("fa-sort-up");
								icon.classList.add("active");
								sort(index, "ascending");
							}
							column.classList.add("active");
							activeColumn = column;
							createChart(column.textContent.trim(), index);
						}
					}

					Page.Current_Page++;

					for (let item of document.querySelectorAll(".page")) {
						item.classList.remove("active");
					}
					document
						.querySelector(`[data-page='${Page.Current_Page}']`)
						.classList.add("active");

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
			if (Page.Total_Pages === 1) prev.style.display = "none";
			if (Page.Current_Page === 1) prev.style.display = "none";

			prev.addEventListener("click", function (e) {
				e.preventDefault();
				e.stopPropagation();
				if (Page.Current_Page > 1) {
					Page.Current_Page--;

					for (let item of document.querySelectorAll(".page")) {
						item.classList.remove("active");
					}
					document
						.querySelector(`[data-page='${Page.Current_Page}']`)
						.classList.add("active");

					let start = Page.Current_Page * Page.Total_Rows_Per_Page;
					let end = start - Page.Total_Rows_Per_Page;

					Page.Current_Records = Page.Records.slice(end, start);
					createTable(Page.Current_Records);
					tableSort();

					if (activeColumn !== undefined) {
						const heading = document.querySelectorAll(".heading");
						const arr = [];
						for (let head of heading) arr.push(head.textContent.trim());
						if (arr.includes(activeColumn.textContent.trim())) {
							let index = activeColumn.getAttribute("data-index");
							let column = undefined;
							for (let item of heading) {
								if (item.getAttribute("data-index") == index) {
									column = item;
									break;
								}
							}
							let icon = activeColumn.querySelector("i");
							if (icon.classList.contains("fa-sort-down")) {
								icon = column.querySelector("i");
								icon.classList.remove("fa-sort-up");
								icon.classList.add("fa-sort-down");
								icon.classList.add("active");
								sort(index, "descending");
							} else {
								icon = column.querySelector("i");
								icon.classList.remove("fa-sort-down");
								icon.classList.add("fa-sort-up");
								icon.classList.add("active");
								sort(index, "ascending");
							}
							column.classList.add("active");
							activeColumn = column;
							createChart(column.textContent.trim(), index);
						}
					}

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
		search();
		nextPage();
		previousPage();
	} catch (error) {
		console.log(error);
	}
}
