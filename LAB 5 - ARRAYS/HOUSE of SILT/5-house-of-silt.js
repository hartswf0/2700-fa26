// TROUTTOWN CODE  |  Lab 5: HOUSE OF SILT
// After Alison Knowles and James Tenney, The House of Dust (1967).
// Four arrays. makeHouse() picks one item from each and returns an object.
// Every click pushes one more house onto the town. drawHouse() turns the words into drawing.

let materials = ["SILT", "DRIFTWOOD", "CREEK STONE", "TIN", "BRICK", "BOTTLE GLASS"];
let locations = ["ON OPEN GROUND", "ON THE GRAVEL BAR", "BELOW THE DROP-OFF", "ON MAIN STREET"];
let lights = ["USING NATURAL LIGHT", "USING ELECTRICITY", "USING CANDLES", "USING THE TV"];
let inhabitants = ["FRIENDS AND ENEMIES", "TROUT AND THEIR TEACHERS", "CATFISH CLERKS", "THE CURRENT"];

let houses = [];

function makeHouse(x) {
  return {
    x: x,
    material: random(materials),
    location: random(locations),
    light: random(lights),
    inhabitants: random(inhabitants)
  };
}

function quatrain(h) {
  return "A HOUSE OF " + h.material + "\n  " + h.location +
         "\n    " + h.light + "\n      INHABITED BY " + h.inhabitants;
}

function setup() {
  createCanvas(900, 420);
  textFont("monospace");
  houses.push(makeHouse(120));
}

function draw() {
  background(70, 120, 100);                 // the creek
  for (let i = 0; i < houses.length; i++) drawHouse(houses[i]);
  let h = nearest();
  if (h) {
    fill(245); noStroke(); textSize(13); textAlign(LEFT, TOP);
    text(quatrain(h), 16, 16);
  }
  fill(245); textAlign(RIGHT, TOP); textSize(12);
  text("houses.length = " + houses.length + "   click to build", width - 16, 16);
}

function mousePressed() {
  houses.push(makeHouse(mouseX));
}

function groundY(h) {
  if (h.location === "BELOW THE DROP-OFF") return 400;
  if (h.location === "ON THE GRAVEL BAR") return 330;
  return 360;
}

// The words are the switches. Each branch is the only way that word can become a picture.
function drawHouse(h) {
  let gy = groundY(h), w = 90, ht = 70;
  let x = h.x - w / 2, top = gy - ht;

  // location
  noStroke();
  if (h.location === "ON MAIN STREET") { fill(90); rect(h.x - 70, gy, 140, 20); }
  else if (h.location === "ON THE GRAVEL BAR") { fill(140, 130, 100); ellipse(h.x, gy + 10, 180, 40); }
  else { fill(150, 135, 105); rect(h.x - 70, gy, 140, 20); }

  // material
  stroke(40, 30, 20); strokeWeight(2);
  if (h.material === "SILT") { fill(138, 122, 92); arc(h.x, gy, w, ht * 2, PI, TWO_PI); }
  else if (h.material === "DRIFTWOOD") { fill(140, 106, 74); for (let y = top; y < gy; y += 12) rect(x, y, w, 12, 6); }
  else if (h.material === "CREEK STONE") { fill(60); rect(x, top, w, ht); fill(150, 145, 130); for (let y = top + 6; y < gy; y += 14) for (let sx = x + 8; sx < x + w; sx += 18) ellipse(sx, y, 16, 10); }
  else if (h.material === "TIN") { fill(155, 163, 166); rect(x, top, w, ht); for (let sx = x; sx < x + w; sx += 6) line(sx, top, sx, gy); }
  else if (h.material === "BRICK") { fill(157, 90, 67); rect(x, top, w, ht); for (let y = top; y < gy; y += 10) line(x, y, x + w, y); }
  else if (h.material === "BOTTLE GLASS") { fill(44, 58, 48); rect(x, top, w, ht); fill(63, 138, 74, 200); for (let y = top + 7; y < gy; y += 14) for (let sx = x + 7; sx < x + w; sx += 14) circle(sx, y, 11); }
  else { fill(156); rect(x, top, w, ht); fill(40); noStroke(); textAlign(CENTER, CENTER); textSize(10); text(h.material, h.x, top + ht / 2); }   // a word with no routine
  if (h.material !== "SILT") { fill(90, 80, 70); stroke(40, 30, 20); triangle(x - 6, top, x + w + 6, top, h.x, top - 34); }

  // light
  let win = color(60, 70, 64);
  if (h.light === "USING ELECTRICITY") win = color(242, 220, 138);
  if (h.light === "USING CANDLES") win = color(240, 160 + 20 * sin(frameCount * 0.3), 90);
  if (h.light === "USING THE TV") win = color(138, 184, 232 - 30 * (frameCount % 9 < 3));
  if (h.light === "USING NATURAL LIGHT") { noStroke(); fill(235, 245, 200, 40); quad(h.x - 20, 0, h.x + 10, 0, h.x + 60, gy, h.x + 10, gy); }
  stroke(40, 30, 20); fill(win); rect(h.x - 30, top + 18, 18, 16); rect(h.x + 12, top + 18, 18, 16);
  fill(58, 44, 32); rect(h.x - 8, gy - 30, 16, 30);

  // inhabitants
  noStroke();
  if (h.inhabitants === "THE CURRENT") { fill(226, 230, 196, 160); for (let k = 0; k < 12; k++) circle((h.x - 60 + (frameCount * 2 + k * 23) % 140), top + (k * 13) % ht, 3); }
  else {
    let n = h.inhabitants === "FRIENDS AND ENEMIES" ? 3 : 2;
    for (let k = 0; k < n; k++) {
      fill(h.inhabitants === "CATFISH CLERKS" ? color(127, 139, 146) : color(188, 197, 158));
      ellipse(h.x + w / 2 + 16 + k * 16, gy - 16, 12, 32);
      fill(20); circle(h.x + w / 2 + 13 + k * 16, gy - 26, 3);
    }
  }
}

function nearest() {
  let best = null, d = 1e9;
  for (let h of houses) { let dd = abs(h.x - mouseX); if (dd < d) { d = dd; best = h; } }
  return best;
}

// Try it:
// 1. How many different houses can this town hold? (Multiply the four lengths.)
// 2. materials.push("LEGO"); in setup(). Click until a LEGO house appears. What does drawHouse() draw, and why?
// 3. Change h.material to h.materail in one line of drawHouse(). What happens? Why is there no error?
// 4. Knowles built one quatrain at CalArts in 1970. Make setup() push exactly that house first:
//    SILT, ON OPEN GROUND, USING NATURAL LIGHT, FRIENDS AND ENEMIES.
