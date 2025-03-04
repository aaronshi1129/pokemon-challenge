let currentPokemon = null;
let score = 0;
let timeLeft = 120; // 2 minutes in seconds
let timer = null;
let questionNumber = 0; // Add question counter

async function fetchRandomPokemon() {
    const id = Math.floor(Math.random() * 151) + 1; // First generation Pokemon
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data = await response.json();
    return {
        name: data.name,
        image: data.sprites.front_default
    };
}

async function getRandomOptions() {
    const options = [];
    // Get 3 random Pokemon names
    for (let i = 0; i < 3; i++) {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${Math.floor(Math.random() * 151) + 1}`);
        const data = await response.json();
        options.push(data.name);
    }
    return options;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

async function loadNewQuestion() {
    showLoading(true);
    
    // Update question number
    questionNumber++;
    document.getElementById('question-number').textContent = questionNumber;
    
    // Reset buttons
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';
    document.getElementById('next-question').disabled = false;
    
    try {
        // Get random Pokemon and options
        currentPokemon = await fetchRandomPokemon();
        const wrongOptions = await getRandomOptions();
        const allOptions = shuffleArray([currentPokemon.name, ...wrongOptions]);
        
        // Display Pokemon image
        document.getElementById('pokemon-image').src = currentPokemon.image;
        
        // Create option buttons
        allOptions.forEach(option => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = capitalizeFirstLetter(option);
            button.onclick = () => checkAnswer(option);
            optionsContainer.appendChild(button);
        });
    } catch (error) {
        console.error('Error loading question:', error);
    } finally {
        showLoading(false);
    }
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    loading.style.display = show ? 'flex' : 'none';
}

function checkAnswer(selectedOption) {
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(button => {
        button.disabled = true;
        if (button.textContent.toLowerCase() === currentPokemon.name) {
            button.classList.add('correct');
        }
        if (button.textContent.toLowerCase() === selectedOption && selectedOption !== currentPokemon.name) {
            button.classList.add('wrong');
        }
    });
    
    if (selectedOption === currentPokemon.name) {
        score++;
        document.getElementById('score').textContent = score;
    }
    
    // Enable the next button after answer is selected
    document.getElementById('next-question').disabled = false;
}

function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 30) {
            document.querySelector('.timer').classList.add('warning');
        }
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            showEndGame();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timer').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function showEndGame() {
    const modal = document.getElementById('end-modal');
    modal.style.display = 'flex';
    
    let achievement = '';
    if (score >= 20) {
        achievement = 'Pokemon Master';
    } else if (score >= 15) {
        achievement = 'Ace Trainer';
    } else if (score >= 10) {
        achievement = 'Qualified Pokemon Trainer';
    } else {
        achievement = 'Novice Pokemon Trainer';
    }
    
    document.getElementById('final-score').textContent = score;
    document.getElementById('achievement').textContent = achievement;
    document.getElementById('completion-message').textContent = 
        `Congratulations! You successfully identified ${score} Pokemons within 2 minutes. You are now recognized as a ${achievement}!`;
}

function startGame() {
    document.querySelector('.start-screen').style.display = 'none';
    document.querySelector('.quiz-content').style.display = 'block';
    score = 0;
    questionNumber = 0;
    timeLeft = 120;
    document.getElementById('score').textContent = '0';
    document.getElementById('question-number').textContent = '0';
    document.getElementById('next-question').disabled = true; // Disable next button initially
    startTimer();
    loadNewQuestion();
}

function resetGame() {
    clearInterval(timer);
    document.getElementById('end-modal').style.display = 'none';
    document.querySelector('.start-screen').style.display = 'block';
    document.querySelector('.quiz-content').style.display = 'none';
    document.querySelector('.timer').classList.remove('warning');
}

// Event Listeners
document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('play-again').addEventListener('click', resetGame);
document.getElementById('next-question').addEventListener('click', loadNewQuestion);