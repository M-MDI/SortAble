let allHeroes = [];
let filteredHeroes = [];
let currentPage = 1;
let pageSize = 20;
let currentSortColumn = 'name';
let currentSortOrder = 'asc';

// Fetch and load data
fetch('https://rawcdn.githack.com/akabab/superhero-api/0.2.0/api/all.json')
    .then(response => response.json())
    .then(loadData);

function loadData(heroes) {
    allHeroes = heroes;
    filteredHeroes = [...allHeroes];
    sortHeroes(currentSortColumn, currentSortOrder);
    updateTable();
}

// Update table with current data
function updateTable() {
    const tableBody = document.getElementById('heroes-body');
    tableBody.innerHTML = '';

    const start = (currentPage - 1) * pageSize;
    const end = pageSize === 'all' ? filteredHeroes.length : start + pageSize;
    const displayedHeroes = filteredHeroes.slice(start, end);

    displayedHeroes.forEach(hero => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td><img src="${hero.images.xs}" alt="${hero.name}"></td>
            <td>${hero.name}</td>
            <td>${hero.biography.fullName || ''}</td>
            <td>${hero.powerstats.intelligence}</td>
            <td>${hero.powerstats.strength}</td>
            <td>${hero.powerstats.speed}</td>
            <td>${hero.powerstats.durability}</td>
            <td>${hero.powerstats.power}</td>
            <td>${hero.powerstats.combat}</td>
            <td>${hero.appearance.race || ''}</td>
            <td>${hero.appearance.gender || ''}</td>
            <td>${hero.appearance.height[1] || ''}</td>
            <td>${hero.appearance.weight[1] || ''}</td>
            <td>${hero.biography.placeOfBirth || ''}</td>
            <td>${hero.biography.alignment || ''}</td>
        `;
    });

    updatePagination();
}

// Sort heroes based on column and order
function sortHeroes(column, order) {
    filteredHeroes.sort((a, b) => {
        let valueA, valueB;

        switch (column) {
            case 'icon':
                return 0; // Don't sort by icon
            case 'name':
            case 'fullName':
                valueA = a.name;
                valueB = b.name;
                break;
            case 'intelligence':
            case 'strength':
            case 'speed':
            case 'durability':
            case 'power':
            case 'combat':
                valueA = a.powerstats[column];
                valueB = b.powerstats[column];
                break;
            case 'race':
            case 'gender':
                valueA = a.appearance[column] || '';
                valueB = b.appearance[column] || '';
                break;
            case 'height':
            case 'weight':
                valueA = parseFloat(a.appearance[column][1]) || 0;
                valueB = parseFloat(b.appearance[column][1]) || 0;
                break;
            case 'placeOfBirth':
            case 'alignment':
                valueA = a.biography[column] || '';
                valueB = b.biography[column] || '';
                break;
            default:
                return 0;
        }

        if (valueA < valueB) return order === 'asc' ? -1 : 1;
        if (valueA > valueB) return order === 'asc' ? 1 : -1;
        return 0;
    });

    currentSortColumn = column;
    currentSortOrder = order;
    updateTable();
}

// Update pagination controls
function updatePagination() {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    if (pageSize === 'all') return;

    const totalPages = Math.ceil(filteredHeroes.length / pageSize);

    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updateTable();
        }
    });
    paginationContainer.appendChild(prevButton);

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.disabled = i === currentPage;
        pageButton.addEventListener('click', () => {
            currentPage = i;
            updateTable();
        });
        paginationContainer.appendChild(pageButton);
    }

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            updateTable();
        }
    });
    paginationContainer.appendChild(nextButton);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('search').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filteredHeroes = allHeroes.filter(hero => hero.name.toLowerCase().includes(searchTerm));
        currentPage = 1;
        updateTable();
    });

    document.getElementById('page-size').addEventListener('change', (e) => {
        pageSize = e.target.value === 'all' ? 'all' : parseInt(e.target.value);
        currentPage = 1;
        updateTable();
    });

    document.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const column = th.dataset.sort;
            const order = column === currentSortColumn && currentSortOrder === 'asc' ? 'desc' : 'asc';
            sortHeroes(column, order);
        });
    });
});