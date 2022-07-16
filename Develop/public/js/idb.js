const Indexdb = window.Indexdb || window.mozIndexdb || window.webkitIndexdb || window.msIndexdb
let db ;
const request = Indexdb.open("budget", 1)
request.onupgradeneeded = ({target}) => {
    let db = target.result;
    db.createObjectStore("pending", {auto_increment: true})
}
request.onsuccess = ({target}) => {
    db = target.result;
    if (navigator.onLine) {checkDatabase()}
}
request.onerror = function (event) {
    console.log("Error:" + event.target.errorcode)
} 

function saveRecord (record) {
    var transaction = db.transaction(["pending"], "readwrite")
    var store = transaction.objectStore("pending")
    store.add(record)
}
function checkDatabase (record) {
    var transaction = db.transaction(["pending"], "readwrite")
    var store = transaction.objectStore("pending")
    var getAllRecords = store.getAllRecords()
    getAllRecords.onsuccess = function (){
    if (getAllRecords.result.length > 0) {
        fetch("api/transaction/bulk", {
            method: "POST",
            body: JSON.stringify(getAllRecords.result),
            headers: {
                accept: "application/json",
                "content-type": "application/json"
            }
        }).then(res => {
            return res.json()
        }).then(() => {
            var transaction = db.transaction(["pending"], "readwrite")
            var store = transaction.objectStore("pending")
            store.clear()
        })
    }
    }
}
window.addEventListener("online", checkDatabase)