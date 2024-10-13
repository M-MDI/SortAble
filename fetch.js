let table = document.createElement("table");
table.id = "heroTable";
let thead = document.createElement("thead");
let initalData = [];
let currentPage = 1;
let itemsPerPage = 20;
let tbody = document.createElement("tbody");
let searchElem = document.createElement("input");
searchElem.type = "search";
searchElem.className = "search";
searchElem.placeholder = "Search";
document.getElementById("searchContainer").appendChild(searchElem);
searchElem.addEventListener("input", (e) => search(e));
let selectElem = document.getElementById("select");
selectElem.addEventListener("change", (e) => {
  if (e.target.value == "all") {
    itemsPerPage = initalData.length;
  } else {
    itemsPerPage = parseInt(e.target.value);
  }
  pagination(initalData);
});
const columns = [
  { name: "Icon", key: "images.xs", sortable: false },
  { name: "Name", key: "name", sortable: true },
  { name: "Full Name", key: "biography.fullName", sortable: true },
  { name: "Powerstats", key: "powerstats", sortable: true },
  { name: "Race", key: "appearance.race", sortable: true },
  { name: "Gender", key: "appearance.gender", sortable: true },
  { name: "Height", key: "appearance.height", sortable: true },
  { name: "Weight", key: "appearance.weight", sortable: true },
  { name: "Place Of Birth", key: "biography.placeOfBirth", sortable: true },
  { name: "Alignment", key: "biography.alignment", sortable: true },
];
let currentSortColumn = "name";
let currentSortOrder = "asc";
thead.innerHTML = `
  <tr>
    ${columns
      .map(
        (col) =>
          `<th${col.sortable ? ' class="sortable"' : ""}>${col.name}</th>`
      )
      .join("")}
  </tr>
`;
table.appendChild(thead);
document.body.appendChild(table);
fetch("https://rawcdn.githack.com/akabab/superhero-api/0.2.0/api/all.json")
  .then((response) => response.json())
  .then((data) => {
    initalData = data;
    sortData(initalData, currentSortColumn, currentSortOrder);
    pagination(initalData);
  });
function loadData(data) {
  const table = document.querySelector("table");
  const rows = data.map((item) => {
    return `
      <tr>
        <td><img src="${item.images.xs}" alt="${item.name}"></td>
        <td>${item.name}</td>
        <td>${item.biography.fullName || ""}</td>
        <td>${formatPowerstats(item.powerstats)}</td>
        <td>${item.appearance.race || ""}</td>
        <td>${item.appearance.gender || ""}</td>
        <td>${formatHeight(item.appearance.height)}</td>
        <td>${formatWeight(item.appearance.weight)}</td>
        <td>${item.biography.placeOfBirth || ""}</td>
        <td>${item.biography.alignment || ""}</td>
      </tr>
    `;
  });
  tbody.innerHTML = rows.join("\n");
  table.appendChild(tbody);
}
function formatPowerstats(powerstats) {
  return Object.entries(powerstats)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");
}
function formatHeight(height) {
  return height.join(" / ");
}
function formatWeight(weight) {
  return weight.join(" / ");
}
function search(e) {
  if (!e || !e.target || !e.target.value) {
    sortData(initalData, currentSortColumn, currentSortOrder);
    return;
  }
  const value = e.target.value.toLowerCase();
  const filtered = initalData.filter(
    (item) =>
      item.name.toLowerCase().includes(value) ||
      item.biography.fullName.toLowerCase().includes(value)
  );
  sortData(filtered, currentSortColumn, currentSortOrder);
}
function isMissingValue(value) {
  return (
    value === null ||
    value === undefined ||
    value === "" ||
    value === "-" ||
    value === "N/A"
  );
}
function sortData(data, column, order) {
  const sortedData = [...data].sort((a, b) => {
    let aValue = getNestedValue(a, column);
    let bValue = getNestedValue(b, column);
    if (column === "powerstats") {
      aValue = calculateTotalPower(aValue);
      bValue = calculateTotalPower(bValue);
    }
    const aIsMissing = isMissingValue(aValue);
    const bIsMissing = isMissingValue(bValue);
    if (aIsMissing && bIsMissing) return 0;
    if (aIsMissing) return 1;
    if (bIsMissing) return -1;
    if (column === "appearance.height" || column === "appearance.weight") {
      aValue = parseFloat(aValue[1]); // Use metric value
      bValue = parseFloat(bValue[1]); // Use metric value
    }
    if (typeof aValue === "number" && typeof bValue === "number") {
      return order === "asc" ? aValue - bValue : bValue - aValue;
    } else {
      const comparison = String(aValue).localeCompare(String(bValue));
      return order === "asc" ? comparison : -comparison;
    }
  });
  loadData(sortedData.slice(0, itemsPerPage));
  pagination(sortedData);
}
function calculateTotalPower(powerstats) {
  return Object.values(powerstats).reduce(
    (sum, stat) => sum + (parseInt(stat) || 0),
    0
  );
}
function getNestedValue(obj, path) {
  return path.split(".").reduce((acc, part) => acc && acc[part], obj);
}
function pagination(data) {
  const pagination = document.querySelector("div#pagination");
  const pages = Math.ceil(data.length / itemsPerPage);
  const paginationHtml = Array.from({ length: pages }, (_, i) => {
    return `<button class="page-btn" data-page="${i + 1}">${i + 1}</button>`;
  });
  pagination.innerHTML = paginationHtml.join("\n");
  const firstItems = data.slice(0, itemsPerPage);
  loadData(firstItems);
  const pageBtns = pagination.querySelectorAll(".page-btn");
  pageBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const page = parseInt(e.target.dataset.page);
      const start = (page - 1) * itemsPerPage;
      const end = page * itemsPerPage;
      const paginatedData = data.slice(start, end);
      loadData(paginatedData);
    });
  });
}
thead.addEventListener("click", (e) => {
  const th = e.target.closest("th");
  if (!th || !th.classList.contains("sortable")) return;
  const column = columns.find((col) => col.name === th.textContent);
  if (column) {
    if (currentSortColumn === column.key) {
      currentSortOrder = currentSortOrder === "asc" ? "desc" : "asc";
    } else {
      currentSortColumn = column.key;
      currentSortOrder = "asc";
    }
    sortData(initalData, currentSortColumn, currentSortOrder);
  }
});
// Initial sort
sortData(initalData, currentSortColumn, currentSortOrder);
