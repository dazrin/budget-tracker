// Get indexedDB
import { useIndexedDb, checkDatabase } from './indexedDB';

let transactions = [];
let myChart;

fetch('/api/transaction')
  .then((response) => response.json())
  .then((data) => {

    transactions = data;
    populateTotal();
    populateTable();
    populateChart();
  });

  function populateTotal() {
    const total = transactions.reduce((total, t) => total + parseInt(t.value), 0);
  
    const totalEl = document.querySelector('#total');
    totalEl.textContent = total;
  }

  function populateTable() {
    const tbody = document.querySelector('#tbody');
    tbody.innerHTML = '';
  
    transactions.forEach((transaction) => {
      let rowColor;
      if (transaction.value < 0) {
        rowColor = 'negative';
      } else rowColor = 'positive';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="${rowColor}">${transaction.name}</td>
        <td  class="${rowColor}">${transaction.value}</td>
      `;
  
      tbody.appendChild(tr);
    });
  }

function populateChart() {
  // Copy and reverse array
  let reversed = transactions.slice().reverse();
  let sum = 0;

  // Create labels to display date on chart
  let labels = reversed.map((t) => {
    let date = new Date(t.date);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  });

  // Create values 
  let data = reversed.map((t) => {
    sum += parseInt(t.value);
    return sum;
  });

  // If an old chart exists, remove it
  if (myChart) {
    myChart.destroy();
  }

  let ctx = document.getElementById("myChart").getContext("2d");

  myChart = new Chart(ctx, {
    type: 'line',
      data: {
        labels,
        datasets: [{
            label: "Total Over Time",
            fill: true,
            backgroundColor: "#6666ff",
            data,
        }],
    },
  });
}

function sendTransaction(isAdding) {
  let nameEl = document.querySelector("#t-name");
  let amountEl = document.querySelector("#t-amount");
  let errorEl = document.querySelector(".form .error");

  // Validation for form
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

  // Convert amount to negative if funds are being subtracted
  if (!isAdding) {
    transaction.value *= -1;
  }

  // Add data to the beginning of array
  transactions.unshift(transaction);

  // Re-populate tables for new record
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
    // Fetch failed -> save to indexed db
      console.log('Fetch failed, saving to IndexedDB');
      useIndexedDb('budget', 'pending', 'add', transaction);

      // Clear form
      nameEl.value = '';
      amountEl.value = '';
    });
}

// Event listener for add button
document.querySelector("#add-btn").onclick = function() {
  sendTransaction(true);
};

// Event listener for subtract button
document.querySelector("#sub-btn").onclick = function() {
  sendTransaction(false);
};

// Listen if app comes online
window.addEventListener('online', checkDatabase);
