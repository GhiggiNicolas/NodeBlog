const bubblesContainer = document.querySelector('.bubbles');

for (let i = 0; i < 128; i++) {
    const bubble = document.createElement('div');
    bubble.classList.add('bubble');

    const size = 2 + Math.random() * 4;  // Dimensione tra 2rem e 6rem
    const distance = 6 + Math.random() * 4;  // Distanza tra 6rem e 10rem
    const position = -5 + Math.random() * 110;  // Posizione orizzontale tra -5% e 105%
    const time = 2 + Math.random() * 2;  // Tempo tra 2s e 4s
    const delay = -1 * (2 + Math.random() * 2);  // Ritardo tra -3s e -1s

    bubble.style.setProperty('--size', `${size}rem`);
    bubble.style.setProperty('--distance', `${distance}rem`);
    bubble.style.setProperty('--position', `${position}%`);
    bubble.style.setProperty('--time', `${time}s`);
    bubble.style.setProperty('--delay', `${delay}s`);

    bubblesContainer.appendChild(bubble);
}