// Game State (erweitert für alle Spiele)
let gameState = {
    playerChips: 1000,
    pot: 0,
    playerCards: [],
    communityCards: [],
    currentBet: 0,
    gameRound: 'waiting',
    gameActive: false
};

// Blackjack State
let blackjackState = {
    deck: [],
    playerHand: [],
    dealerHand: [],
    currentBet: 0,
    gameActive: false
};

// Roulette State
let rouletteState = {
    numbers: Array.from({length: 37}, (_, i) => i),
    redNumbers: [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36],
    blackNumbers: [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35],
    bets: {},
    spinning: false
};

// Slots State
let slotsState = {
    symbols: ['🍒', '🍋', '🍊', '🍇', '🔔', '⭐', '💎'],
    reels: [null, null, null],
    spinning: false,
    betAmount: 10
};

// Card & deck constants
const suits = ['♠', '♥', '♦', '♣'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
let deck = [];

// Navigation functions
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

    // Initialize game-specific states
    if (game === 'blackjack') initializeBlackjack();
    if (game === 'roulette') initializeRoulette();
    if (game === 'slots') initializeSlots();
}

// POKER FUNCTIONS (bestehende Funktionen bleiben unverändert)
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
    return `<div class="card ${card.color}">
        <div style="font-size: 0.95rem">${card.value}</div>
        <div class="suit">${card.suit}</div>
    </div>`;
}

function formatNumber(num) {
    return new Intl.NumberFormat().format(num);
}

// BLACKJACK FUNCTIONS
function initializeBlackjack() {
    blackjackState.currentBet = 0;
    blackjackState.gameActive = false;
    updateBlackjackDisplay();
}

function createBlackjackDeck() {
    blackjackState.deck = [];
    for (let suit of suits) {
        for (let value of values) {
            blackjackState.deck.push({
                value: value,
                suit: suit,
                color: (suit === '♥' || suit === '♦') ? 'red' : 'black'
            });
        }
    }
    shuffleBlackjackDeck();
}

function shuffleBlackjackDeck() {
    for (let i = blackjackState.deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [blackjackState.deck[i], blackjackState.deck[j]] = [blackjackState.deck[j], blackjackState.deck[i]];
    }
}

function calculateHandValue(hand) {
    let total = 0;
    let aces = 0;

    for (let card of hand) {
        if (['J', 'Q', 'K'].includes(card.value)) {
            total += 10;
        } else if (card.value === 'A') {
            total += 11;
            aces++;
        } else {
            total += parseInt(card.value);
        }
    }

    while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
    }

    return total;
}

function setBet(amount) {
    if (gameState.playerChips >= amount && !blackjackState.gameActive) {
        blackjackState.currentBet = amount;
        updateBlackjackDisplay();
    }
}

function startBlackjackGame() {
    if (blackjackState.currentBet === 0) {
        alert('Bitte setze einen Einsatz!');
        return;
    }

    if (gameState.playerChips < blackjackState.currentBet) {
        alert('Nicht genug Chips!');
        return;
    }

    gameState.playerChips -= blackjackState.currentBet;
    createBlackjackDeck();
    blackjackState.playerHand = [];
    blackjackState.dealerHand = [];
    blackjackState.gameActive = true;

    // Deal initial cards
    blackjackState.playerHand.push(blackjackState.deck.pop());
    blackjackState.dealerHand.push(blackjackState.deck.pop());
    blackjackState.playerHand.push(blackjackState.deck.pop());
    blackjackState.dealerHand.push(blackjackState.deck.pop());

    updateBlackjackDisplay();
}

function playerHit() {
    if (!blackjackState.gameActive) return;

    blackjackState.playerHand.push(blackjackState.deck.pop());

    if (calculateHandValue(blackjackState.playerHand) > 21) {
        endBlackjackGame('bust');
        return;
    }

    updateBlackjackDisplay();
}

function playerStand() {
    if (!blackjackState.gameActive) return;

    // Dealer plays
    while (calculateHandValue(blackjackState.dealerHand) < 17) {
        blackjackState.dealerHand.push(blackjackState.deck.pop());
    }

    const playerValue = calculateHandValue(blackjackState.playerHand);
    const dealerValue = calculateHandValue(blackjackState.dealerHand);

    if (dealerValue > 21) {
        endBlackjackGame('dealer_bust');
    } else if (playerValue > dealerValue) {
        endBlackjackGame('player_wins');
    } else if (dealerValue > playerValue) {
        endBlackjackGame('dealer_wins');
    } else {
        endBlackjackGame('push');
    }
}

function endBlackjackGame(result) {
    blackjackState.gameActive = false;

    let message = '';
    let winnings = 0;

    switch(result) {
        case 'bust':
            message = 'Bust! Du hast verloren.';
            break;
        case 'dealer_bust':
            message = 'Dealer Bust! Du gewinnst!';
            winnings = blackjackState.currentBet * 2;
            break;
        case 'player_wins':
            message = 'Du gewinnst!';
            winnings = blackjackState.currentBet * 2;
            break;
        case 'dealer_wins':
            message = 'Dealer gewinnt.';
            break;
        case 'push':
            message = 'Unentschieden!';
            winnings = blackjackState.currentBet;
            break;
    }

    gameState.playerChips += winnings;
    blackjackState.currentBet = 0;
    updateBlackjackDisplay();

    setTimeout(() => alert(message), 100);
}

function updateBlackjackDisplay() {
    // Update chips display
    const chipsDisplay = document.getElementById('blackjack-chips');
    if (chipsDisplay) chipsDisplay.textContent = formatNumber(gameState.playerChips);

    // Update bet display
    const betDisplay = document.getElementById('blackjack-bet');
    if (betDisplay) betDisplay.textContent = formatNumber(blackjackState.currentBet);

    // Update hands
    const playerHandDiv = document.getElementById('blackjack-player-hand');
    const dealerHandDiv = document.getElementById('blackjack-dealer-hand');

    if (playerHandDiv && blackjackState.playerHand.length > 0) {
        playerHandDiv.innerHTML = blackjackState.playerHand.map(card => displayCard(card)).join('');
        const playerValue = calculateHandValue(blackjackState.playerHand);
        const playerValueDiv = document.getElementById('player-value');
        if (playerValueDiv) playerValueDiv.textContent = `Wert: ${playerValue}`;
    }

    if (dealerHandDiv && blackjackState.dealerHand.length > 0) {
        if (blackjackState.gameActive) {
            // Hide dealer's second card during game
            let dealerHTML = displayCard(blackjackState.dealerHand[0]);
            dealerHTML += '<div class="card back">?</div>';
            dealerHandDiv.innerHTML = dealerHTML;
        } else {
            dealerHandDiv.innerHTML = blackjackState.dealerHand.map(card => displayCard(card)).join('');
            const dealerValue = calculateHandValue(blackjackState.dealerHand);
            const dealerValueDiv = document.getElementById('dealer-value');
            if (dealerValueDiv) dealerValueDiv.textContent = `Wert: ${dealerValue}`;
        }
    }
}

// Weitere Funktionen für Roulette und Slots hier...
// (gekürzt für Übersichtlichkeit)

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    updateDisplay();
    updateStatus('Willkommen bei Stochastosino! Wähle ein Spiel aus.');
});
