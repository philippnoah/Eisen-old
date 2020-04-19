// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
const fs = require("fs");
const {ipcRenderer} = require("electron");
const remote = require("electron").remote;
const app = remote.app;

// global vars
let base = app.getPath("userData")

ipcRenderer.on("ready", (event, message) => {
  setupUI()
  loadFiles()
})

function readFile(num) {
  try {
    var path = base + "ta-" + num + ".txt";
    if (fs.existsSync(path)) {
      var data = fs.readFileSync(path);
      document.getElementById("ta-" + num).innerHTML = data;
    }
  } catch (e) {
    console.error(e);
  }
}

function loadFiles() {
  readFile(0);
  readFile(1);
  readFile(2);
  readFile(3);
}

function columnWithHeading(num, heading) {
  // column
  var col = document.createElement("div");
  col.className = "col-6 h-100 coller p-0";

  // heading
  var hd = document.createElement("div");
  hd.className = "row";
  var h = document.createElement("p");
  h.innerHTML = heading;
  h.className = "text-center mb-0 position-absolute w-100 header";
  hd.appendChild(h);
  col.appendChild(hd);

  // ta
  var ta = document.createElement("div");
  var tapa = document.createElement("div");
  ta.id = "ta-" + num;
  ta.className = "ta h-100 pt-5 pl-2";
  ta.contentEditable = "true";
  ta.addEventListener("keyup", e => listen(e), false);
  ta.addEventListener("keydown", e => listenDown(e), false);
  tapa.className = "row";
  tapa.appendChild(ta);
  col.appendChild(ta);

  return col;
}

function listenDown(e) {}

function listen(e) {
  // console.log(e.target.innerHTML);

  parseInput(e)

  var path = base + e.target.id + ".txt";
  let data = e.target.innerHTML;
  saveTxtToPath(data, path);
}

function saveTxtToPath(data, path) {
  try {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(base, {
        recursive: true
      }, err => {
        alert("An error occurred.");
        console.error(err);
      });
    }
    fs.writeFileSync(path, data);
  } catch (e) {
    alert("An error occurred.");
    console.error(e);
  }
}

function setupUI() {
  var con;
  var r;
  var c;

  // container
  con = document.createElement("div");
  con.className = "container-fluid";

  // row
  r = document.createElement("div");
  r.className = "row par-row";
  c = columnWithHeading(0, "Important + Not Urgent");
  r.appendChild(c);
  c = columnWithHeading(1, "Important + Urgent");
  r.appendChild(c);
  con.appendChild(r);

  r = document.createElement("div");
  r.className = "row par-row";
  c = columnWithHeading(2, "Not Important + Not Urgent");
  r.appendChild(c);
  c = columnWithHeading(3, "Not Important + Urgent");
  r.appendChild(c);
  con.appendChild(r);

  document.body.appendChild(con);

}

function parseInput(e) {
  var el;
  // console.log(e.which);
  if (e.which == 189) {
    document.execCommand("delete", null, false);
    var task = document.createElement("div");
    task.className = "wrapper"
    var inp = document.createElement("input");
    inp.type = "checkbox";
    inp.className = "check-box"
    task.appendChild(inp)
    insertHTML(task);
  }
}

function insertHTML(el) {
  var sel,
    range;
  if (window.getSelection && (sel = window.getSelection()).rangeCount) {
    range = sel.getRangeAt(0);
    range.collapse(true);
    if (range.startOffset == 1 || true) {
      range.insertNode(el);
      range.setStartAfter(el);

      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }
}
