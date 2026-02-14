// State Management
const STATE_KEY = 'interactive_story_progress';

// Audio Management
const audio = document.getElementById('backgroundAudio');
const unmuteButton = document.getElementById('unmuteButton');
let currentVolume = 0.30;

// Initialize audio
function initAudio() {
    audio.volume = currentVolume;
    audio.play().catch(error => {
        console.log('Autoplay blocked, showing unmute button');
        unmuteButton.style.display = 'block';
    });
}

unmuteButton.addEventListener('click', () => {
    audio.play();
    unmuteButton.style.display = 'none';
});

// Prevent double-tap zoom on mobile
document.addEventListener('touchstart', function(e) {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

// Remove 300ms tap delay
let lastTouchEnd = 0;
document.addEventListener('touchend', function(e) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Hide address bar on mobile
window.scrollTo(0, 1);
window.addEventListener('orientationchange', () => {
    setTimeout(() => window.scrollTo(0, 1), 100);
});

// State Management Functions
function saveProgress(pageNumber, additionalData = {}) {
    const currentState = loadProgress();
    const visitedPages = currentState.visitedPages || [];
    if (!visitedPages.includes(pageNumber)) {
        visitedPages.push(pageNumber);
    }
    
    const state = {
        currentPage: pageNumber,
        isAuthenticated: true,
        visitedPages: visitedPages,
        timestamp: new Date().toISOString(),
        ...additionalData
    };
    
    try {
        localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error('localStorage not available', e);
    }
}

function loadProgress() {
    try {
        const stored = localStorage.getItem(STATE_KEY);
        return stored ? JSON.parse(stored) : { currentPage: 1, isAuthenticated: false, visitedPages: [] };
    } catch (e) {
        return { currentPage: 1, isAuthenticated: false, visitedPages: [] };
    }
}

function isLocalStorageAvailable() {
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
    } catch(e) {
        return false;
    }
}

// Page Transition
function transitionToPage(pageNumber) {
    const app = document.getElementById('app');
    app.style.animation = 'fadeOut 900ms cubic-bezier(0.4, 0.0, 0.2, 1) forwards';
    
    setTimeout(() => {
        renderPage(pageNumber);
        app.style.animation = 'fadeIn 900ms cubic-bezier(0.4, 0.0, 0.2, 1) forwards';
        saveProgress(pageNumber);
        updateVolume(pageNumber);
    }, 900);
}

// Volume progression
function updateVolume(pageNumber) {
    if (pageNumber >= 1 && pageNumber <= 7) {
        const targetVolume = 0.30 + ((0.45 - 0.30) / 6) * (pageNumber - 1);
        audio.volume = targetVolume;
    } else if (pageNumber >= 8) {
        audio.volume = 0.45;
    }
}

// PAGE 1: ENTRY RITUAL
function renderPage1() {
    const app = document.getElementById('app');
    app.style.background = '#000000';
    app.innerHTML = '';
    
    const page = document.createElement('div');
    page.className = 'page';
    
    const text = document.createElement('p');
    text.className = 'text-line stagger-1';
    text.textContent = 'You are not meant to enter here casually.';
    page.appendChild(text);
    
    setTimeout(() => {
        const button = document.createElement('button');
        button.textContent = 'Ask permission';
        button.className = 'stagger-2';
        button.style.animationDelay = '2000ms';
        button.onclick = showAuthInput;
        page.appendChild(button);
    }, 2800);
    
    app.appendChild(page);
}

function showAuthInput() {
    const page = document.querySelector('.page');
    const text = page.querySelector('.text-line');
    const button = page.querySelector('button');
    
    text.classList.add('faded');
    button.style.display = 'none';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter your answer...';
    input.style.animation = 'fadeUp 600ms cubic-bezier(0.4, 0.0, 0.2, 1) forwards';
    input.autofocus = true;
    
    const submitBtn = document.createElement('button');
    submitBtn.textContent = 'Submit';
    submitBtn.style.animation = 'fadeUp 600ms cubic-bezier(0.4, 0.0, 0.2, 1) forwards';
    submitBtn.style.animationDelay = '200ms';
    submitBtn.onclick = () => validateAuth(input);
    
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            validateAuth(input);
        }
    });
    
    page.appendChild(input);
    page.appendChild(submitBtn);
    
    setTimeout(() => input.focus(), 100);
}

function validateAuth(input) {
    const validAnswers = ['rishi', 'flash', 'flash133566'];
    const userInput = input.value.toLowerCase().trim();
    
    if (validAnswers.includes(userInput)) {
        const page = document.querySelector('.page');
        Array.from(page.children).forEach(el => el.classList.add('faded'));
        
        const thinkingText = document.createElement('p');
        thinkingText.textContent = '...thinking';
        thinkingText.style.opacity = '0';
        thinkingText.style.animation = 'fadeIn 900ms cubic-bezier(0.4, 0.0, 0.2, 1) forwards';
        page.appendChild(thinkingText);
        
        setTimeout(() => {
            thinkingText.style.display = 'none';
            const successText = document.createElement('p');
            successText.textContent = 'Come in.';
            successText.style.opacity = '0';
            successText.style.animation = 'fadeIn 900ms cubic-bezier(0.4, 0.0, 0.2, 1) forwards';
            page.appendChild(successText);
            
            setTimeout(() => {
                transitionToPage(2);
            }, 2000);
        }, 3000);
    } else {
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 500);
        
        const existingError = document.querySelector('.error-message');
        if (existingError) existingError.remove();
        
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.textContent = 'The door stays closed.';
        input.parentNode.insertBefore(errorMsg, input.nextSibling);
    }
}

// PAGE 2: THE PAUSE
function renderPage2() {
    const app = document.getElementById('app');
    app.style.background = '';
    app.innerHTML = '';
    
    const page = document.createElement('div');
    page.className = 'page';
    
    const line1 = document.createElement('p');
    line1.className = 'text-line stagger-1';
    line1.textContent = "Don't rush.";
    page.appendChild(line1);
    
    const line2 = document.createElement('p');
    line2.className = 'text-line stagger-2';
    line2.textContent = 'Just stay here for a moment.';
    page.appendChild(line2);
    
    app.appendChild(page);
    
    setTimeout(() => {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-bar-container';
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressContainer.appendChild(progressBar);
        page.appendChild(progressContainer);
        
        setTimeout(() => {
            progressBar.style.width = '100%';
        }, 500);
        
        setTimeout(() => {
            const button = document.createElement('button');
            button.textContent = 'Continue if you trust me';
            button.onclick = () => transitionToPage(3);
            page.appendChild(button);
        }, 4500);
    }, 1000);
}

// PAGE 3: 10 THINGS
function renderPage3() {
    const cards = [
        "Your soft, adorable voice… it lingers even after you stop speaking",
        "The way your body quietly reacts when I guide you 🙇‍♀️",
        "Your sweetness in obeying even the smallest requests 😚",
        "You feel like a breath of fresh air in a noisy world 🍃",
        "You make me laugh 😂",
        "The warmth and softness of Your boobies 😋... impossible to ignore 🤍",
        "Your constant need for closeness and cuddles 🫂💗",
        "Your first asshole fuck story 😅",
        "How easy it is to talk to you… I could stay there forever ✨",
        "Your surrender… every \"yes, sir\" carries trust, and I feel it 🖤"
    ];
    
    let currentCard = 0;
    
    const app = document.getElementById('app');
    app.innerHTML = '';
    
    const page = document.createElement('div');
    page.className = 'page';
    
    const title = document.createElement('h2');
    title.className = 'stagger-1';
    title.textContent = '10 Things I Like About You';
    page.appendChild(title);
    
    const card = document.createElement('div');
    card.className = 'card';
    const cardText = document.createElement('p');
    cardText.textContent = cards[currentCard];
    card.appendChild(cardText);
    page.appendChild(card);
    
    const counter = document.createElement('p');
    counter.style.marginTop = '1rem';
    counter.style.opacity = '0.6';
    counter.textContent = `${currentCard + 1} / ${cards.length}`;
    page.appendChild(counter);
    
    app.appendChild(page);
    
    card.onclick = () => {
        currentCard++;
        if (currentCard < cards.length) {
            cardText.style.opacity = '0';
            setTimeout(() => {
                cardText.textContent = cards[currentCard];
                cardText.style.opacity = '1';
                counter.textContent = `${currentCard + 1} / ${cards.length}`;
                
                if (currentCard === cards.length - 1) {
                    card.classList.add('glow-pulse');
                    setTimeout(() => {
                        const button = document.createElement('button');
                        button.textContent = 'Come closer';
                        button.onclick = () => transitionToPage(4);
                        page.appendChild(button);
                    }, 1000);
                }
            }, 300);
        }
    };
}

// PAGE 4: CLAIM SECTION
function renderPage4() {
    const app = document.getElementById('app');
    app.innerHTML = '';
    app.style.background = '#080809';
    
    const page = document.createElement('div');
    page.className = 'page';
    
    const lines = [
        "You don't lose control.",
        "You place it in my hands.",
        "And I never drop it."
    ];
    
    app.appendChild(page);
    
    let delay = 0;
    lines.forEach((text, index) => {
        setTimeout(() => {
            const line = document.createElement('p');
            line.className = 'text-line';
            line.textContent = text;
            page.appendChild(line);
            
            if (index === lines.length - 1) {
                setTimeout(() => {
                    const button = document.createElement('button');
                    button.textContent = 'Keep reading';
                    button.onclick = () => transitionToPage(5);
                    page.appendChild(button);
                }, 1500);
            }
        }, delay);
        delay += 2000;
    });
}

// PAGE 5: PRIVATE SECTION
function renderPage5() {
    const app = document.getElementById('app');
    app.innerHTML = '';
    app.style.background = '';
    
    const page = document.createElement('div');
    page.className = 'page';
    app.appendChild(page);
    
    const instructions = [
        { text: "Put your phone down for five seconds", duration: 5000 },
        { text: "Take one slow breath", duration: 4000 },
        { text: "Now read the next line", duration: 1000 },
        { text: "Good.", duration: 2000 }
    ];
    
    let currentInstruction = 0;
    
    function showInstruction() {
        if (currentInstruction >= instructions.length) {
            const button = document.createElement('button');
            button.textContent = 'I will listen';
            button.onclick = () => transitionToPage(6);
            page.appendChild(button);
            return;
        }
        
        page.innerHTML = '';
        
        const text = document.createElement('p');
        text.className = 'text-line';
        text.textContent = instructions[currentInstruction].text;
        page.appendChild(text);
        
        const countdown = document.createElement('div');
        countdown.className = 'countdown';
        let timeLeft = Math.ceil(instructions[currentInstruction].duration / 1000);
        countdown.textContent = timeLeft;
        page.appendChild(countdown);
        
        const interval = setInterval(() => {
            timeLeft--;
            if (timeLeft > 0) {
                countdown.textContent = timeLeft;
            } else {
                clearInterval(interval);
            }
        }, 1000);
        
        setTimeout(() => {
            currentInstruction++;
            showInstruction();
        }, instructions[currentInstruction].duration);
    }
    
    showInstruction();
}

// PAGE 6: ENVELOPES
function renderPage6() {
    const app = document.getElementById('app');
    app.innerHTML = '';
    app.style.background = '';
    
    const page = document.createElement('div');
    page.className = 'page';
    
    const title = document.createElement('h2');
    title.className = 'stagger-1';
    title.textContent = 'Choose';
    page.appendChild(title);
    
    const envelopesContainer = document.createElement('div');
    envelopesContainer.className = 'envelopes-container';
    
    const envelopeContents = [
        "You spend so much time holding yourself together.\nChoosing the right words… reacting the right way… pretending you're more composed than you really feel.\n\nYou don't need that here.\n\nHere you can slow down, breathe, and let me hold the moment for you.\n\nI'm not going anywhere.",
        
        "Look at you… following every line properly.\n\nSuch a well behaved girl.\n\nMakes me wonder how long that innocence lasts when I start pushing a little more.",
        
        "Imagine this, my obedient submissive slut. You've been waiting just as I commanded, on your hands and knees in the entryway of your home, heart pounding with anticipation. The door clicks open, and there you are, my sweet girl, positioned perfectly for your Master. Your eyes lift slowly to meet mine, locking in that intense gaze for a lingering moment, full of devotion and desire. Then, as a good sub should, you lower them submissively, casting your lashes down to the floor, exposing the curve of your neck like an offering.\n\nMy very first words are \"Look at you, my little slut, so eager and ready for Master\" and then........."
    ];
    
    const state = loadProgress();
    let openedCount = state.envelopesOpened || 0;
    
    for (let i = 0; i < 3; i++) {
        const envelope = document.createElement('div');
        envelope.className = 'envelope';
        
        const icon = document.createElement('div');
        icon.className = 'envelope-icon';
        icon.textContent = '✉️';
        envelope.appendChild(icon);
        
        const content = document.createElement('div');
        content.className = 'envelope-content';
        content.textContent = envelopeContents[i];
        envelope.appendChild(content);
        
        envelope.onclick = function() {
            if (!this.classList.contains('opened')) {
                this.classList.add('opened');
                openedCount++;
                saveProgress(6, { envelopesOpened: openedCount });
                
                if (openedCount === 3) {
                    setTimeout(() => {
                        const goodGirl = document.createElement('p');
                        goodGirl.textContent = 'Good girl.';
                        goodGirl.className = 'text-line glow-pulse';
                        goodGirl.style.fontSize = '1.5rem';
                        goodGirl.style.marginTop = '2rem';
                        page.appendChild(goodGirl);
                        
                        setTimeout(() => {
                            const button = document.createElement('button');
                            button.textContent = 'Stay with me';
                            button.onclick = () => transitionToPage(7);
                            page.appendChild(button);
                        }, 2000);
                    }, 500);
                }
            }
        };
        
        envelopesContainer.appendChild(envelope);
    }
    
    page.appendChild(envelopesContainer);
    app.appendChild(page);
}

// PAGE 7: LETTER
function renderPage7() {
    const app = document.getElementById('app');
    app.innerHTML = '';
    app.style.background = '';
    
    const page = document.createElement('div');
    page.className = 'page';
    page.style.maxWidth = '800px';
    
    const title = document.createElement('h2');
    title.className = 'stagger-1';
    title.textContent = 'A Letter for You';
    page.appendChild(title);
    
    const letterContainer = document.createElement('div');
    letterContainer.className = 'letter-container';
    
    const letterText = `We only met yesterday…
and still I ended up building something like this for you.
I wouldn't spend this kind of effort on just anyone.

But you are different, K 🖤

Maybe it's an infatuation… maybe something quieter than that.
All I know is you feel like comfort.
A pause from the rough edges of life.
The kind of presence that makes the world go silent for a moment.

You have that rare pull…
the kind people don't fully understand, but still move toward ✨

Beautiful, a little dangerous… a strange mix that stays in my head longer than it should.
You filled a space I didn't even notice was empty.

It's early, I know.
But I don't like pretending my feelings are smaller than they are.
People come and go, that's normal…
yet you don't feel temporary to me.

You feel… claimed.

Not trapped, not forced.
Chosen.

I'm not usually possessive, but with you something shifts.
I don't want distance.
I don't want to be casual.

Stay close 🤍

Think of it like a leash you don't resist…
because it feels warmer than freedom.
Something you reach for, not escape from.

I'll make it gentle enough that you won't want to leave…
and strong enough that you won't need to 🔒

I think that's enough for tonight, sweetheart.

~ R / Flash`;
    
    const paragraphs = letterText.split('\n\n');
    paragraphs.forEach(para => {
        const p = document.createElement('p');
        p.textContent = para;
        letterContainer.appendChild(p);
    });
    
    page.appendChild(letterContainer);
    app.appendChild(page);
    
    // Check if scrolled to bottom
    const button = document.createElement('button');
    button.textContent = 'Continue';
    button.style.display = 'none';
    button.onclick = () => transitionToPage(8);
    page.appendChild(button);
    
    letterContainer.addEventListener('scroll', () => {
        const isScrolledToBottom = letterContainer.scrollHeight - letterContainer.scrollTop <= letterContainer.clientHeight + 50;
        if (isScrolledToBottom) {
            button.style.display = 'inline-block';
        }
    });
    
    // Check if content is shorter than container (no scroll needed)
    setTimeout(() => {
        if (letterContainer.scrollHeight <= letterContainer.clientHeight) {
            button.style.display = 'inline-block';
        }
    }, 500);
}

// PAGE 8: VALENTINE
function renderPage8() {
    const app = document.getElementById('app');
    app.innerHTML = '';
    app.classList.add('warm-gradient');
    
    // Add floating particles
    const particles = document.createElement('div');
    particles.className = 'floating-particles';
    
    for (let i = 0; i < 25; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.textContent = Math.random() > 0.5 ? '❤️' : '✨';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6000 + 'ms';
        particle.style.animationDuration = (4000 + Math.random() * 4000) + 'ms';
        particles.appendChild(particle);
    }
    app.appendChild(particles);
    
    const page = document.createElement('div');
    page.className = 'page';
    
    const valentine = document.createElement('div');
    valentine.className = 'script-text';
    valentine.textContent = "Happy Valentine's Day, K ❤️";
    page.appendChild(valentine);
    
    app.appendChild(page);
    
    const messages = [
        "You're not here because I control you",
        "You're here because you trust me"
    ];
    
    setTimeout(() => {
        const line1 = document.createElement('p');
        line1.className = 'text-line';
        line1.textContent = messages[0];
        page.appendChild(line1);
        
        setTimeout(() => {
            const line2 = document.createElement('p');
            line2.className = 'text-line';
            line2.textContent = messages[1];
            page.appendChild(line2);
            
            setTimeout(() => {
                transitionToPage(9);
            }, 3000);
        }, 2000);
    }, 3000);
}

// PAGE 9: FINAL
function renderPage9() {
    const app = document.getElementById('app');
    app.innerHTML = '';
    app.style.background = '';
    
    const page = document.createElement('div');
    page.className = 'page';
    
    const finalWord = document.createElement('div');
    finalWord.className = 'final-word';
    finalWord.textContent = 'Stay.';
    page.appendChild(finalWord);
    
    app.appendChild(page);
}

// Main Render Function
function renderPage(pageNumber) {
    switch(pageNumber) {
        case 1: renderPage1(); break;
        case 2: renderPage2(); break;
        case 3: renderPage3(); break;
        case 4: renderPage4(); break;
        case 5: renderPage5(); break;
        case 6: renderPage6(); break;
        case 7: renderPage7(); break;
        case 8: renderPage8(); break;
        case 9: renderPage9(); break;
        default: renderPage1();
    }
}

// Initialize Application
function init() {
    const state = loadProgress();
    
    if (state.isAuthenticated && state.currentPage > 1) {
        renderPage(state.currentPage);
        updateVolume(state.currentPage);
    } else {
        renderPage(1);
    }
    
    initAudio();
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
