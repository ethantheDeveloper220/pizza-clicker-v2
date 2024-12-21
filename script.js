// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Game state
    let gameState = {
        pizzas: 0,
        pizzasPerClick: 1,
        pizzasPerSecond: 0,
        upgrades: {
            'auto-chef': { owned: 0, cost: 15, pps: 0.1 },
            'pizza-oven': { owned: 0, cost: 100, pps: 1 },
            'pizzeria': { owned: 0, cost: 500, pps: 5 }
        }
    };

    // DOM elements
    const pizzaButton = document.getElementById('pizza');
    const pizzaCount = document.getElementById('pizzas');
    const pizzasPerSecond = document.getElementById('pps');

    // Click handler
    pizzaButton.addEventListener('click', function() {
        addPizzas(gameState.pizzasPerClick);
        animatePizzaClick();
    });

    // Setup upgrade buttons
    Object.keys(gameState.upgrades).forEach(upgradeId => {
        const upgradeElement = document.getElementById(upgradeId);
        const buyButton = upgradeElement.querySelector('.buy-btn');
        
        buyButton.addEventListener('click', () => buyUpgrade(upgradeId));
        updateUpgradeButton(upgradeId);
    });

    function addPizzas(amount) {
        gameState.pizzas += amount;
        updateDisplay();
    }

    function updateDisplay() {
        pizzaCount.textContent = Math.floor(gameState.pizzas);
        pizzasPerSecond.textContent = gameState.pizzasPerSecond.toFixed(1);
        
        // Update all upgrade buttons
        Object.keys(gameState.upgrades).forEach(upgradeId => {
            updateUpgradeButton(upgradeId);
        });
    }

    function buyUpgrade(upgradeId) {
        const upgrade = gameState.upgrades[upgradeId];
        if (gameState.pizzas >= upgrade.cost) {
            gameState.pizzas -= upgrade.cost;
            upgrade.owned += 1;
            upgrade.cost = Math.ceil(upgrade.cost * 1.15); // 15% price increase
            gameState.pizzasPerSecond += upgrade.pps;
            
            // Update the display
            const upgradeElement = document.getElementById(upgradeId);
            upgradeElement.querySelector('.owned').textContent = upgrade.owned;
            upgradeElement.querySelector('.cost').textContent = upgrade.cost;
            
            updateDisplay();
        }
    }

    function updateUpgradeButton(upgradeId) {
        const upgrade = gameState.upgrades[upgradeId];
        const upgradeElement = document.getElementById(upgradeId);
        const buyButton = upgradeElement.querySelector('.buy-btn');
        
        buyButton.disabled = gameState.pizzas < upgrade.cost;
    }

    function animatePizzaClick() {
        pizzaButton.style.transform = 'scale(0.95)';
        setTimeout(() => {
            pizzaButton.style.transform = 'scale(1)';
        }, 100);
    }

    // Auto-clicker interval (runs every 100ms)
    setInterval(() => {
        addPizzas(gameState.pizzasPerSecond / 10);
    }, 100);

    // Save game every 30 seconds
    setInterval(saveGame, 30000);

    // Load saved game on start
    loadGame();

    function saveGame() {
        localStorage.setItem('pizzaClickerSave', JSON.stringify(gameState));
    }

    function loadGame() {
        const savedGame = localStorage.getItem('pizzaClickerSave');
        if (savedGame) {
            gameState = JSON.parse(savedGame);
            updateDisplay();
        }
    }
});
