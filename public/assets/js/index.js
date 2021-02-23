// Get indexedDB 
import { useIndexedDb, checkDatabase } from './indexedDB';

// Declare global variables for transactions + chart
let transactions = [];
let myChart;

// Request to get data
fetch('/api/transaction')

// Receive data as json
  .then((response) => response.json())

  .then((data) => {

  // Assign data to global variable
    transactions = data;

  // Call functions
    populateTotal();
    populateTable();
    populateChart();
  });

// Function to populate the total amount
function populateTotal() {

  // Use reduce method to convert transaction to a single value
  const total = transactions.reduce((total, t) => total + parseInt(t.value), 0);

  const totalEl = document.querySelector('#total');
  totalEl.textContent = total;
}

// Function to populate table
function populateTable() {

  // Select body element
  const tbody = document.querySelector('#tbody');

  // Clear body
  tbody.innerHTML = '';

  // Create + populate table row for each transaction
  transactions.forEach((transaction) => {

    // Declare color
    let rowColor;

    // If value is less than zero, assign 'negative' to rowColor
    if (transaction.value < 0) {
      rowColor = 'negative';

    // Otherwise, assign 'positive' to rowColor
    } else rowColor = 'positive';

    // Create and assign color classes to element
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="${rowColor}">${transaction.name}</td>
      <td  class="${rowColor}">${transaction.value}</td>
    `;

    // Append color element
    tbody.appendChild(tr);
  });
}

// Function to populate Chart
function populateChart() {

  // Copy and reverse Array
  const reversed = transactions.slice().reverse();
  let sum = 0;

  // Create data labels
  const labels = reversed.map((t) => {
    const date = new Date(t.date);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  });

  // Create incremental values
  const data = reversed.map((t) => {
    sum += parseInt(t.value);
    return sum;
  });

  // If old chart exists, delete it
  if (myChart) {
    myChart.destroy();
  }

  // Declare chart
  const ctx = document.getElementById('myChart').getContext('2d');

  // Define chart
  myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Total Over Time',
        fill: true,
        backgroundColor: '#6666ff',
        data,
      }],
    },
  });
}

// Function to add a transaction
function sendTransaction(isAdding) {

  // Define elements
  const nameEl = document.querySelector('#t-name');
  const amountEl = document.querySelector('#t-amount');
  const errorEl = document.querySelector('.form .error');

  // Validate form
  if (nameEl.value === '' || amountEl.value === '') {
    errorEl.textContent = 'Missing Information';
    return;
  }

  errorEl.textContent = '';

  // Create record
  const transaction = {
    name: nameEl.value,
    value: amountEl.value,
    date: new Date().toISOString(),
  };

  // When subtracting funds, convert amount to negative number
  if (!isAdding) {
    transaction.value *= -1;
  }

  // Push to beginning of current array of data
  transactions.unshift(transaction);

  // Run populations again to update ui
  populateChart();
  populateTable();
  populateTotal();

  // Send data to server
  fetch('/api/transaction', {
    method: 'POST',
    body: JSON.stringify(transaction),
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.errors) {
        errorEl.textContent = 'Missing Information';
      } else {
      // Clear form
        nameEl.value = '';
        amountEl.value = '';
      }
    })
    .catch((err) => {
    // If fetch request fails, save to indexedDB 
      console.log('Fetch request failed; Saving to indexedDB');
      useIndexedDb('budget', 'pending', 'add', transaction);

      // Clear
      nameEl.value = '';
      amountEl.value = '';
    });
}

// Add button
document.querySelector('#add-btn').onclick = function () {
  sendTransaction(true);
};

// Subtract button
document.querySelector('#sub-btn').onclick = function () {
  sendTransaction(false);
};

// Check if app comes online
window.addEventListener('online', checkDatabase);
