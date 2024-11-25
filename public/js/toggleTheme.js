const toggleThemeSwitch = document.querySelector('#toggle-theme-switch');
const themeIcon = toggleThemeSwitch.querySelector('#theme-icon');

document.documentElement.classList.add(localStorage.getItem('theme') || 'light');
if(localStorage.getItem('theme') === 'dark') {
    themeIcon.classList.add('fa-moon');
}else {
    themeIcon.classList.add('fa-sun');
}

const toggleTheme = () => {
    const theme = document.documentElement.classList.toggle('dark') ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
};

const updateIcon = () => {
    themeIcon.classList.toggle('fa-moon');
    themeIcon.classList.toggle('fa-sun');
};

toggleThemeSwitch.addEventListener('click', () => {
    toggleTheme();
    updateIcon();
});
