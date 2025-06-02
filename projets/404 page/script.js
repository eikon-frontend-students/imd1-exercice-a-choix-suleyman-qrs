const diceContainer = document.getElementById('diceContainer');
const rollButton = document.getElementById('rollButton');
const addDieButton = document.getElementById('addDie');
const clearButton = document.getElementById('clearButton');
const resultDisplay = document.getElementById('result');
const historyDisplay = document.getElementById('history');
const diceOptions = document.querySelectorAll('.dice-option');

let selectedDiceType = 'd6';
let diceElements = [];
let rollHistory = [];

// Initialize with one die
addDie();

// Set up dice type selection
diceOptions.forEach(option => {
    option.addEventListener('click', () => {
        diceOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        selectedDiceType = option.dataset.type;
    });
});

// Add die button
addDieButton.addEventListener('click', addDie);

// Clear button
clearButton.addEventListener('click', () => {
    diceContainer.innerHTML = '';
    diceElements = [];
    resultDisplay.textContent = '';
});

// Roll button
rollButton.addEventListener('click', rollAllDice);

function addDie() {
    const die = document.createElement('div');
    die.className = `dice ${selectedDiceType}`;
    die.textContent = '?';
    die.dataset.type = selectedDiceType;

    if (selectedDiceType === 'd4') {
        die.setAttribute('data-value', '?');
    }

    die.addEventListener('click', function() {
        rollSingleDie(this);
    });

    diceContainer.appendChild(die);
    diceElements.push(die);
}

function rollAllDice() {
    if (diceElements.length === 0) {
        resultDisplay.textContent = 'Add some dice first!';
        return;
    }

    // Disable buttons during roll
    rollButton.disabled = true;
    addDieButton.disabled = true;
    clearButton.disabled = true;

    // Clear previous result
    resultDisplay.textContent = '';

    // Roll each die
    const rollPromises = diceElements.map(die => rollSingleDie(die, true));

    // When all dice are rolled
    Promise.all(rollPromises).then(results => {
        const total = results.reduce((sum, num) => sum + num, 0);
        const rollText = `Rolled: ${results.join(' + ')} = ${total}`;

        // Add to history
        rollHistory.unshift(rollText);
        if (rollHistory.length > 5) rollHistory.pop();
        historyDisplay.innerHTML = rollHistory.join('<br>');

        // Show total
        if (diceElements.length > 1) {
            resultDisplay.textContent = `Total: ${total}`;
        }

        // Re-enable buttons
        rollButton.disabled = false;
        addDieButton.disabled = false;
        clearButton.disabled = false;
    });
}

function rollSingleDie(dieElement, isPartOfGroupRoll = false) {
    return new Promise((resolve) => {
        const dieType = dieElement.dataset.type;
        const sides = parseInt(dieType.substring(1));

        // Add rolling animation
        dieElement.classList.add('rolling');
        if (dieType === 'd4') {
            dieElement.setAttribute('data-value', '...');
        } else {
            dieElement.textContent = '...';
        }

        // Roll for 1 second
        const rollDuration = 1000;
        const rollInterval = setInterval(() => {
            const randomValue = Math.floor(Math.random() * sides) + 1;

            // Show temporary numbers during roll
            if (dieType === 'd4') {
                dieElement.setAttribute('data-value', randomValue);
            } else {
                dieElement.textContent = randomValue;
            }
        }, 100);

        // Stop rolling after duration
        setTimeout(() => {
            clearInterval(rollInterval);

            // Get final number
            const finalValue = Math.floor(Math.random() * sides) + 1;

            // Update display
            if (dieType === 'd4') {
                dieElement.setAttribute('data-value', finalValue);
            } else {
                dieElement.textContent = finalValue;
            }

            // Remove rolling animation
            dieElement.classList.remove('rolling');

            // For single die rolls (not part of a group roll)
            if (!isPartOfGroupRoll) {
                resultDisplay.textContent = `Rolled: ${finalValue}`;

                // Add to history
                rollHistory.unshift(`d${sides}: ${finalValue}`);
                if (rollHistory.length > 5) rollHistory.pop();
                historyDisplay.innerHTML = rollHistory.join('<br>');
            }

            resolve(finalValue);
        }, rollDuration);
    });
}