// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Enhanced game state
    let gameState = {
        pizzas: 0,
        pizzasPerClick: 1,
        pizzasPerSecond: 0,
        rebirthLevel: 0,
        rebirthMultiplier: 1,
        discountMultiplier: 1,
        upgrades: {
            // Basic upgrades
            basic: {
                'wooden-spoon': { name: 'Wooden Spoon', owned: 0, cost: 10, pps: 0.1, category: 'basic' },
                'rolling-pin': { name: 'Rolling Pin', owned: 0, cost: 50, pps: 0.5, category: 'basic' },
                'pizza-stone': { name: 'Pizza Stone', owned: 0, cost: 200, pps: 2, category: 'basic' }
            },
            // Automation upgrades
            automation: {
                'auto-chef': { name: 'Auto Chef', owned: 0, cost: 1000, pps: 10, category: 'automation' },
                'robot-kitchen': { name: 'Robot Kitchen', owned: 0, cost: 5000, pps: 50, category: 'automation' },
                'pizza-factory': { name: 'Pizza Factory', owned: 0, cost: 25000, pps: 250, category: 'automation' }
            },
            // Multiplier upgrades
            multipliers: {
                'cheese-boost': { name: 'Cheese Boost', owned: 0, cost: 2000, multiplier: 1.5, category: 'multipliers' },
                'sauce-master': { name: 'Sauce Master', owned: 0, cost: 10000, multiplier: 2, category: 'multipliers' },
                'golden-dough': { name: 'Golden Dough', owned: 0, cost: 50000, multiplier: 3, category: 'multipliers' }
            },
            // Special upgrades (unlocked after rebirth)
            special: {
                'pizza-portal': { name: 'Pizza Portal', owned: 0, cost: 100000, pps: 1000, category: 'special', requiresRebirth: 1 },
                'time-oven': { name: 'Time Oven', owned: 0, cost: 500000, multiplier: 5, category: 'special', requiresRebirth: 2 }
            }
        }
    };

    // Initialize DOM elements
    const pizzaButton = document.getElementById('pizza');
    const pizzaCount = document.getElementById('pizzas');
    const pizzasPerSecond = document.getElementById('pps');
    const multiplierDisplay = document.getElementById('multiply');
    const rebirthButton = document.getElementById('rebirth-btn');
    const rebirthLevel = document.getElementById('rebirth-level');
    const shopContent = document.getElementById('shop-content');
    const tabButtons = document.querySelectorAll('.tab-btn');

    // Setup tabs
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            displayUpgrades(button.dataset.tab);
        });
    });

    // Initialize game
    function initializeGame() {
        displayUpgrades('basic');
        updateDisplay();
        loadGame();
    }

    // Display upgrades for selected category
    function displayUpgrades(category) {
        shopContent.innerHTML = '';
        Object.entries(gameState.upgrades[category]).forEach(([id, upgrade]) => {
            if (!upgrade.requiresRebirth || upgrade.requiresRebirth <= gameState.rebirthLevel) {
                const upgradeElement = createUpgradeElement(id, upgrade);
                shopContent.appendChild(upgradeElement);
            }
        });
    }

    // Create upgrade element
    function createUpgradeElement(id, upgrade) {
        const div = document.createElement('div');
        div.className = 'upgrade';
        div.id = id;

        const actualCost = Math.ceil(upgrade.cost * gameState.discountMultiplier);
        
        div.innerHTML = `
            <h3>${upgrade.name}</h3>
            <p>Cost: <span class="cost">${actualCost}</span> pizzas</p>
            <p>You own: <span class="owned">${upgrade.owned}</span></p>
            <button class="buy-btn">Buy</button>
        `;

        div.querySelector('.buy-btn').addEventListener('click', () => buyUpgrade(id, upgrade));
        return div;
    }

    // Buy upgrade
    function buyUpgrade(id, upgrade) {
        const actualCost = Math.ceil(upgrade.cost * gameState.discountMultiplier);
        if (gameState.pizzas >= actualCost) {
            gameState.pizzas -= actualCost;
            upgrade.owned += 1;
            upgrade.cost = Math.ceil(upgrade.cost * 1.15);

            if (upgrade.pps) {
                gameState.pizzasPerSecond += upgrade.pps * gameState.rebirthMultiplier;
            }
            if (upgrade.multiplier) {
                gameState.rebirthMultiplier *= upgrade.multiplier;
            }

            updateDisplay();
            displayUpgrades(document.querySelector('.tab-btn.active').dataset.tab);
        }
    }

    // Rebirth system
    rebirthButton.addEventListener('click', () => {
        if (gameState.pizzas >= 1000000) { // 1M pizzas required for rebirth
            gameState.rebirthLevel++;
            
            // First rebirth bonus: 20% discount
            if (gameState.rebirthLevel === 1) {
                gameState.discountMultiplier = 0.8;
            }

            // Reset game state but keep rebirth-related stats
            gameState.pizzas = 0;
            gameState.pizzasPerSecond = 0;
            gameState.pizzasPerClick = 1 * gameState.rebirthLevel; // Click power increases with rebirth
            
            // Reset owned upgrades
            Object.values(gameState.upgrades).forEach(category => {
                Object.values(category).forEach(upgrade => {
                    upgrade.owned = 0;
                });
            });

            updateDisplay();
            displayUpgrades('basic');
            updateRebirthBonuses();
        }
    });

    // Update rebirth bonuses display
    function updateRebirthBonuses() {
        const bonusesList = document.getElementById('active-bonuses');
        bonusesList.innerHTML = '';
        
        if (gameState.rebirthLevel >= 1) {
            bonusesList.innerHTML += '<li class="bonus-item">20% Off All Upgrades</li>';
        }
        if (gameState.rebirthLevel >= 2) {
            bonusesList.innerHTML += '<li class="bonus-item">2x Click Power</li>';
        }
        // Add more bonuses for higher rebirth levels
    }

    // Update display
    function updateDisplay() {
        pizzaCount.textContent = Math.floor(gameState.pizzas);
        pizzasPerSecond.textContent = (gameState.pizzasPerSecond * gameState.rebirthMultiplier).toFixed(1);
        multiplierDisplay.textContent = gameState.rebirthMultiplier.toFixed(1);
        rebirthLevel.textContent = gameState.rebirthLevel;
        rebirthButton.disabled = gameState.pizzas < 1000000;
    }

    // Pizza click handler
    pizzaButton.addEventListener('click', () => {
        gameState.pizzas += gameState.pizzasPerClick * gameState.rebirthMultiplier;
        updateDisplay();
    });

    // Auto-production interval
    setInterval(() => {
        gameState.pizzas += (gameState.pizzasPerSecond * gameState.rebirthMultiplier) / 10;
        updateDisplay();
    }, 100);

    // Save game every 30 seconds
    setInterval(() => {
        localStorage.setItem('pizzaClickerSave', JSON.stringify(gameState));
    }, 30000);

    // Load saved game
    function loadGame() {
        const savedGame = localStorage.getItem('pizzaClickerSave');
        if (savedGame) {
            const loadedState = JSON.parse(savedGame);
            gameState = {...gameState, ...loadedState};
            updateDisplay();
            updateRebirthBonuses();
