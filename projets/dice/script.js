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

  // Set the rolled number on the correct face, others show their own number
  if (sides == 4) {
    const faces = dice.inner.querySelectorAll(dice.faceClass);
    faces.forEach((face, idx) => {
      const span = face.querySelector('span');
      if (span) span.textContent = (idx + 1) === roll ? roll : (idx + 1);
      face.style.display = "flex";
    });
  } else if (sides == 100) {
    const faces = dice.inner.querySelectorAll(dice.faceClass);
    faces.forEach((face, idx) => {
      face.textContent = (idx + 1) === roll ? roll : (idx + 1);
      face.style.display = "flex";
      // Spherical coordinates for even distribution
      const phi = Math.acos(-1 + (2 * (idx + 1) - 1) / 100);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (idx + 1);
      const x = 32 + 28 * Math.sin(phi) * Math.cos(theta);
      const y = 32 + 28 * Math.sin(phi) * Math.sin(theta);
      const z = 32 + 28 * Math.cos(phi);
      face.style.transform = `translate3d(${x - 32}px, ${y - 32}px, ${z - 32}px)`;
    });
    // Animate the sphere rotation to show the rolled face
    const phi = Math.acos(-1 + (2 * roll - 1) / 100);
    const theta = Math.PI * (1 + Math.sqrt(5)) * roll;
    const rotY = (theta * 180 / Math.PI) % 360;
    const rotX = (phi * 180 / Math.PI) - 90;
    dice.inner.style.transform = `rotateY(${-rotY}deg) rotateX(${-rotX}deg) rotateZ(${Math.floor(Math.random() * 360)}deg)`;
    return;
  } else {
    const faces = dice.inner.querySelectorAll(dice.faceClass);
    faces.forEach((face, idx) => {
      face.textContent = (idx + 1) === roll ? roll : (idx + 1);
      face.style.display = "flex";
    });
  }

  // Pick a transform for the rolled face (now accurate for all faces)
  let transform = "";
  let extra = ` rotateZ(${Math.floor(Math.random() * 360)}deg)`;
  switch (parseInt(sides, 10)) {
    case 4:
      // Each face is 120deg apart around Y, last face is bottom
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
      // 8 faces: 4 top, 4 bottom, 45deg steps
      if (roll >= 1 && roll <= 4) {
        transform = `rotateY(${(roll - 1) * 90}deg) rotateX(-35.26deg)`;
      } else {
        transform = `rotateY(${(roll - 5) * 90}deg) rotateX(35.26deg)`;
      }
      dice.inner.style.transform = transform + extra;
      break;
    case 10:
      // 10 faces: 5 top, 5 bottom, 36deg steps
      if (roll >= 1 && roll <= 5) {
        transform = `rotateY(${(roll - 1) * 36}deg) rotateX(-58deg)`;
      } else {
        transform = `rotateY(${(roll - 6) * 36}deg) rotateX(58deg)`;
      }
      dice.inner.style.transform = transform + extra;
      break;
    case 12:
      // 12 faces: 5 top, 5 mid, 2 bottom
      if (roll >= 1 && roll <= 5) {
        transform = `rotateY(${(roll - 1) * 72}deg) rotateX(-58.28deg)`;
      } else if (roll >= 6 && roll <= 10) {
        transform = `rotateY(${(roll - 6) * 72 + 36}deg) rotateX(0deg)`;
      } else {
        transform = `rotateY(${(roll - 11) * 72}deg) rotateX(58.28deg)`;
      }
      dice.inner.style.transform = transform + extra;
      break;
    case 20:
      // 20 faces: 5 top, 5 upper-mid, 5 lower-mid, 5 bottom
      if (roll >= 1 && roll <= 5) {
        transform = `rotateY(${(roll - 1) * 72}deg) rotateX(-53.14deg)`;
      } else if (roll >= 6 && roll <= 10) {
        transform = `rotateY(${(roll - 6) * 72 + 36}deg) rotateX(-26.57deg)`;
      } else if (roll >= 11 && roll <= 15) {
        transform = `rotateY(${(roll - 11) * 72}deg) rotateX(26.57deg)`;
      } else {
        transform = `rotateY(${(roll - 16) * 72 + 36}deg) rotateX(53.14deg)`;
      }
      dice.inner.style.transform = transform + extra;
      break;
    case 100:
      // 100 faces: 3.6deg steps around Y
      transform = `rotateY(${(roll - 1) * 3.6}deg)`;
      dice.inner.style.transform = transform + extra;
      break;
    default:
      break;
  }
}

function showMultipleDice(sides, rolls) {
  // Remove any previous extra dice
  let container = document.getElementById("multiDiceContainer");
  if (container) container.remove();

  // Limit to 10 dice for performance
  const maxDice = 10;
  const count = Math.min(rolls.length, maxDice);

  // Create a container for multiple dice
  container = document.createElement("div");
  container.id = "multiDiceContainer";
  container.style.display = "flex";
  container.style.justifyContent = "center";
  container.style.gap = "16px";
  container.style.marginTop = "16px";

  for (let i = 0; i < count; i++) {
    const roll = rolls[i];
    // Clone the dice 3D structure for the given type
    const diceTemplate = diceMap[sides].el.cloneNode(true);
    diceTemplate.style.display = "inline-block";
    diceTemplate.classList.remove("hide");
    // Animate the dice to show the rolled value
    setTimeout(() => {
      // Find the inner element
      const inner = diceTemplate.querySelector(diceMap[sides].faceClass).parentElement;
      // Set faces
      if (sides == 4) {
        const faces = inner.querySelectorAll(diceMap[sides].faceClass);
        faces.forEach((face, idx) => {
          const span = face.querySelector('span');
          if (span) span.textContent = (idx + 1) === roll ? roll : (idx + 1);
          face.style.display = "flex";
        });
      } else if (sides == 100) {
        const faces = inner.querySelectorAll(diceMap[sides].faceClass);
        faces.forEach((face, idx) => {
          face.textContent = (idx + 1) === roll ? roll : (idx + 1);
          face.style.display = "flex";
          // Spherical coordinates for even distribution
          const phi = Math.acos(-1 + (2 * (idx + 1) - 1) / 100);
          const theta = Math.PI * (1 + Math.sqrt(5)) * (idx + 1);
          const x = 32 + 28 * Math.sin(phi) * Math.cos(theta);
          const y = 32 + 28 * Math.sin(phi) * Math.sin(theta);
          const z = 32 + 28 * Math.cos(phi);
          face.style.transform = `translate3d(${x - 32}px, ${y - 32}px, ${z - 32}px)`;
        });
        // Animate the sphere rotation to show the rolled face
        const phi = Math.acos(-1 + (2 * roll - 1) / 100);
        const theta = Math.PI * (1 + Math.sqrt(5)) * roll;
        const rotY = (theta * 180 / Math.PI) % 360;
        const rotX = (phi * 180 / Math.PI) - 90;
        inner.style.transform = `rotateY(${-rotY}deg) rotateX(${-rotX}deg) rotateZ(${Math.floor(Math.random() * 360)}deg)`;
      } else {
        const faces = inner.querySelectorAll(diceMap[sides].faceClass);
        faces.forEach((face, idx) => {
          face.textContent = (idx + 1) === roll ? roll : (idx + 1);
          face.style.display = "flex";
        });
      }

      // Animate transform for each die
      let transform = "";
      let extra = ` rotateZ(${Math.floor(Math.random() * 360)}deg)`;
      switch (parseInt(sides, 10)) {
        case 4:
          if (roll === 1) transform = "rotateY(0deg) rotateX(0deg)";
          else if (roll === 2) transform = "rotateY(120deg) rotateX(0deg)";
          else if (roll === 3) transform = "rotateY(240deg) rotateX(0deg)";
          else transform = "rotateX(-90deg)";
          inner.style.transform = transform + extra;
          break;
        case 6:
          inner.style.transform = getCubeRotation(roll) + extra;
          break;
        case 8:
          if (roll >= 1 && roll <= 4) {
            transform = `rotateY(${(roll - 1) * 90}deg) rotateX(-35.26deg)`;
          } else {
            transform = `rotateY(${(roll - 5) * 90}deg) rotateX(35.26deg)`;
          }
          inner.style.transform = transform + extra;
          break;
        case 10:
          if (roll >= 1 && roll <= 5) {
            transform = `rotateY(${(roll - 1) * 36}deg) rotateX(-58deg)`;
          } else {
            transform = `rotateY(${(roll - 6) * 36}deg) rotateX(58deg)`;
          }
          inner.style.transform = transform + extra;
          break;
        case 12:
          if (roll >= 1 && roll <= 5) {
            transform = `rotateY(${(roll - 1) * 72}deg) rotateX(-58.28deg)`;
          } else if (roll >= 6 && roll <= 10) {
            transform = `rotateY(${(roll - 6) * 72 + 36}deg) rotateX(0deg)`;
          } else {
            transform = `rotateY(${(roll - 11) * 72}deg) rotateX(58.28deg)`;
          }
          inner.style.transform = transform + extra;
          break;
        case 20:
          if (roll >= 1 && roll <= 5) {
            transform = `rotateY(${(roll - 1) * 72}deg) rotateX(-53.14deg)`;
          } else if (roll >= 6 && roll <= 10) {
            transform = `rotateY(${(roll - 6) * 72 + 36}deg) rotateX(-26.57deg)`;
          } else if (roll >= 11 && roll <= 15) {
            transform = `rotateY(${(roll - 11) * 72}deg) rotateX(26.57deg)`;
          } else {
            transform = `rotateY(${(roll - 16) * 72 + 36}deg) rotateX(53.14deg)`;
          }
          inner.style.transform = transform + extra;
          break;
        // d100 handled above
        default:
          break;
      }
    }, 10);
    container.appendChild(diceTemplate);
  }

  // Add to DOM
  document.querySelector(".dice-3d-container").appendChild(container);
}

rollBtn.addEventListener("click", () => {
  const diceSides = parseInt(
    document.querySelector('input[name="dice"]:checked').value,
    10
  );
  const numDice = parseInt(document.getElementById("numDice").value, 10);
  const bonus = parseBonus(document.getElementById("bonus").value);

  const { total, rolls } = rollDice(diceSides, numDice, bonus);

  // 3D dice animation for all dice types
  if (diceMap[diceSides]) {
    // Remove any previous multi-dice
    const prev = document.getElementById("multiDiceContainer");
    if (prev) prev.remove();

    if (numDice === 1) {
      animateDice(diceSides, rolls[0]);
    } else {
      hideAllDice();
      showMultipleDice(diceSides, rolls);
    }
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
