// Key name used to save data in browser localStorage
var STORAGE_KEY = "jeeMockTestsData";

// Main array holding all mock test objects
var mockTests = [];

// DOM Elements
var testForm = document.getElementById("testForm");
var testNameInput = document.getElementById("testName");
var testDateInput = document.getElementById("testDate");
var physicsInput = document.getElementById("physicsMarks");
var chemistryInput = document.getElementById("chemistryMarks");
var mathInput = document.getElementById("mathMarks");
var liveTotalEl = document.getElementById("liveTotal");
var formErrorEl = document.getElementById("formError");

var loadSampleBtn = document.getElementById("loadSampleBtn");
var clearAllBtn = document.getElementById("clearAllBtn");
var historyTableBody = document.getElementById("historyTableBody");
var canvas = document.getElementById("performanceChart");

// Initialize the application when the page loads
function initApp() {
  loadTestsFromStorage();

  // Set today's date as default in the date picker
  testDateInput.valueAsDate = new Date();

  updateLiveTotal();
  renderAll();
}

// Load saved mock tests from localStorage
function loadTestsFromStorage() {
  var savedData = localStorage.getItem(STORAGE_KEY);
  if (savedData) {
    mockTests = JSON.parse(savedData);
  } else {
    mockTests = [];
  }
}

// Save current mock tests array to localStorage
function saveTestsToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockTests));
}

// Automatically calculate total marks as the student types
function updateLiveTotal() {
  var phy = Number(physicsInput.value) || 0;
  var chem = Number(chemistryInput.value) || 0;
  var math = Number(mathInput.value) || 0;

  var total = phy + chem + math;
  liveTotalEl.textContent = total;
}

physicsInput.addEventListener("input", updateLiveTotal);
chemistryInput.addEventListener("input", updateLiveTotal);
mathInput.addEventListener("input", updateLiveTotal);

// Handle Add Test form submission
testForm.addEventListener("submit", function (event) {
  event.preventDefault();
  formErrorEl.textContent = "";

  var name = testNameInput.value.trim();
  var date = testDateInput.value;
  var phy = Number(physicsInput.value);
  var chem = Number(chemistryInput.value);
  var math = Number(mathInput.value);

  // Basic validation
  if (name === "") {
    formErrorEl.textContent = "Please enter a mock test name or number.";
    return;
  }

  if (date === "") {
    formErrorEl.textContent = "Please select an exam date.";
    return;
  }

  if (
    physicsInput.value === "" ||
    chemistryInput.value === "" ||
    mathInput.value === ""
  ) {
    formErrorEl.textContent = "Please enter marks for all three subjects.";
    return;
  }

  if (
    phy < 0 || phy > 100 ||
    chem < 0 || chem > 100 ||
    math < 0 || math > 100
  ) {
    formErrorEl.textContent = "Each subject's marks must be between 0 and 100.";
    return;
  }

  var total = phy + chem + math;

  // Create a test object and add it to the array
  var newTest = {
    id: Date.now(),
    name: name,
    date: date,
    physics: phy,
    chemistry: chem,
    maths: math,
    total: total
  };

  mockTests.push(newTest);
  saveTestsToStorage();
  renderAll();

  // Reset form fields for next entry
  testForm.reset();
  testDateInput.valueAsDate = new Date();
  updateLiveTotal();
});

// Delete a specific mock test by index
function deleteTest(index) {
  mockTests.splice(index, 1);
  saveTestsToStorage();
  renderAll();
}

// Load sample mock tests so beginners can test the dashboard quickly
loadSampleBtn.addEventListener("click", function () {
  mockTests = [
    {
      id: 1,
      name: "Mock Test 1",
      date: "2026-10-05",
      physics: 54,
      chemistry: 62,
      maths: 48,
      total: 164
    },
    {
      id: 2,
      name: "Mock Test 2",
      date: "2026-10-18",
      physics: 60,
      chemistry: 68,
      maths: 52,
      total: 180
    },
    {
      id: 3,
      name: "Mock Test 3",
      date: "2026-11-01",
      physics: 58,
      chemistry: 65,
      maths: 50,
      total: 173
    },
    {
      id: 4,
      name: "Mock Test 4",
      date: "2026-11-15",
      physics: 72,
      chemistry: 76,
      maths: 64,
      total: 212
    }
  ];
  saveTestsToStorage();
  renderAll();
});

// Clear all tests
clearAllBtn.addEventListener("click", function () {
  mockTests = [];
  saveTestsToStorage();
  renderAll();
});

// Master function to update every section on the page
function renderAll() {
  renderDashboard();
  renderAnalysis();
  renderHistoryTable();
  drawPerformanceGraph();
}

// 1. Update Dashboard Cards
function renderDashboard() {
  var totalTestsEl = document.getElementById("totalTestsCount");
  var highestScoreEl = document.getElementById("highestScore");
  var lowestScoreEl = document.getElementById("lowestScore");
  var averageScoreEl = document.getElementById("averageScore");
  var recentScoreEl = document.getElementById("recentScore");
  var overallChangeEl = document.getElementById("overallChange");

  var count = mockTests.length;
  totalTestsEl.textContent = count;

  if (count === 0) {
    highestScoreEl.textContent = "-";
    lowestScoreEl.textContent = "-";
    averageScoreEl.textContent = "-";
    recentScoreEl.textContent = "-";
    overallChangeEl.textContent = "-";
    overallChangeEl.className = "stat-value";
    return;
  }

  var highest = mockTests[0].total;
  var lowest = mockTests[0].total;
  var sum = 0;

  for (var i = 0; i < count; i++) {
    var score = mockTests[i].total;
    sum += score;

    if (score > highest) {
      highest = score;
    }
    if (score < lowest) {
      lowest = score;
    }
  }

  var average = (sum / count).toFixed(1);
  var recent = mockTests[count - 1].total;

  highestScoreEl.textContent = highest;
  lowestScoreEl.textContent = lowest;
  averageScoreEl.textContent = average;
  recentScoreEl.textContent = recent;

  // Overall improvement or decline (comparing latest test vs first test)
  if (count < 2) {
    overallChangeEl.textContent = "Need 2+ tests";
    overallChangeEl.className = "stat-value";
  } else {
    var diff = mockTests[count - 1].total - mockTests[0].total;
    if (diff > 0) {
      overallChangeEl.textContent = "+" + diff + " marks";
      overallChangeEl.className = "stat-value text-positive";
    } else if (diff < 0) {
      overallChangeEl.textContent = diff + " marks";
      overallChangeEl.className = "stat-value text-negative";
    } else {
      overallChangeEl.textContent = "0 (No change)";
      overallChangeEl.className = "stat-value";
    }
  }
}

// 2. Update Performance Analysis Section
function renderAnalysis() {
  var highestTestEl = document.getElementById("analysisHighestTest");
  var lowestTestEl = document.getElementById("analysisLowestTest");
  var avgEl = document.getElementById("analysisAverage");
  var consecutiveEl = document.getElementById("analysisConsecutive");
  var subjectHighestEl = document.getElementById("analysisSubjectHighest");
  var weakestSubjectEl = document.getElementById("analysisWeakestSubject");

  var count = mockTests.length;

  if (count === 0) {
    highestTestEl.textContent = "No data yet";
    lowestTestEl.textContent = "No data yet";
    avgEl.textContent = "No data yet";
    consecutiveEl.textContent = "No data yet";
    subjectHighestEl.textContent = "No data yet";
    weakestSubjectEl.textContent = "No data yet";
    return;
  }

  var highestTest = mockTests[0];
  var lowestTest = mockTests[0];
  var totalSum = 0;

  var maxPhy = mockTests[0].physics;
  var maxChem = mockTests[0].chemistry;
  var maxMath = mockTests[0].maths;

  var sumPhy = 0;
  var sumChem = 0;
  var sumMath = 0;

  for (var i = 0; i < count; i++) {
    var t = mockTests[i];
    totalSum += t.total;

    if (t.total > highestTest.total) {
      highestTest = t;
    }
    if (t.total < lowestTest.total) {
      lowestTest = t;
    }

    if (t.physics > maxPhy) maxPhy = t.physics;
    if (t.chemistry > maxChem) maxChem = t.chemistry;
    if (t.maths > maxMath) maxMath = t.maths;

    sumPhy += t.physics;
    sumChem += t.chemistry;
    sumMath += t.maths;
  }

  highestTestEl.textContent = highestTest.name + " (" + highestTest.total + "/300)";
  lowestTestEl.textContent = lowestTest.name + " (" + lowestTest.total + "/300)";
  avgEl.textContent = (totalSum / count).toFixed(1) + " / 300";

  // Improvement between last two consecutive tests
  if (count < 2) {
    consecutiveEl.textContent = "Add at least 2 tests to compare";
  } else {
    var prevTest = mockTests[count - 2];
    var latestTest = mockTests[count - 1];
    var change = latestTest.total - prevTest.total;
    var sign = change > 0 ? "+" : "";
    consecutiveEl.textContent =
      prevTest.name + " → " + latestTest.name + ": " + sign + change + " marks";
  }

  // Subject-wise highest marks
  subjectHighestEl.textContent =
    "Phy: " + maxPhy + " | Chem: " + maxChem + " | Maths: " + maxMath;

  // Subject needing more improvement (lowest average score)
  var avgPhy = sumPhy / count;
  var avgChem = sumChem / count;
  var avgMath = sumMath / count;

  var weakestName = "Physics";
  var weakestAvg = avgPhy;

  if (avgChem < weakestAvg) {
    weakestName = "Chemistry";
    weakestAvg = avgChem;
  }
  if (avgMath < weakestAvg) {
    weakestName = "Mathematics";
    weakestAvg = avgMath;
  }

  weakestSubjectEl.textContent =
    weakestName + " (Avg: " + weakestAvg.toFixed(1) + "/100)";
}

// 3. Render Mock Test History Table with Vibrant Pills
function renderHistoryTable() {
  historyTableBody.innerHTML = "";

  if (mockTests.length === 0) {
    historyTableBody.innerHTML =
      '<tr><td colspan="7" class="empty-table">No mock tests added yet.</td></tr>';
    return;
  }

  for (var i = 0; i < mockTests.length; i++) {
    var test = mockTests[i];
    var row = document.createElement("tr");

    row.innerHTML =
      "<td><strong>" + escapeHtml(test.name) + "</strong></td>" +
      "<td>" + escapeHtml(test.date) + "</td>" +
      '<td><span class="pill pill-phy">' + test.physics + "</span></td>" +
      '<td><span class="pill pill-chem">' + test.chemistry + "</span></td>" +
      '<td><span class="pill pill-math">' + test.maths + "</span></td>" +
      '<td><span class="pill pill-total">' + test.total + " / 300</span></td>" +
      '<td><button class="btn btn-delete" onclick="deleteTest(' + i + ')">Delete</button></td>';

    historyTableBody.appendChild(row);
  }
}

// Prevent HTML injection in test names
function escapeHtml(text) {
  var div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// 4. Draw Vibrant Line Graph with Gradient Fill using HTML5 Canvas
function drawPerformanceGraph() {
  var ctx = canvas.getContext("2d");

  // Make canvas sharp on high-resolution screens
  var width = canvas.parentElement.clientWidth;
  var height = canvas.parentElement.clientHeight;
  var dpr = window.devicePixelRatio || 1;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  // Clear previous drawing
  ctx.clearRect(0, 0, width, height);

  // Empty state message
  if (mockTests.length === 0) {
    ctx.fillStyle = "#64748b";
    ctx.font = "600 15px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Add mock tests to view your performance graph", width / 2, height / 2);
    return;
  }

  var padLeft = 48;
  var padRight = 25;
  var padTop = 28;
  var padBottom = 45;

  var chartWidth = width - padLeft - padRight;
  var chartHeight = height - padTop - padBottom;
  var maxMarks = 300;

  // Draw horizontal grid lines and Y-axis labels (0 to 300)
  ctx.strokeStyle = "#e2e8f0";
  ctx.fillStyle = "#475569";
  ctx.font = "600 12px Segoe UI, sans-serif";
  ctx.textAlign = "right";
  ctx.lineWidth = 1;

  var steps = 5; // 0, 60, 120, 180, 240, 300
  for (var s = 0; s <= steps; s++) {
    var markValue = (maxMarks / steps) * s;
    var yPos = padTop + chartHeight - (markValue / maxMarks) * chartHeight;

    ctx.beginPath();
    ctx.moveTo(padLeft, yPos);
    ctx.lineTo(width - padRight, yPos);
    ctx.stroke();

    ctx.fillText(markValue, padLeft - 8, yPos + 4);
  }

  // Draw X and Y axes
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(padLeft, padTop);
  ctx.lineTo(padLeft, padTop + chartHeight);
  ctx.lineTo(width - padRight, padTop + chartHeight);
  ctx.stroke();

  // Calculate (x, y) coordinates for each mock test
  var points = [];
  var count = mockTests.length;

  for (var i = 0; i < count; i++) {
    var x;
    if (count === 1) {
      x = padLeft + chartWidth / 2;
    } else {
      x = padLeft + (i / (count - 1)) * chartWidth;
    }

    var y = padTop + chartHeight - (mockTests[i].total / maxMarks) * chartHeight;
    points.push({ x: x, y: y, test: mockTests[i] });
  }

  // Draw soft translucent gradient fill under the line
  if (points.length > 1) {
    var areaGradient = ctx.createLinearGradient(0, padTop, 0, padTop + chartHeight);
    areaGradient.addColorStop(0, "rgba(124, 58, 237, 0.28)");
    areaGradient.addColorStop(0.6, "rgba(37, 99, 235, 0.14)");
    areaGradient.addColorStop(1, "rgba(37, 99, 235, 0.0)");

    ctx.beginPath();
    ctx.moveTo(points[0].x, padTop + chartHeight);
    for (var a = 0; a < points.length; a++) {
      ctx.lineTo(points[a].x, points[a].y);
    }
    ctx.lineTo(points[points.length - 1].x, padTop + chartHeight);
    ctx.closePath();
    ctx.fillStyle = areaGradient;
    ctx.fill();

    // Draw vibrant blue-to-purple connecting line
    var lineGradient = ctx.createLinearGradient(padLeft, 0, width - padRight, 0);
    lineGradient.addColorStop(0, "#2563eb");
    lineGradient.addColorStop(0.5, "#6366f1");
    lineGradient.addColorStop(1, "#9333ea");

    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (var j = 1; j < points.length; j++) {
      ctx.lineTo(points[j].x, points[j].y);
    }
    ctx.stroke();
  }

  // Draw points, score labels, and X-axis test labels
  for (var k = 0; k < points.length; k++) {
    var pt = points[k];

    // Soft glow ring behind point
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(124, 58, 237, 0.2)";
    ctx.fill();

    // Vibrant point circle
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 6.5, 0, Math.PI * 2);
    ctx.fillStyle = "#7c3aed";
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Score text above point
    ctx.fillStyle = "#1e1b4b";
    ctx.font = "bold 12px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(pt.test.total, pt.x, pt.y - 14);

    // X-axis label (Test Name)
    ctx.fillStyle = "#334155";
    ctx.font = "600 11px Segoe UI, sans-serif";
    var label = pt.test.name;
    if (label.length > 12) {
      label = label.substring(0, 10) + "..";
    }
    ctx.fillText(label, pt.x, padTop + chartHeight + 22);
  }
}

// Redraw graph when window is resized so it stays responsive
window.addEventListener("resize", drawPerformanceGraph);

// Start the app
initApp();