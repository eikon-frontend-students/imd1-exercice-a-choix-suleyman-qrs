const rollBtn = document.getElementById("rollBtn");
const resultDiv = document.getElementById("result");
const dice3d = document.getElementById("dice3d");
const diceCube = document.getElementById("diceCube");

// Map dice types to their 3D containers and inner elements
const diceMap = {
  4: { id: "dice3d-d4", el: null, inner: null, faceClass: ".pyramid-face" },
  6: { id: "dice3d-d6", el: null, inner: null, faceClass: ".dice-face" },
  8: { id: "dice3d-d8", el: null, inner: null, faceClass: ".octa-face" },
  10: { id: "dice3d-d10", el: null, inner: null, faceClass: ".penta-face" },
  12: { id: "dice3d-d12", el: null, inner: null, faceClass: ".dodeca-face" },
  20: { id: "dice3d-d20", el: null, inner: null, faceClass: ".icosa-face" },
  100: { id: "dice3d-d100", el: null, inner: null, faceClass: ".percentile-face" }
};

function getDiceElements() {
  for (const sides in diceMap) {
    diceMap[sides].el = document.getElementById(diceMap[sides].id);
    if (sides == 4) diceMap[sides].inner = document.getElementById("dicePyramid");
    if (sides == 6) diceMap[sides].inner = document.getElementById("diceCube");
    if (sides == 8) diceMap[sides].inner = document.getElementById("diceOctahedron");
    if (sides == 10) diceMap[sides].inner = document.getElementById("dicePentagonal");
    if (sides == 12) diceMap[sides].inner = document.getElementById("diceDodecahedron");
    if (sides == 20) diceMap[sides].inner = document.getElementById("diceIcosahedron");
    if (sides == 100) diceMap[sides].inner = document.getElementById("dicePercentile");
  }
}
getDiceElements();

function parseBonus(bonusStr) {
  const match = bonusStr.match(/([+-]?\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function rollDice(sides, count, bonus) {
  let total = 0;
  let rolls = [];
  for (let i = 0; i < count; i++) {
    const roll = Math.floor(Math.random() * sides) + 1;
    rolls.push(roll);
    total += roll;
  }
  total += bonus;
  return { total, rolls };
}

function getCubeRotation(face) {
  // Returns the rotation for each face of a d6
  switch (face) {
    case 1:
      return "rotateX(0deg) rotateY(0deg)";
    case 2:
      return "rotateY(180deg)";
    case 3:
      return "rotateY(-90deg)";
    case 4:
      return "rotateY(90deg)";
    case 5:
      return "rotateX(-90deg)";
    case 6:
      return "rotateX(90deg)";
    default:
      return "";
  }
}

function hideAllDice() {
  for (const sides in diceMap) {
    diceMap[sides].el.style.display = "none";
    diceMap[sides].el.classList.add("hide");
  }
}

function animateDice(sides, roll) {
  hideAllDice();
  const dice = diceMap[sides];
  if (!dice) return;
  dice.el.style.display = "inline-block";
  setTimeout(() => dice.el.classList.remove("hide"), 10);

  // Set the rolled number on all faces for visual consistency
  if (sides == 4) {
    // For d4, set the number inside the <span>
    const faces = dice.inner.querySelectorAll(dice.faceClass);
    faces.forEach(face => {
      const span = face.querySelector('span');
      if (span) span.textContent = roll;
    });
  } else {
    const faces = dice.inner.querySelectorAll(dice.faceClass);
    faces.forEach(face => face.textContent = roll);
  }

  // Pick a transform for the rolled face (for demo, only 2 faces per dice except d6)
  let transform = "";
  let extra = ` rotateZ(${Math.floor(Math.random() * 360)}deg)`;
  switch (parseInt(sides, 10)) {
    case 4:
      if (roll === 1) transform = "rotateY(0deg) rotateX(0deg)";
      else if (roll === 2) transform = "rotateY(120deg) rotateX(0deg)";
      else if (roll === 3) transform = "rotateY(240deg) rotateX(0deg)";
      else transform = "rotateX(-90deg)";
      dice.inner.style.transform = transform + extra;
      break;
    case 6:
      dice.inner.style.transform = getCubeRotation(roll) + extra;
      break;
    case 8:
      transform = roll % 2 === 1 ? "rotateX(0deg)" : "rotateX(180deg)";
      dice.inner.style.transform = transform + extra;
      break;
    case 10:
      transform = roll % 2 === 1 ? "rotateX(0deg)" : "rotateX(180deg)";
      dice.inner.style.transform = transform + extra;
      break;
    case 12:
      transform = roll % 2 === 1 ? "rotateX(0deg)" : "rotateX(180deg)";
      dice.inner.style.transform = transform + extra;
      break;
    case 20:
      transform = roll % 2 === 1 ? "rotateX(0deg)" : "rotateX(180deg)";
      dice.inner.style.transform = transform + extra;
      break;
    case 100:
      const face = Math.ceil(roll / 10);
      transform = `rotateY(${(face - 1) * 36}deg)`;
      dice.inner.style.transform = transform + extra;
      break;
    default:
      break;
  }
}

rollBtn.addEventListener("click", () => {
  const diceSides = parseInt(
    document.querySelector('input[name="dice"]:checked').value,
    10
  );
  const numDice = parseInt(document.getElementById("numDice").value, 10);
  const bonus = parseBonus(document.getElementById("bonus").value);

  const { total, rolls } = rollDice(diceSides, numDice, bonus);

  // 3D dice animation for all dice types, only if single die
  if (diceMap[diceSides] && numDice === 1) {
    animateDice(diceSides, rolls[0]);
  } else {
    hideAllDice();
  }

  // Display the total result
  resultDiv.innerHTML = total;

  // Create spans for each roll
  const rollsSpans = rolls
    .map((roll) => `<span class="roll">${roll}</span>`)
    .join(" ");

  const rollsDiv = document.getElementById("rolls");
  rollsDiv.innerHTML = rollsSpans;

  // Display bonus if it's not zero
  const bonusResultDiv = document.getElementById("bonusResult");
  if (bonus !== 0) {
    bonusResultDiv.innerHTML = bonus > 0 ? `+${bonus}` : bonus;
  } else {
    bonusResultDiv.innerHTML = "";
  }
});
