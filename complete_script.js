// Game State - Erweitert für alle Spiele
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
    spinning: false,
    betAmount: 10
};

// Slots State
let slotsState = {
    symbols: ['🍒', '🍋', '🍊', '🍇', '🔔', '⭐', '💎'],
    reels: [null, null, null],
    spinning: false,
    betAmount: 10
};

// Card deck constants
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

    // Initialize game-specific features
    if (game === 'blackjack') initializeBlackjack();
    if (game === 'roulette') initializeRoulette();
    if (game === 'slots') initializeSlots();
}

// Utility Functions
function formatNumber(num) {
    return new Intl.NumberFormat().format(num);
}

function displayCard(card) {
    return `<div class="card ${card.color}">
        <div style="font-size: 0.95rem">${card.value}</div>
        <div class="suit">${card.suit}</div>
    </div>`;
}

// POKER FUNCTIONS (Original Functions)
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

function startNewGame() {
    if (gameState.playerChips < 20) {
        updateStatus('Nicht genug Chips für ein neues Spiel!');
        return;
    }

    gameState.playerChips -= 20;
    gameState.pot = 20;
    gameState.currentBet = 20;
    gameState.gameRound = 'pre-flop';
    gameState.gameActive = true;
    gameState.playerCards = [];
    gameState.communityCards = [];

    createDeck();

    // Deal player cards
    gameState.playerCards.push(drawCard());
    gameState.playerCards.push(drawCard());

    updateDisplay();
    updateStatus('Deine Hand wurde ausgeteilt. Bereit für den Flop?');

    document.getElementById('next-btn').disabled = false;
    document.getElementById('fold-btn').disabled = false;
}

function nextRound() {
    if (!gameState.gameActive) return;

    if (gameState.gameRound === 'pre-flop') {
        // Flop - 3 cards
        gameState.communityCards.push(drawCard());
        gameState.communityCards.push(drawCard());
        gameState.communityCards.push(drawCard());
        gameState.gameRound = 'flop';
        updateStatus('Der Flop wurde aufgedeckt!');

    } else if (gameState.gameRound === 'flop') {
        // Turn - 1 card
        gameState.communityCards.push(drawCard());
        gameState.gameRound = 'turn';
        updateStatus('Turn Karte aufgedeckt!');

    } else if (gameState.gameRound === 'turn') {
        // River - 1 card
        gameState.communityCards.push(drawCard());
        gameState.gameRound = 'river';
        updateStatus('River Karte aufgedeckt! Finale Runde.');
        document.getElementById('next-btn').textContent = 'Showdown';

    } else if (gameState.gameRound === 'river') {
        // Showdown
        endPokerGame();
        return;
    }

    updateDisplay();
}

function fold() {
    endPokerGame(false);
}

function endPokerGame(won = true) {
    gameState.gameActive = false;

    if (won) {
        const winnings = gameState.pot * 2;
        gameState.playerChips += winnings;
        updateStatus(`Glückwunsch! Du hast ${formatNumber(winnings)} Chips gewonnen!`);
    } else {
        updateStatus('Du hast gefoldet. Spiel beendet.');
    }

    gameState.pot = 0;
    gameState.gameRound = 'waiting';

    document.getElementById('next-btn').disabled = true;
    document.getElementById('fold-btn').disabled = true;
    document.getElementById('next-btn').textContent = 'Next Round';

    updateDisplay();
}

function updateDisplay() {
    document.getElementById('player-chips').textContent = formatNumber(gameState.playerChips);
    document.getElementById('pot-amount').textContent = formatNumber(gameState.pot);
    document.getElementById('game-round').textContent = gameState.gameRound === 'waiting' ? 'Ready' : gameState.gameRound;

    // Update cards display
    const playerCardsDiv = document.getElementById('player-cards');
    const communityCardsDiv = document.getElementById('community-cards');

    if (playerCardsDiv) {
        playerCardsDiv.innerHTML = gameState.playerCards.map(card => displayCard(card)).join('');
    }

    if (communityCardsDiv) {
        communityCardsDiv.innerHTML = gameState.communityCards.map(card => displayCard(card)).join('');
    }
}

function updateStatus(message) {
    const statusDiv = document.getElementById('game-status');
    if (statusDiv) {
        statusDiv.textContent = message;
    }
}

// BLACKJACK FUNCTIONS
function initializeBlackjack() {
    blackjackState.currentBet = 0;
    blackjackState.gameActive = false;
    updateBlackjackDisplay();
}

function setBet(amount) {
    if (gameState.playerChips >= amount && !blackjackState.gameActive) {
        blackjackState.currentBet = amount;
        updateBlackjackDisplay();
    } else if (blackjackState.gameActive) {
        alert('Spiel läuft bereits! Beende erst die aktuelle Runde.');
    } else {
        alert('Nicht genug Chips!');
    }
}

function clearBet() {
    if (!blackjackState.gameActive) {
        blackjackState.currentBet = 0;
        updateBlackjackDisplay();
    }
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

    // Check for blackjack
    if (calculateHandValue(blackjackState.playerHand) === 21) {
        if (calculateHandValue(blackjackState.dealerHand) === 21) {
            endBlackjackGame('push');
        } else {
            endBlackjackGame('blackjack');
        }
        return;
    }

    updateBlackjackDisplay();
    updateDisplay(); // Update main chips display
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
        case 'blackjack':
            message = 'BLACKJACK! Du gewinnst 3:2!';
            winnings = Math.floor(blackjackState.currentBet * 2.5);
            break;
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
    updateDisplay();

    setTimeout(() => alert(message), 100);
}

function updateBlackjackDisplay() {
    // Update chips and bet displays
    const chipsDisplay = document.getElementById('blackjack-chips');
    const betDisplay = document.getElementById('blackjack-bet');
    const statusDisplay = document.getElementById('blackjack-status');

    if (chipsDisplay) chipsDisplay.textContent = formatNumber(gameState.playerChips);
    if (betDisplay) betDisplay.textContent = formatNumber(blackjackState.currentBet);
    if (statusDisplay) {
        statusDisplay.textContent = blackjackState.gameActive ? 'Spiel läuft' : 'Bereit';
    }

    // Update hands
    const playerHandDiv = document.getElementById('blackjack-player-hand');
    const dealerHandDiv = document.getElementById('blackjack-dealer-hand');

    if (playerHandDiv && blackjackState.playerHand.length > 0) {
        playerHandDiv.innerHTML = blackjackState.playerHand.map(card => displayCard(card)).join('');
        const playerValue = calculateHandValue(blackjackState.playerHand);
        const playerValueSpan = document.getElementById('player-value');
        if (playerValueSpan) playerValueSpan.textContent = `(${playerValue})`;
    }

    if (dealerHandDiv && blackjackState.dealerHand.length > 0) {
        if (blackjackState.gameActive) {
            // Hide dealer's second card during game
            let dealerHTML = displayCard(blackjackState.dealerHand[0]);
            dealerHTML += '<div class="card back">?</div>';
            dealerHandDiv.innerHTML = dealerHTML;
            const dealerValueSpan = document.getElementById('dealer-value');
            if (dealerValueSpan) dealerValueSpan.textContent = '(?)';
        } else {
            dealerHandDiv.innerHTML = blackjackState.dealerHand.map(card => displayCard(card)).join('');
            const dealerValue = calculateHandValue(blackjackState.dealerHand);
            const dealerValueSpan = document.getElementById('dealer-value');
            if (dealerValueSpan) dealerValueSpan.textContent = `(${dealerValue})`;
        }
    }
}

// ROULETTE FUNCTIONS
function initializeRoulette() {
    generateNumberGrid();
    updateRouletteDisplay();
}

function generateNumberGrid() {
    const numberGrid = document.getElementById('number-grid');
    if (!numberGrid) return;

    numberGrid.innerHTML = '';

    for (let i = 0; i <= 36; i++) {
        const numberCell = document.createElement('div');
        numberCell.className = 'number-cell';
        numberCell.textContent = i;
        numberCell.onclick = () => placeBet(i, getCurrentBetAmount());

        if (i === 0) {
            numberCell.classList.add('green');
        } else if (rouletteState.redNumbers.includes(i)) {
            numberCell.classList.add('red');
        } else {
            numberCell.classList.add('black');
        }

        numberGrid.appendChild(numberCell);
    }
}

function getCurrentBetAmount() {
    return rouletteState.betAmount;
}

function setRouletteBetAmount(amount) {
    rouletteState.betAmount = amount;
    updateRouletteDisplay();
}

function placeBet(type, amount) {
    if (rouletteState.spinning || gameState.playerChips < amount) {
        if (rouletteState.spinning) {
            alert('Rad dreht sich bereits!');
        } else {
            alert('Nicht genug Chips!');
        }
        return;
    }

    if (!rouletteState.bets[type]) {
        rouletteState.bets[type] = 0;
    }

    rouletteState.bets[type] += amount;
    gameState.playerChips -= amount;
    updateRouletteDisplay();
    updateDisplay();
}

function spinRoulette() {
    if (rouletteState.spinning) return;

    let totalBets = 0;
    for (let bet in rouletteState.bets) {
        totalBets += rouletteState.bets[bet];
    }

    if (totalBets === 0) {
        alert('Bitte setze zuerst einen Einsatz!');
        return;
    }

    rouletteState.spinning = true;
    const spinButton = document.getElementById('spin-btn');
    if (spinButton) {
        spinButton.textContent = 'SPINNING...';
        spinButton.disabled = true;
    }

    const winningNumber = Math.floor(Math.random() * 37);

    // Show spinning animation
    const winningNumberDiv = document.getElementById('winning-number');
    let spinCount = 0;
    const spinInterval = setInterval(() => {
        if (winningNumberDiv) {
            winningNumberDiv.textContent = Math.floor(Math.random() * 37);
        }
        spinCount++;
        if (spinCount > 20) {
            clearInterval(spinInterval);
            finishSpin(winningNumber);
        }
    }, 150);
}

function finishSpin(winningNumber) {
    const color = getRouletteColor(winningNumber);
    const winnings = processRouletteBets(winningNumber, color);

    gameState.playerChips += winnings;
    rouletteState.bets = {};
    rouletteState.spinning = false;

    // Update displays
    const winningNumberDiv = document.getElementById('winning-number');
    const lastNumberDiv = document.getElementById('last-number');
    if (winningNumberDiv) winningNumberDiv.textContent = winningNumber;
    if (lastNumberDiv) lastNumberDiv.textContent = winningNumber;

    const spinButton = document.getElementById('spin-btn');
    if (spinButton) {
        spinButton.textContent = 'SPIN';
        spinButton.disabled = false;
    }

    updateRouletteDisplay();
    updateDisplay();

    if (winnings > 0) {
        setTimeout(() => alert(`Gewinnzahl: ${winningNumber} (${color})
Gewinn: ${formatNumber(winnings)} Chips!`), 300);
    } else {
        setTimeout(() => alert(`Gewinnzahl: ${winningNumber} (${color})
Leider kein Gewinn.`), 300);
    }
}

function getRouletteColor(number) {
    if (number === 0) return 'grün';
    return rouletteState.redNumbers.includes(number) ? 'rot' : 'schwarz';
}

function processRouletteBets(winningNumber, color) {
    let totalWinnings = 0;

    // Number bet (35:1)
    if (rouletteState.bets[winningNumber]) {
        totalWinnings += rouletteState.bets[winningNumber] * 36; // 35:1 + original bet
    }

    // Color bets (1:1)
    const colorKey = color === 'rot' ? 'red' : color === 'schwarz' ? 'black' : null;
    if (colorKey && rouletteState.bets[colorKey]) {
        totalWinnings += rouletteState.bets[colorKey] * 2; // 1:1 + original bet
    }

    // Odd/Even bets (1:1)
    if (winningNumber !== 0) {
        const isEven = winningNumber % 2 === 0;
        if (rouletteState.bets['even'] && isEven) {
            totalWinnings += rouletteState.bets['even'] * 2;
        }
        if (rouletteState.bets['odd'] && !isEven) {
            totalWinnings += rouletteState.bets['odd'] * 2;
        }
    }

    return totalWinnings;
}

function clearAllBets() {
    if (rouletteState.spinning) return;

    // Refund all bets
    for (let betType in rouletteState.bets) {
        gameState.playerChips += rouletteState.bets[betType];
    }

    rouletteState.bets = {};
    updateRouletteDisplay();
    updateDisplay();
}

function updateRouletteDisplay() {
    const chipsDisplay = document.getElementById('roulette-chips');
    const totalBetDisplay = document.getElementById('roulette-total-bet');

    if (chipsDisplay) chipsDisplay.textContent = formatNumber(gameState.playerChips);

    let totalBets = 0;
    for (let bet in rouletteState.bets) {
        totalBets += rouletteState.bets[bet];
    }
    if (totalBetDisplay) totalBetDisplay.textContent = formatNumber(totalBets);

    // Update bet amount displays
    ['red', 'black', 'even', 'odd'].forEach(betType => {
        const betAmountSpan = document.getElementById(`bet-${betType}`);
        if (betAmountSpan) {
            betAmountSpan.textContent = rouletteState.bets[betType] || 0;
            betAmountSpan.style.display = (rouletteState.bets[betType] || 0) > 0 ? 'flex' : 'none';
        }
    });
}

// SLOTS FUNCTIONS
function initializeSlots() {
    slotsState.reels = ['🍒', '🍋', '🍊'];
    updateSlotsDisplay();
}

function setSlotsBetAmount(amount) {
    if (!slotsState.spinning) {
        slotsState.betAmount = amount;
        updateSlotsDisplay();
    }
}

function spinSlots() {
    if (slotsState.spinning || gameState.playerChips < slotsState.betAmount) {
        if (slotsState.spinning) {
            alert('Walzen drehen bereits!');
        } else {
            alert('Nicht genug Chips!');
        }
        return;
    }

    gameState.playerChips -= slotsState.betAmount;
    slotsState.spinning = true;

    const reels = document.querySelectorAll('.reel');
    reels.forEach(reel => reel.classList.add('spinning'));

    const spinButton = document.getElementById('slots-spin-btn');
    if (spinButton) {
        spinButton.textContent = 'SPINNING...';
        spinButton.disabled = true;
    }

    // Simulate spinning animation
    let spinCount = 0;
    const spinInterval = setInterval(() => {
        slotsState.reels = slotsState.reels.map(() => 
            slotsState.symbols[Math.floor(Math.random() * slotsState.symbols.length)]
        );

        document.getElementById('reel-1').textContent = slotsState.reels[0];
        document.getElementById('reel-2').textContent = slotsState.reels[1];
        document.getElementById('reel-3').textContent = slotsState.reels[2];

        spinCount++;

        if (spinCount > 30) {
            clearInterval(spinInterval);
            finishSlotsSpin();
        }
    }, 100);
}

function finishSlotsSpin() {
    const winnings = calculateSlotsWin();
    gameState.playerChips += winnings;
    slotsState.spinning = false;

    const reels = document.querySelectorAll('.reel');
    reels.forEach(reel => reel.classList.remove('spinning'));

    const spinButton = document.getElementById('slots-spin-btn');
    if (spinButton) {
        spinButton.textContent = 'SPIN';
        spinButton.disabled = false;
    }

    updateSlotsDisplay();
    updateDisplay();

    const lastWinDiv = document.getElementById('last-win');
    if (lastWinDiv) lastWinDiv.textContent = formatNumber(winnings);

    if (winnings > 0) {
        let message = `${slotsState.reels.join(' ')}
Gewinn: ${formatNumber(winnings)} Chips!`;
        if (winnings >= slotsState.betAmount * 50) {
            message = `🎉 MEGA GEWINN! 🎉
${message}`;
        } else if (winnings >= slotsState.betAmount * 20) {
            message = `🎊 JACKPOT! 🎊
${message}`;
        }
        setTimeout(() => alert(message), 300);
    } else {
        setTimeout(() => alert(`${slotsState.reels.join(' ')}
Kein Gewinn dieses Mal.`), 300);
    }
}

function calculateSlotsWin() {
    const symbols = slotsState.reels;
    const uniqueSymbols = [...new Set(symbols)];

    if (uniqueSymbols.length === 1) {
        // Jackpot - all same
        const symbol = symbols[0];
        if (symbol === '💎') return slotsState.betAmount * 100;
        if (symbol === '⭐') return slotsState.betAmount * 50;
        if (symbol === '🔔') return slotsState.betAmount * 20;
        return slotsState.betAmount * 20;
    } else if (uniqueSymbols.length === 2) {
        // Two of a kind
        return slotsState.betAmount * 5;
    }

    return 0; // No win
}

function updateSlotsDisplay() {
    const chipsDisplay = document.getElementById('slots-chips');
    const betDisplay = document.getElementById('slots-bet');

    if (chipsDisplay) chipsDisplay.textContent = formatNumber(gameState.playerChips);
    if (betDisplay) betDisplay.textContent = formatNumber(slotsState.betAmount);

    // Update reel displays
    if (document.getElementById('reel-1')) document.getElementById('reel-1').textContent = slotsState.reels[0] || '🍒';
    if (document.getElementById('reel-2')) document.getElementById('reel-2').textContent = slotsState.reels[1] || '🍋';
    if (document.getElementById('reel-3')) document.getElementById('reel-3').textContent = slotsState.reels[2] || '🍊';
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    updateDisplay();
    updateStatus('Willkommen bei Stochastosino! Wähle ein Spiel aus.');

    // Initialize all games
    initializeBlackjack();
    initializeRoulette();
    initializeSlots();
});