// Имя игрока и объект игры
let name = '';
let game = { game: [] };

// Текущая "страница" (start / game / end)
let panel = 'start';

// Навигация по экрану по кликам на кнопки
let nav = () => {
    document.onclick = e => {
        e.preventDefault();
        switch (e.target.id) {
            case 'startGame':
                go('game', 'd-block');
                break;
            case 'restart':
                go('game', 'd-block');
                $('.elements').remove();
                $('#game').append(`<div class="elements"></div>`);
                break;
        }
    };
};

// Переключение между экранами start / game / end
let go = (page, attribute) => {
    let pages = ['start', 'game', 'end'];
    panel = page;
    $(`#${page}`).attr('class', attribute);
    pages.forEach(p => {
        if (page !== p) {
            $(`#${p}`).attr('class', 'd-none');
        }
    });
};

// Цикл проверки, когда пользователь ушёл со стартового экрана
let startLoop = () => {
    let inter = setInterval(() => {
        if (panel !== 'start') {
            clearInterval(inter);
        }
        checkName();
    }, 100);
};

// Подставляем имя игрока из localStorage, если оно уже сохранено
let checkStorage = () => {
    if (localStorage.getItem('userName') != null) {
        $('#nameInput').val(localStorage.getItem('userName'));
    }
};

// Проверяем введённое имя, включаем/отключаем кнопку "Начать игру"
let checkName = () => {
    name = $('#nameInput').val().trim();
    if (name !== '') {
        localStorage.setItem('userName', name);
        $('#startGame').attr('disabled', false);
    } else {
        $('#startGame').attr('disabled', true);
    }
};

let random = (min, max) => {
    min = Math.ceil(min);
    max = Math.ceil(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Точка входа в приложение
window.onload = () => {
    checkStorage();
    nav();
    startLoop();
    setInterval(() => {
        if (panel === 'game') {
            game.game = new Game();
            game.game.start();
            panel = 'game process';
        }
    }, 500);
};
