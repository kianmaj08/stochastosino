// Game State
let gameState = {
    playerChips: 1000,
    pot: 0,
    playerCards: [],
    communityCards: [],
    currentBet: 0,
    gameRound: 'waiting',
    gameActive: false
};

// Card deck
const suits = ['♠', '♥', '♦', '♣'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
let deck = [];

// Navigation with smooth transitions
function showHome() {
    document.querySelector('.homepage').classList.add('active');
    document.querySelectorAll('.game-section').forEach(section => {
        section.classList.remove('active');
    });
}

function showGame(game) {
    document.querySelector('.homepage').classList.remove('active');
    document.querySelectorAll('.game-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(game).classList.add('active');
}

// Poker Functions
function createDeck() {
    deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({
                value: value,
                suit: suit,
                color: (suit === '♥' || suit === '♦') ? 'red' : 'black'
            });
        }
    }
    shuffleDeck();
}

function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function drawCard() {
    return deck.pop();
}

function displayCard(card) {
    return `
        <div class="card ${card.color}">
            <div style="font-size: 0.95rem;">${card.value}</div>
            <div class="suit">${card.suit}</div>
        </div>
    `;
}

function formatNumber(num) {
    return new Intl.NumberFormat().format(num);
}

function newPokerGame() {
    gameState.pot = 50;
    gameState.playerChips -= 25;
    gameState.currentBet = 25;
    gameState.gameRound = 'Pre-Flop';
    gameState.gameActive = true;
    gameState.playerCards = [];
    gameState.communityCards = [];

    createDeck();
    gameState.playerCards.push(drawCard());
    gameState.playerCards.push(drawCard());

    updateDisplay();
    updateStatus('Your cards have been dealt. Make your move.');

    document.getElementById('foldBtn').disabled = false;
    document.getElementById('callBtn').disabled = false;
    document.getElementById('raiseBtn').disabled = false;
    document.getElementById('newGameBtn').disabled = true;
}

function updateDisplay() {
    document.getElementById('playerChips').textContent = formatNumber(gameState.playerChips);
    document.getElementById('potAmount').textContent = formatNumber(gameState.pot);
    document.getElementById('gameRound').textContent = gameState.gameRound;

    const playerHandDiv = document.getElementById('playerHand');
    if (gameState.playerCards.length > 0) {
        playerHandDiv.innerHTML = gameState.playerCards.map(card => displayCard(card)).join('');
    }

    const communityDiv = document.getElementById('communityCards');
    let communityHTML = '';
    
    for (let i = 0; i < 5; i++) {
        if (i < gameState.communityCards.length) {
            communityHTML += displayCard(gameState.communityCards[i]);
        } else {
            communityHTML += '<div class="card back">?</div>';
        }
    }
    communityDiv.innerHTML = communityHTML;
}

function updateStatus(message) {
    document.getElementById('gameStatus').textContent = message;
}

function fold() {
    gameState.gameActive = false;
    updateStatus('You folded. The house wins this round.');
    endGame();
}

function call() {
    const callAmount = Math.min(gameState.currentBet, gameState.playerChips);
    gameState.playerChips -= callAmount;
    gameState.pot += callAmount;
    
    updateDisplay();
    nextRound();
}

function raise() {
    const raiseAmount = Math.min(50, gameState.playerChips);
    gameState.playerChips -= raiseAmount;
    gameState.pot += raiseAmount;
    gameState.currentBet += raiseAmount;
    
    updateDisplay();
    updateStatus(`You raised by ${formatNumber(raiseAmount)} chips.`);
    
    setTimeout(nextRound, 1500);
}

function nextRound() {
    if (gameState.gameRound === 'Pre-Flop') {
        // Flop - reveal 3 community cards
        gameState.communityCards.push(drawCard());
        gameState.communityCards.push(drawCard());
        gameState.communityCards.push(drawCard());
        gameState.gameRound = 'Flop';
        updateStatus('The flop has been revealed.');
    } else if (gameState.gameRound === 'Flop') {
        // Turn - reveal 4th community card
        gameState.communityCards.push(drawCard());
        gameState.gameRound = 'Turn';
        updateStatus('The turn card is revealed.');
    } else if (gameState.gameRound === 'Turn') {
        // River - reveal 5th community card
        gameState.communityCards.push(drawCard());
        gameState.gameRound = 'River';
        updateStatus('The river card is revealed. Final round!');
    } else if (gameState.gameRound === 'River') {
        // Showdown
        endGame();
        return;
    }
    
    updateDisplay();
    
    // Enable buttons for next action
    if (gameState.gameRound !== 'Showdown') {
        setTimeout(() => {
            document.getElementById('foldBtn').disabled = false;
            document.getElementById('callBtn').disabled = false;
            document.getElementById('raiseBtn').disabled = false;
        }, 1000);
    }
}

function endGame() {
    gameState.gameActive = false;
    
    // Simple win/loss logic (random for demo)
    const playerWins = Math.random() > 0.4; // 60% chance to win
    
    if (playerWins) {
        gameState.playerChips += gameState.pot;
        updateStatus(`You won ${formatNumber(gameState.pot)} chips! 🎉`);
    } else {
        updateStatus('You lost this round. Better luck next time!');
    }
    
    gameState.pot = 0;
    gameState.currentBet = 0;
    gameState.gameRound = 'Showdown';
    
    updateDisplay();
    
    // Disable action buttons and enable new game
    document.getElementById('foldBtn').disabled = true;
    document.getElementById('callBtn').disabled = true;
    document.getElementById('raiseBtn').disabled = true;
    document.getElementById('newGameBtn').disabled = false;
    
    // Auto-reset after 5 seconds if player has chips
    if (gameState.playerChips > 25) {
        setTimeout(() => {
            gameState.gameRound = 'Ready';
            gameState.playerCards = [];
            gameState.communityCards = [];
            updateDisplay();
            updateStatus('Ready for a new game!');
        }, 5000);
    } else {
        updateStatus('Game Over! You ran out of chips.');
    }
}

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', function() {
    updateDisplay();
    updateStatus('Welcome to Stochastosino! Click "New Game" to start playing.');
});
