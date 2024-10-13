let table = document.createElement("table");
let thead = document.createElement("thead");
let initalData = [];
let currentPage = 1;
let itemsPerPage = 20;
let tbody = document.createElement("tbody");
let searchElem = document.createElement("input");
searchElem.type = "search";
searchElem.placeholder = "Search";
document.body.appendChild(searchElem);
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
thead.innerHTML = `
  <tr>
      <th>Icon</th>
      <th>Name</th>
      <th>Full Name</th>
      <th>Powerstats</th>
      <th>Race</th>
      <th>Gender</th>
      <th>Height</th>
      <th>Weight</th>
      <th>Place Of  Birth</th>
      <th>Alignment</th>
  </tr>
`;
table.appendChild(thead);
document.body.appendChild(table);
fetch("https://rawcdn.githack.com/akabab/superhero-api/0.2.0/api/all.json")
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    initalData = data;
    pagination(data);
  });
function loadData(data) {
  const table = document.querySelector("table");
  const rows = data.map((item) => {
    return `
      <tr>
          <td><img src="${item.images.xs}" alt="${item.name}"></td>
          <td>${item.name}</td>
          <td>${item.biography.fullName}</td>
          <td>${powerStats(item.powerstats)}</td>
          <td>${item.appearance.race}</td>
          <td>${item.appearance.gender}</td>
          <td>${item.appearance.height}</td>
          <td>${item.appearance.weight}</td>
          <td>${item.biography.placeOfBirth}</td>
          <td>${item.biography.alignment}</td>
      <tr>
      `;
  });
  tbody.innerHTML = rows.join("\n");
  table.appendChild(tbody);
}
function search(e) {
  if (!e || !e.target || !e.target.value) {
    loadData(initalData);
    return;
  }
  const value = e.target.value;
  const filtered = initalData.filter((item) =>
    item.name.toLowerCase().includes(value.toLowerCase())
  );
  loadData(filtered);
}
function powerStats(obj) {
  return Object.keys(obj)
    .map((key) => `${key}: ${obj[key]}`)
    .join(", ");
}
function pagination(data) {
  console.log(itemsPerPage);
  const pagination = document.querySelector("div#pagination");
  const pages = Math.ceil(data.length / itemsPerPage);
  const paginationHtml = Array.from({ length: pages }, (_, i) => {
    return `
      <button class="page-btn" data-page="${i + 1}">${i + 1}</button>
      `;
  });
  pagination.innerHTML = paginationHtml.join("\n");
  // on initial load show just the first 20 items
  const firstItems = initalData.slice(0, itemsPerPage);
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
