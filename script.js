"use strict";

const flipCard = document.querySelector('.flip-card');
const cardFrontText = document.querySelector('#card-front h1');
const cardBackTranslation = document.querySelector('#card-back h1');
const cardBackExample = document.querySelector('#card-back p span');
const btnBack = document.querySelector('#back');
const btnExam = document.querySelector('#exam');
const btnNext = document.querySelector('#next');
const currentWord = document.querySelector('#current-word');
const totalWord = document.querySelector('#total-word');
const wordsProgress = document.querySelector('#words-progress');
const shuffleWords = document.querySelector('#shuffle-words');
const studyMode = document.querySelector('#study-mode');
const examMode = document.querySelector('#exam-mode');
const studyCards = document.querySelector('.study-cards');
const examCardsContainer = document.querySelector('#exam-cards');
const timer = document.querySelector('#time');
const examProgress = document.querySelector('#exam-progress');
const correctPercent = document.querySelector('#correct-percent');
const resultsContentContainer = document.querySelector('.results-content');
const resultsModalContainer = document.querySelector('.results-modal');
const wordStatsTemplate = document.querySelector('#word-stats');
const StatsTimer = document.querySelector('#timer');

let timerId;
let currentIndex = 0;
let selectedCards = [];
let attemptsCounter = {};

const words = [
    { word: "scarce", translation: "недостаточный, скудный", example: "Food and clean water were becoming scarce." },
    { word: "ambiguous", translation: "двусмысленный", example: "His reply to my question was somewhat ambiguous." },
    { word: "concise", translation: "краткий, лаконичный", example: "Make your answers clear and concise." },
    { word: "intrusive", translation: "навязчивый, назойливый", example: "She found some of the interviewer's questions intrusive." },
    { word: "subconscious", translation: "подсознательный", example: "The memory was buried deep within my subconscious." }
];

function updateCard(index) {
    const word = words[index];
    cardFrontText.textContent = word.word;
    cardBackTranslation.textContent = word.translation;
    cardBackExample.textContent = word.example;

    currentWord.textContent = index + 1;
    totalWord.textContent = words.length;
    wordsProgress.value = ((index + 1) / words.length) * 100;

    if (index === 0) {
        btnBack.disabled = true;
    } else {
        btnBack.disabled = false;
    }

    if (index === words.length - 1) {
        btnNext.disabled = true;
    } else {
        btnNext.disabled = false;
    }
}

updateCard(currentIndex);

flipCard.addEventListener('click', function () {
    this.classList.toggle('active');
});

btnNext.addEventListener('click', function () {
    if (currentIndex < words.length - 1) {
        currentIndex++;
        updateCard(currentIndex);
        flipCard.classList.remove('active');
    }
});

btnBack.addEventListener('click', function () {
    if (currentIndex > 0) {
        currentIndex--;
        updateCard(currentIndex);
        flipCard.classList.remove('active');
    }
});

shuffleWords.addEventListener('click', function () {
    words.sort(() => Math.random() - 0.5);
    updateCard(currentIndex);
});

btnExam.addEventListener('click', function () {
    studyMode.classList.add('hidden');
    examMode.classList.remove('hidden');

    studyCards.classList.add('hidden');
    startExamMode();
    startTimer();
});

function startExamMode() {
    examCardsContainer.innerHTML = '';

    const cards = [];

    words.forEach(word => {
        const wordCard = document.createElement('div');
        wordCard.classList.add('card');
        wordCard.textContent = word.word;
        cards.push(wordCard);

        const translationCard = document.createElement('div');
        translationCard.classList.add('card');
        translationCard.textContent = word.translation;
        cards.push(translationCard);
    });

    cards.sort(() => Math.random() - 0.5);

    cards.forEach(card => {
        examCardsContainer.append(card);
    });
}

function startTimer() {
    clearInterval(timerId);
    let minutes = 0;
    let seconds = 0;
    timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    timerId = setInterval(() => {
        seconds++;
        timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        if (seconds === 59) {
            minutes++;
            seconds = 0;
        }
    }, 1000);
}

function showResults() {
    clearInterval(timerId);
    resultsModalContainer.classList.remove('hidden');

    const finalTime = timer.textContent;
    StatsTimer.textContent = finalTime;

    resultsContentContainer.innerHTML = '';

    const englishWords = words.map(item => item.word);

    Object.entries(attemptsCounter).forEach(([word, attempts]) => {
        if (englishWords.includes(word)) {
            const wordStats = wordStatsTemplate.content.cloneNode(true);
            wordStats.querySelector('.word span').textContent = word;
            wordStats.querySelector('.attempts span').textContent = attempts;
            resultsContentContainer.append(wordStats);
        }
    });
}

function makeWordPairs(array) {
    const wordPairs = {};

    array.forEach(({ word, translation }) => {
        wordPairs[word] = translation;
        wordPairs[translation] = word;
    });

    return wordPairs;
}

const wordPairs = makeWordPairs(words);

examCardsContainer.addEventListener('click', function (event) {
    const clickedCard = event.target;

    if (!clickedCard.classList.contains('card') || clickedCard.classList.contains('fade-out')) {
        return;
    }

    if (selectedCards.length < 2 && !selectedCards.includes(clickedCard)) {
        clickedCard.classList.add('correct');
        selectedCards.push(clickedCard);
    }

    const word = clickedCard.textContent;

    if (!attemptsCounter[word]) {
        attemptsCounter[word] = 0;
    }

    attemptsCounter[word]++;

    if (selectedCards.length === 2) {
        checkMatch();
    }
});

function checkMatch() {
    const [firstCard, secondCard] = selectedCards;

    const isMatch = wordPairs[firstCard.textContent] === secondCard.textContent;

    if (isMatch) {
        setTimeout(() => {
            firstCard.classList.add('fade-out');
            secondCard.classList.add('fade-out');

            let currentPercent = parseInt(correctPercent.textContent);
            currentPercent += 20;
            correctPercent.textContent = `${currentPercent}%`;

            examProgress.value = currentPercent;

            if (currentPercent === 100) {
                showResults()
            }

            resetSelection();
        }, 500);
    } else {
        secondCard.classList.add('wrong');
        setTimeout(() => {
            secondCard.classList.remove('wrong');
            resetSelection();
        }, 1000);
    }
}

function resetSelection() {
    selectedCards.forEach(card => card.classList.remove('correct'));
    selectedCards = [];
}

