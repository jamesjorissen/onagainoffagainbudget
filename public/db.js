const indexedDB =
    window.indexedDB ||
    window.mozIndexedDB ||
    window.webkitIndexedDB ||
    window.msIndexedDB ||
    window.shimIndexedDB;

let db;
// create a new db request for a "budget" database.
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (e) {

    const db = e.target.result;
    db.createObjectStore("standby", { autoIncrement: true });
};

request.onsuccess = function (e) {
    db = e.target.result;

    // check if app is online before reading from db
    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function (e) {
    console.log("Oh No! " + e.target.errorCode);
};

function saveRecord(record) {

    const transaction = db.transaction(["standby"], "readwrite");


    const store = transaction.objectStore("standby");


    store.add(record);
}

function checkDatabase() {

    const transaction = db.transaction(["standby"], "readwrite");

    const store = transaction.objectStore("standby");

    const getAll = store.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                },
            })
                .then((response) => response.json())
                .then(() => {

                    const transaction = db.transaction(["standby"], "readwrite");


                    const store = transaction.objectStore("standby");


                    store.clear();
                });
        }
    };
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);