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
let base = app.getPath("userData");

ipcRenderer.on("ready", (event, message) => {
  setupUI();
  loadFiles();
});

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

function listenDown(e) {
  var sel,
    range;
  if (window.getSelection && (sel = window.getSelection()).rangeCount) {
    // console.log(sel);
    var inner = getInnerMostChild(sel.anchorNode);
    var par = nodeContainsParentWithClass(inner, "wrapper");
    console.log(par);
    if (e.which == 13 && par != null) {
      console.log(par.parentNode.nextSibling);
      if (par.parentNode.nextSibling) {
        setCaretToNode(par.parentNode)
      } else {
        var br = document.createElement("div")
        insertTask(br)
        setCaretToNode(br)
      }
      e.preventDefault()
      e.stopPropagation()
    }
  }
}

function getInnerMostChild(el) {
  while (el.firstChild) {
    el = el.firstChild
  }
  return el
}

function nodeContainsParentWithClass(el, className) {
    while (el.parentNode) {
        if (el.className == className)
            return el;
        el = el.parentNode;
    }
    return null;
}

function setCaretToNode(node) {
  var sel,
    range;
  if (window.getSelection && (sel = window.getSelection()).rangeCount) {
    range = sel.getRangeAt(0);
    range.collapse(true);
    range.setStartAfter(node);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

function listen(e) {
  // console.log(e.target.innerHTML);

  parseInput(e);

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
  con.className = "container-fluid main-con";

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
    var div = document.createElement("div");
    div.className = "";
    var id = makeID("task-", 10);
    var id2 = makeID("input-", 10);
    var inp = `<div class="wrapper" onClick="handleClick(event)" id=${id}><input type="checkbox" class="check-box" id=${id2}/></div>`;
    div.innerHTML = inp;
    insertTask(div);
  }
}

function handleClick(e) {
  e = e || window.event;
  if (e.target.nodeName == "INPUT") {} else if (e.target.id == "popover-bg") {
    var el = document.getElementById("popover");
    el.parentNode.removeChild(el);
    el = document.getElementById("popover-bg");
    el.parentNode.removeChild(el);
  } else {
    console.log(e.target.id);
    var popover = document.createElement("div");
    popover.id = "popover";
    popover.className = "popover";
    var popoverBG = document.createElement("div");
    popoverBG.id = "popover-bg";
    popoverBG.className = "popover-bg";
    popoverBG.addEventListener("click", e => handleClick(e), false);
    document.body.appendChild(popoverBG);
    document.body.appendChild(popover);
  }
}

function insertTask(el) {
  var sel,
    range;
  if (window.getSelection && (sel = window.getSelection()).rangeCount) {
    range = sel.getRangeAt(0);
    range.collapse(true);
    if (range.startOffset == 1 || true) {
      range.insertNode(el);
      range.setStartAfter(el.firstChild);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }
}

function makeID(prefix, length) {
  var result = "" + prefix;
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
