let csvData = [];
let selectedColumns = {};

function loadCSV() {
    const fileInput = document.getElementById('csvFileInput');
    if (fileInput.files.length === 0) {
        alert("Please select a file first!");
        return;
    }

    Papa.parse(fileInput.files[0], {
        complete: function(results) {
            csvData = results.data;
            if (csvData.length > 0) {
                generateColumnCheckboxes(Object.keys(csvData[0])); // Use Object.keys to extract headers from the first row
            }
        },
        header: true
    });
}

function generateColumnCheckboxes(headers) {
    const container = document.getElementById('columnSelector');
    container.innerHTML = '';
    headers.forEach((header, index) => { // Now headers is definitely an array
        const checkbox = `<div class="form-check">
            <input class="form-check-input" type="checkbox" value="" id="checkbox_${index}" checked>
            <label class="form-check-label" for="checkbox_${index}">
                ${header}
            </label>
        </div>`;
        container.innerHTML += checkbox;
        selectedColumns[header] = true; // Initialize selection state
    });
}

function encodeColumns() {
    let headers = Object.keys(csvData[0]);
    let uniqueValuesPerColumn = {};

    // Initialize and gather unique values for each selected column
    headers.forEach(header => {
        const checkbox = document.getElementById(`checkbox_${headers.indexOf(header)}`);
        if (checkbox.checked) {
            selectedColumns[header] = true;
            uniqueValuesPerColumn[header] = new Set(); // Use a Set to store unique values
        } else {
            selectedColumns[header] = false;
        }
    });

    // Populate the set of unique values
    csvData.forEach(row => {
        headers.forEach(header => {
            if (selectedColumns[header]) {
                uniqueValuesPerColumn[header].add(row[header]);
            }
        });
    });

    // Convert Set objects to arrays for easier processing later
    Object.keys(uniqueValuesPerColumn).forEach(key => {
        uniqueValuesPerColumn[key] = Array.from(uniqueValuesPerColumn[key]);
    });

    // Process data to one-hot encode
    let oneHotEncodedData = csvData.map(row => {
        const newRow = {};
        headers.forEach(header => {
            if (selectedColumns[header]) {
                uniqueValuesPerColumn[header].forEach(value => {
                    newRow[`${header}_${value}`] = (row[header] === value) ? 1 : 0;
                });
            } else {
                newRow[header] = row[header]; // Carry over unselected columns as-is
            }
        });
        return newRow;
    });

    let csv = Papa.unparse(oneHotEncodedData);
    downloadCSV(csv);
}



function downloadCSV(csv) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "encoded_output.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}