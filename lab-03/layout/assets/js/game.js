// Основной класс игры: отвечает за время, очки, жизни, создание объектов
class Game {
    constructor() {
        this.name = name;
        this.$zone = $('.elements');
        this.elements = [];
        this.player = this.generate(Player);
        this.fruits = [Apple, Banana, Orange];
        this.counterForTimer = 0;
        this.points = 0;
        this.hp = 3;
        this.time = { m1: 0, m2: 0, s1: 0, s2: 0 };
        this.ended = false;
        this.pause = false;
        this.keyEvents(); // слушатель клавиши ESC
    }

    // Запуск игрового цикла
    start() { this.loop(); }

    // Главный бесконечный цикл игры (отрисовка + логика)
    loop() {
        requestAnimationFrame(() => {
            if (!this.pause) {
                this.counterForTimer++;
                if (this.counterForTimer % 60 === 0) {
                    this.timer();
                    this.randomFruitGenerate();
                }
                if (this.hp <= 0) {
                    this.end();
                }

                $('.pause').css('display', 'none').hide().fadeOut();
                this.updateElements();
                this.setParams();
            } else {
                $('.pause').css('display', 'flex').show().fadeIn();
            }

            if (!this.ended) {
                this.loop();
            }
        });
    }

    // Обработка клавиши ESC для паузы
    keyEvents() {
        addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                this.pause = !this.pause;
            }
        });
    }

    // Случайным образом создаём один из трёх типов фруктов
    randomFruitGenerate() {
        let ranFruit = random(0, 2);
        this.generate(this.fruits[ranFruit]);
    }

    // Обновление панели параметров (имя, очки, жизни)
    setParams() {
        let params = ['name', 'points', 'hp'];
        let value = [this.name, this.points, this.hp];
        params.forEach((e, i) => {
            $(`#${e}`).html(value[i]);
        });
    }

    // Удаление объекта из массива elements
    remove(el) {
        let idx = this.elements.indexOf(el);
        if (idx !== -1) {
            this.elements.splice(idx, 1);
            return true;
        }
        return false;
    }

    // Вызываем update и draw у всех объектов
    updateElements() {
        this.elements.forEach(e => {
            e.update();
            e.draw();
        });
    }

    // Создание нового объекта и добавление его в массив elements
    generate(className) {
        let element = new className(this);
        this.elements.push(element);
        return element;
    }

    // Секундомер в формате mm:ss
    timer() {
        let time = this.time;
        time.s2++;
        if (time.s2 >= 10) { time.s2 = 0; time.s1++; }
        if (time.s1 >= 6) { time.s1 = 0; time.m2++; }
        if (time.m2 >= 10) { time.m2 = 0; time.m1++; }
        let str = `${time.m1}${time.m2}:${time.s1}${time.s2}`;
        $('#timer').html(str);
    }

    // Завершение игры и вывод результата на экран end
    end() {
        this.ended = true;
        let time = this.time;

        if (time.s1 >= 1 || time.m2 >= 1 || time.m1 >= 1) {
            $('#playerName').html(`Поздравляем, ${this.name}!`);
            $('#endTime').html(`Ваше время: ${time.m1}${time.m2}:${time.s1}${time.s2}`);
            $('#collectedFruits').html(`Вы собрали ${this.points} фруктов`);
            $('#congratulation').html(`Вы выиграли!`);
        } else {
            $('#playerName').html(`Жаль, ${this.name}!`);
            $('#endTime').html(`Ваше время: ${time.m1}${time.m2}:${time.s1}${time.s2}`);
            $('#collectedFruits').html(`Вы собрали ${this.points} фруктов`);
            $('#congratulation').html(`Вы проиграли!`);
        }

        // переключаемся на экран конца игры
        go('end', 'panel d-flex justify-content-center align-items-center');
    }
}

window.onload = () => {
    checkStorage();
    nav();
    startLoop();
    setInterval(() => {
        if (panel === 'game') {
            game.game = new Game();
            game.game.start();
            panel = "game process";
        }
    }, 500);
};

// Общая логика для всех рисуемых объектов (игрок и фрукты)
class Drawable {
    constructor(game) {
        this.game = game;
        this.x = 0;
        this.y = 0;
        this.h = 0;
        this.w = 0;
        this.offsets = { x: 0, y: 0 };
    }

    // Создание элемента с нужным CSS‑классом
    createElement() {
        this.$element = $(`<div class="${this.constructor.name.toLowerCase()} element"></div>`);
        this.game.$zone.append(this.$element);
    }

    // Обновление координат по скорости
    update() {
        this.x += this.offsets.x;
        this.y += this.offsets.y;
    }

    // Применение координат и размеров к стилям
    draw() {
        this.$element.css({
            left: this.x + 'px',
            top: this.y + 'px',
            width: this.w + 'px',
            height: this.h + 'px'
        });
    }

    // Проверка пересечения прямоугольников (столкновение)
    isCollision(element) {
        let a = { x1: this.x, x2: this.x + this.w, y1: this.y, y2: this.y + this.h };
        let b = { x1: element.x, x2: element.x + element.w, y1: element.y, y2: element.y + element.h };
        return a.x1 < b.x2 && b.x1 < a.x2 && a.y1 < b.y2 && b.y1 < a.y2;
    }

    // Удаление элемента из документа
    removeElement() {
        this.$element.remove();
    }
}

// Игрок (корзина), умеет двигаться и притягивать фрукты
class Player extends Drawable {
constructor(game) {
        super(game);
        this.w = 244;
        this.h = 109;
        this.x = this.game.$zone.width() / 2 - this.w / 2;
        this.y = this.game.$zone.height() - this.h;
        this.speedPerFrame = 20;

        // добавляем таймеры и параметры навыка
        this.skillTimer = 0;
        this.cooldownTimer = 0;
        this.skillActive = false;
        this.skillDuration = 500;      // длительность притяжения, мс
        this.cooldownDuration = 5000;  // откат 5 секунд

        this.keys = { ArrowLeft: false, ArrowRight: false, Space: false };
        this.createElement();
        this.bindKeyEvents();
    }

    // Подписка на нажатие/отжатие клавиш
    bindKeyEvents() {
        document.addEventListener('keydown', e => {
            this.changeKeyStatus(e.code, true);

            // запуск способности по пробелу
            if (e.code === 'Space' && !this.skillActive && this.cooldownTimer === 0) {
                this.skillActive = true;
                this.skillTimer = 0;
            }
        });
        document.addEventListener('keyup', e => this.changeKeyStatus(e.code, false));
    }

    // Сохраняем состояние нужных кнопок
    changeKeyStatus(code, value) {
        if (code in this.keys) this.keys[code] = value;
    }

    // Логика движения игрока + (при необходимости) скилл
    update() {
        // движение влево / вправо
        if (this.keys.ArrowLeft && this.x > 0) {
            this.offsets.x = -this.speedPerFrame;
        } else if (this.keys.ArrowRight && this.x < this.game.$zone.width() - this.w) {
            this.offsets.x = this.speedPerFrame;
        } else {
            this.offsets.x = 0;
        }

        // работа способности притяжения
        if (this.skillActive) {
            this.skillTimer += 16; // примерно 60 fps
            this.applySkill();     // притягиваем фрукты каждый кадр, пока активен
            if (this.skillTimer >= this.skillDuration) {
                this.skillActive = false;
                this.cooldownTimer = this.cooldownDuration; // запускаем откат
            }
        } else if (this.cooldownTimer > 0) {
            this.cooldownTimer -= 16;
            if (this.cooldownTimer < 0) this.cooldownTimer = 0;
        }

        super.update();
    }

    // Способность притягивать фрукты к корзине
     applySkill() {
        // притягиваем только фрукты
        for (let i = 0; i < this.game.elements.length; i++) {
            const el = this.game.elements[i];
            if (!(el instanceof Fruits)) continue;

            // центр игрока
            const centerX = this.x + this.w / 2;

            // тянем фрукты к корзине
            if (el.x < centerX) {
                el.x += 10;
            } else if (el.x > centerX) {
                el.x -= 10;
            }
        }
    }
}

// Базовый класс фруктов: падение, столкновение с корзиной и дном
class Fruits extends Drawable {
    constructor(game) {
        super(game);
        this.w = 70;
        this.h = 70;
        this.x = random(0, this.game.$zone.width() - this.w);
        this.y = 60;
        this.offsets.y = 1; // было 3
        this.createElement();
    }

    // Падение и проверка: пойман / упал мимо
    update() {
        if (this.isCollision(this.game.player) && this.offsets.y > 0) {
            this.takePoint();
        }
        if (this.y > this.game.$zone.height()) {
            this.takeDamage();
        }
        super.update();
    }

    // Игрок поймал фрукт – даём очко и удаляем фрукт
    takePoint() {
        if (this.game.remove(this)) {
            this.removeElement();
            this.game.points++;
        }
    }

    // Фрукт упал мимо – отнимаем жизнь
    takeDamage() {
        if (this.game.remove(this)) {
            this.removeElement();
            this.game.hp--;
        }
    }
}

// Конкретные типы фруктов с разной скоростью падения

// Яблоко
class Apple extends Fruits {
    constructor(game) {
        super(game);
        this.offsets.y = 2; // было 5
    }
}

// Банан
class Banana extends Fruits {
    constructor(game) {
        super(game);
    }
}

// Апельсин
class Orange extends Fruits {
    constructor(game) {
        super(game);
        this.offsets.y = 3; // было 7
    }
}
