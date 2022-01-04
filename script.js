const ps = new PerfectScrollbar("#cells", {
  //wheelSpeed: 15
});
for (let i = 1; i <= 100; i++) {
  let str = "";
  let n = i;

  while (n > 0) {
    let rem = n % 26;
    if (rem == 0) {
      str = "Z" + str;
      n = Math.floor(n / 26) - 1;
    } else {
      str = String.fromCharCode(rem - 1 + 65) + str;
      n = Math.floor(n / 26);
    }
  }
  $("#columns").append(`<div class="column-name">${str}</div>`);
  $("#rows").append(`<div class="row-name">${i}</div>`);
}
let selectedSheet = "Sheet1";
let totalSheets = 1;

let cellData = { Sheet1: [] };
function loadNewSheet() {
  $("#cells").text("");
  for (let i = 1; i <= 100; i++) {
    let row = $('<div class="cells-row"></div>');
    let rowArray = [];
    for (let j = 1; j <= 100; j++) {
      row.append(
        `<div id="row-${i}-col-${j}" class="input-cell" contenteditable="false"></div>`
      );
      rowArray.push({
        "font-family": "Noto Sans",
        "font-size": 14,
        text: "",
        bold: false,
        italic: false,
        underlined: false,
        alignment: "left",
        color: "#444",
        bgcolor: "#fff",
      });
    }
    cellData[selectedSheet].push(rowArray);
    $("#cells").append(row);
  }
  addEventsToCells();
}
loadNewSheet();
let startcellSelected = false;
let startCell = {};
let endCell = {};
let scrollXRStarted = false;
let scrollXLStarted = false;
$("#cells").scroll(function (e) {
  $("#columns").scrollLeft(this.scrollLeft);
  $("#rows").scrollTop(this.scrollTop);
});

function addEventsToCells() {
  $(".input-cell").dblclick(function (e) {
    $(".input-cell.selected").removeClass(
      "selected top-selected bottom-selected left-selected right-selected"
    );
    $(this).addClass("selected");
    $(this).attr("contenteditable", "true");
    $(this).focus();
  });

  $(".input-cell").blur(function (e) {
    $(this).attr("contenteditable", "false");
    let [rowId, colId] = getRowCol(this);
    cellData[selectedSheet][rowId - 1][colId - 1].text = $(this).text();
  });

  $(".input-cell").click(function (e) {
    let [rowId, colId] = getRowCol(this);
    let [topCell, bottomCell, leftCell, rightCell] = getTopLeftBottomRightCell(
      rowId,
      colId
    );
    if ($(this).hasClass("selected") && e.ctrlKey) {
      unselectCell(this, e, topCell, bottomCell, leftCell, rightCell);
    } else {
      selectCell(this, e, topCell, bottomCell, leftCell, rightCell);
    }
  });
  $(".input-cell").mousemove(function (e) {
    e.preventDefault();
    if (e.buttons == 1) {
      if (e.pageX > $(window).width() - 10 && !scrollXRStarted) {
        scrollXR();
      } else if (e.pageX < 10 && !scrollXLStarted) {
        scrollXL();
      }
      if (!startcellSelected) {
        let [rowId, colId] = getRowCol(this);
        startCell = { rowId: rowId, colId: colId };
        selectAllBetweenCells(startCell, startCell);
        startcellSelected = true;
      }
    } else {
      startcellSelected = false;
    }
  });
  $(".input-cell").mouseenter(function (e) {
    if (e.buttons == 1) {
      if (e.pageX < $(window).width() - 10 && scrollXRStarted) {
        clearInterval(scrollXRInterval);
        scrollXRStarted = false;
      }

      if (e.pageX > 10 && scrollXLStarted) {
        clearInterval(scrollXLInterval);
        scrollXLStarted = false;
      }
      let [rowId, colId] = getRowCol(this);
      endCell = { rowId: rowId, colId: colId };
      selectAllBetweenCells(startCell, endCell);
    }
  });
}

function getRowCol(ele) {
  let id = $(ele).attr("id");
  let idArray = id.split("-");
  let rowId = parseInt(idArray[1]);
  let colId = parseInt(idArray[3]);
  return [rowId, colId];
}

function getTopLeftBottomRightCell(rowId, colId) {
  let topCell = $(`#row-${rowId - 1}-col-${colId}`);
  let bottomCell = $(`#row-${rowId + 1}-col-${colId}`);
  let leftCell = $(`#row-${rowId}-col-${colId - 1}`);
  let rightCell = $(`#row-${rowId}-col-${colId + 1}`);
  return [topCell, bottomCell, leftCell, rightCell];
}

function unselectCell(ele, e, topCell, bottomCell, leftCell, rightCell) {
  if ($(ele).attr("contenteditable") == "false") {
    if ($(ele).hasClass("top-selected")) {
      topCell.removeClass("bottom-selected");
    }

    if ($(ele).hasClass("bottom-selected")) {
      bottomCell.removeClass("top-selected");
    }

    if ($(ele).hasClass("left-selected")) {
      leftCell.removeClass("right-selected");
    }

    if ($(ele).hasClass("right-selected")) {
      rightCell.removeClass("left-selected");
    }

    $(ele).removeClass(
      "selected top-selected bottom-selected left-selected right-selected"
    );
  }
}
function selectCell(ele, e, topCell, bottomCell, leftCell, rightCell) {
  if (e.ctrlKey) {
    // top selected or not
    let topSelected;
    if (topCell) {
      topSelected = topCell.hasClass("selected");
    }

    // bottom selected or not
    let bottomSelected;
    if (bottomCell) {
      bottomSelected = bottomCell.hasClass("selected");
    }

    // left selected or not
    let leftSelected;
    if (leftCell) {
      leftSelected = leftCell.hasClass("selected");
    }

    // right selected or not
    let rightSelected;
    if (rightCell) {
      rightSelected = rightCell.hasClass("selected");
    }

    if (topSelected) {
      $(ele).addClass("top-selected");
      topCell.addClass("bottom-selected");
    }

    if (bottomSelected) {
      $(ele).addClass("bottom-selected");
      bottomCell.addClass("top-selected");
    }

    if (leftSelected) {
      $(ele).addClass("left-selected");
      leftCell.addClass("right-selected");
    }

    if (rightSelected) {
      $(ele).addClass("right-selected");
      rightCell.addClass("left-selected");
    }
  } else {
    $(".input-cell.selected").removeClass(
      "selected top-selected bottom-selected left-selected right-selected"
    );
  }
  $(ele).addClass("selected");
  changeHeader(getRowCol(ele));
}
function changeHeader([rowId, colId]) {
  let data = cellData[selectedSheet][rowId - 1][colId - 1];
  $(".alignment.selected").removeClass("selected");
  $(`.alignment[data-type=${data.alignment}]`).addClass("selected");
  addRemoveSelectFromFontStyle(data, "bold");
  addRemoveSelectFromFontStyle(data, "italic");
  addRemoveSelectFromFontStyle(data, "underlined");
  $("#fill-color").css("border-bottom", `4px solid ${data.bgcolor}`);
  $("#text-color").css("border-bottom", `4px solid ${data.color}`);
  $("#font-family").val(data["font-family"]);
  $("#font-size").val(data["font-size"]);
  $("#font-family").css("font-family", data["font-family"]);
}
function addRemoveSelectFromFontStyle(data, property) {
  if (data[property]) {
    $(`#${property}`).addClass("selected");
  } else {
    $(`#${property}`).removeClass("selected");
  }
}

function selectAllBetweenCells(start, end) {
  $(".input-cell.selected").removeClass(
    "selected top-selected bottom-selected left-selected right-selected"
  );
  for (
    let i = Math.min(start.rowId, end.rowId);
    i <= Math.max(start.rowId, end.rowId);
    i++
  ) {
    for (
      let j = Math.min(start.colId, end.colId);
      j <= Math.max(start.colId, end.colId);
      j++
    ) {
      let [topCell, bottomCell, leftCell, rightCell] =
        getTopLeftBottomRightCell(i, j);
      selectCell(
        $(`#row-${i}-col-${j}`)[0],
        { ctrlKey: true },
        topCell,
        bottomCell,
        leftCell,
        rightCell
      );
    }
  }
}
let scrollXRInterval;
let scrollXLInterval;
function scrollXR() {
  scrollXRStarted = true;
  scrollXRInterval = setInterval(() => {
    $("#cells").scrollLeft($("#cells").scrollLeft() + 100);
  }, 100);
}

function scrollXL() {
  scrollXLStarted = true;
  scrollXLInterval = setInterval(() => {
    $("#cells").scrollLeft($("#cells").scrollLeft() - 100);
  }, 100);
}
$(".data-container").mousemove(function (e) {
  e.preventDefault();
  if (e.buttons == 1) {
    if (e.pageX > $(window).width() - 10 && !scrollXRStarted) {
      scrollXR();
    } else if (e.pageX < 10 && !scrollXLStarted) {
      scrollXL();
    }
  }
});

$(".data-container").mouseup(function (e) {
  clearInterval(scrollXRInterval);
  clearInterval(scrollXLInterval);
  scrollXRStarted = false;
  scrollXLStarted = false;
});
$(".alignment").click(function (e) {
  let alignment = $(this).attr("data-type");
  $(".alignment.selected").removeClass("selected");
  $(this).addClass("selected");
  $(".input-cell.selected").css("text-align", alignment);
  $(".input-cell.selected").each(function (index, data) {
    let [rowId, colId] = getRowCol(data);
    cellData[selectedSheet][rowId - 1][colId - 1].alignment = alignment;
  });
});
$("#bold").click(function (e) {
  setStyle(this, "bold", "font-weight", "bold");
});

$("#italic").click(function (e) {
  setStyle(this, "italic", "font-style", "italic");
});

$("#underlined").click(function (e) {
  setStyle(this, "underlined", "text-decoration", "underline");
});
function setStyle(ele, property, key, value) {
  if ($(ele).hasClass("selected")) {
    $(ele).removeClass("selected");
    $(".input-cell.selected").css(key, "");
    $(".input-cell.selected").each(function (index, data) {
      let [rowId, colId] = getRowCol(data);
      cellData[selectedSheet][rowId - 1][colId - 1][property] = false;
    });
  } else {
    $(ele).addClass("selected");
    $(".input-cell.selected").css(key, value);
    $(".input-cell.selected").each(function (index, data) {
      let [rowId, colId] = getRowCol(data);
      cellData[selectedSheet][rowId - 1][colId - 1][property] = true;
    });
  }
}
$(".pick-color").colorPick({
  initialColor: "#TYPECOLOR",
  allowRecent: true,
  recentMax: 5,
  allowCustomColor: true,
  palette: [
    "#1abc9c",
    "#16a085",
    "#2ecc71",
    "#27ae60",
    "#3498db",
    "#2980b9",
    "#9b59b6",
    "#8e44ad",
    "#34495e",
    "#2c3e50",
    "#f1c40f",
    "#f39c12",
    "#e67e22",
    "#d35400",
    "#e74c3c",
    "#c0392b",
    "#ecf0f1",
    "#bdc3c7",
    "#95a5a6",
    "#7f8c8d",
  ],
  onColorSelected: function () {
    if (this.color != "#TYPECOLOR") {
      if ($(this.element.children()[1]).attr("id") == "fill-color") {
        $(".input-cell.selected").css("background-color", this.color);
        $("#fill-color").css("border-bottom", `4px solid ${this.color}`);
        $(".input-cell.selected").each((index, data) => {
          let [rowId, colId] = getRowCol(data);
          cellData[selectedSheet][rowId - 1][colId - 1].bgcolor = this.color;
        });
      }
      if ($(this.element.children()[1]).attr("id") == "text-color") {
        $(".input-cell.selected").css("color", this.color);
        $("#text-color").css("border-bottom", `4px solid ${this.color}`);
        $(".input-cell.selected").each((index, data) => {
          let [rowId, colId] = getRowCol(data);
          cellData[selectedSheet][rowId - 1][colId - 1].color = this.color;
        });
      }
    }
  },
});
$("#fill-color").click(function (e) {
  setTimeout(() => {
    $(this).parent().click();
  }, 10);
});

$("#text-color").click(function (e) {
  setTimeout(() => {
    $(this).parent().click();
  }, 10);
});

$(".menu-selector").change(function (e) {
  let value = $(this).val();
  let key = $(this).attr("id");
  if (key == "font-family") {
    $("#font-family").css(key, value);
  }
  if (!isNaN(value)) {
    value = parseInt(value);
  }

  $(".input-cell.selected").css(key, value);
  $(".input-cell.selected").each((index, data) => {
    let [rowId, colId] = getRowCol(data);
    cellData[selectedSheet][rowId - 1][colId - 1][key] = value;
  });
});
$(".container").click(function (e) {
  $(".sheet-options-modal").remove();
});
function addSheetEvents() {
  $(".sheet-tab.selected").bind("contextmenu", function (e) {
    e.preventDefault();
    selectSheet(this);
    $(".sheet-options-modal").remove();
    let modal = $(`<div class="sheet-options-modal">
                      <div class="option sheet-rename">Rename</div>
                      <div class="option sheet-delete">Delete</div>
                  </div>`);

    $(".container").append(modal);
    $(".sheet-options-modal").css({
      bottom: 0.04 * $(window).height(),
      left: e.pageX,
    });

    $(".sheet-rename").click(function (e) {
      let renameModal = $(`<div class="sheet-modal-parent">
     <div class="sheet-rename-modal">
        <div class="sheet-modal-title">
          <span>Rename Sheet</span>
       </div>
      <div class="sheet-modal-input-container">
          <span class="sheet-modal-input-title">Rename Sheet To:</span>
         <input class="sheet-modal-input" type="text" />
       </div>
        <div class="sheet-modal-confirmation">
          <div class="button ok-button">OK</div>
         <div class="button cancel-button">Cancel</div>
       </div>
      </div> 
    
    </div> `);
      $(".container").append(renameModal);
      $(".sheet-modal-input").focus();
      $(".cancel-button").click(function (e) {
        $(".sheet-modal-parent").remove();
      });
      $(".ok-button").click(function (e) {
        renameSheet();
      });
    });
    $(".sheet-delete").click(function (e) {
      let deleteModal = $(`<div class="sheet-modal-parent">
      <div class="sheet-delete-modal">
        <div class="sheet-modal-title">
          <span>Delete Sheet</span>
        </div>
        <div class="sheet-delete-message">
          <div class="delete-icon"><img src="https://img.icons8.com/ios-glyphs/30/000000/filled-trash.png"/></div>
          <span>Are you sure you want to delete?</span>
        </div>
        <div class="sheet-delete-confirmation">
          <div class="button delete-button">Delete</div>
          <div class="button cancel-button">Cancel</div>
        </div>
      </div> `);
      $(".container").append(deleteModal);
      $(".cancel-button").click(function (e) {
        $(".sheet-modal-parent").remove();
      });
      $(".delete-button").click(function (e) {
        deleteSheet();
      });
    });
  });

  $(".sheet-tab").click(function (e) {
    if (!$(this).hasClass("selected")) {
      selectSheet(this);
    }
  });
}
function selectSheet(ele) {
  $(".sheet-tab.selected").removeClass("selected");
  $(ele).addClass("selected");
  selectedSheet = $(ele).text();
  loadSheet();
}

addSheetEvents();

function loadSheet() {
  $("#cells").text("");
  let data = cellData[selectedSheet];
  for (let i = 1; i <= data.length; i++) {
    let row = $('<div class="cells-row"></div>');
    for (let j = 1; j <= data[i - 1].length; j++) {
      let cell = $(
        `<div id="row-${i}-col-${j}" class="input-cell" contenteditable="false">${
          data[i - 1][j - 1].text
        }</div>`
      );
      cell.css({
        "font-family": data[i - 1][j - 1]["font-family"],
        "font-size": data[i - 1][j - 1]["font-size"] + "px",
        "background-color": data[i - 1][j - 1]["bgcolor"],
        color: data[i - 1][j - 1]["color"],
        "font-weight": data[i - 1][j - 1].bold ? "bold" : "",
        "font-style": data[i - 1][j - 1].italic ? "italic" : "",
        "text-decoration": data[i - 1][j - 1].underlined ? "underline" : "",
        "text-align": data[i - 1][j - 1].alignment,
      });
      row.append(cell);
    }
    $("#cells").append(row);
  }
  addEventsToCells();
}
$(".container").click(function (e) {
  $(".sheet-option-modal").remove();
});

$(".add-sheet").click(function (e) {
  totalSheets++;
  cellData[`Sheet${totalSheets}`] = [];
  selectedSheet = `Sheet${totalSheets}`;
  loadNewSheet();
  $(".sheet-tab.selected").removeClass("selected");
  $(".sheet-tab-container").append(
    `<div class="sheet-tab selected">Sheet${totalSheets}</div>`
  );

  addSheetEvents();
});
function renameSheet() {
  let newSheetName = $(".sheet-modal-input").val();
  if (newSheetName && !Object.keys(cellData).includes(newSheetName)) {
    save = false;
    let newCellData = {};
    for (let i of Object.keys(cellData)) {
      if (i == selectedSheet) {
        newCellData[newSheetName] = cellData[selectedSheet];
      } else {
        newCellData[i] = cellData[i];
      }
    }

    cellData = newCellData;

    selectedSheet = newSheetName;
    $(".sheet-tab.selected").text(newSheetName);
    $(".sheet-modal-parent").remove();
  } else {
    $(".rename-error").remove();
    $(".sheet-modal-input-container").append(`
          <div class="rename-error"> Sheet Name is not valid or Sheet already exists! </div>
      `);
  }
}
function deleteSheet() {
  $(".sheet-modal-parent").remove();
  let sheetIndex = Object.keys(cellData).indexOf(selectedSheet);
  let currSelectedSheet = $(".sheet-tab.selected");
  if (sheetIndex == 0) {
    selectSheet(currSelectedSheet.next()[0]);
  } else {
    selectSheet(currSelectedSheet.prev()[0]);
  }
  delete cellData[currSelectedSheet.text()];
  currSelectedSheet.remove();
  totalSheets--;
}
