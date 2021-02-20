// Define DB
let db;

// Opens up an indexedDB called budget
const request = indexedDB.open("budget", 1);

// Create table called 'pending' in 'budget' db
request.onupgradeneeded = (event) => {
  const db = event.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
}

// If database was changed, check if it's online
request.onsuccess = (event) => {
  db = event.target.result;
  if(navigator.onLine) {
    checkDatabase();
  }
}

// If database has an error, log to console
request.onerror = (event) => {
  console.log('Found error: ' + event.target.errorCode);
}

// Function to add a record to the pending table
const saveRecord = (record) => {
  const transaction = db.transaction(["pending"], "readwrite");
  const pendingStore = transaction.objectStore("pending");
  pendingStore.add(record);
}

// Function to get all records from the database 
const checkDatabase = ()=>{
  const transaction = db.transaction(["pending"], "readwrite");
  const pendingStore = transaction.objectStore("pending");
  const getAll = pendingStore.getAll();

  getAll.onsuccess = () =>{
    if(getAll.result.length > 0){
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers:{
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(() => {
        const transaction = db.transaction(["pending"], "readwrite");
        const pendingStore = transaction.objectStore("pending");
        pendingStore.clear();
        location.reload();
      });
    }
  }
}

// Event listener to get all records if database is online
window.addEventListener("online", checkDatabase);