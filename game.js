'use strict';

class Vector {
    constructor(x = 0, y = 0) {
        this.x = x,
        this.y = y;
    }

    plus(vector) {
        if (vector instanceof Vector) {
            return new Vector(this.x + vector.x, this.y + vector.y);
            // else не нужен, в if return
        } else {
            // лучше сначала проверять аргументы функции, а потом писать основной код
            throw new Error('Можно прибавлять к вектору только вектор типа Vector!');
        }
    }

    times(multiplier) {
        return new Vector(this.x * multiplier, this.y * multiplier);
    }

}

class Actor {
    constructor(pos = new Vector(), size = new Vector(1, 1), speed = new Vector()) {
        if (pos instanceof Vector && size instanceof Vector && speed instanceof Vector) {
            this.pos = pos,
            this.size = size,
            this.speed = speed
        } else {
          // лучше сначала проверять аргументы функции, а потом писать основной код
            throw new Error('Неверные аргументы!');
        }
    }

    act() {}

    get left() {
        return this.pos.x;
    }

    get top() {
        return this.pos.y;
    }

    get right() {
        return this.pos.x + this.size.x;
    }

    get bottom() {
        return this.pos.y + this.size.y;
    }

    get type() {
        return 'actor';
    }

    isIntersect(movingObject) {
        if (!(movingObject instanceof Actor) || movingObject === null) {
            throw new Error('Неверный аргумент!');
        }
        // === понятнее
        if (Object.is(this, movingObject)) {
            return false;
        }
        // это выражение можно упростить
        // написать без if
        if(movingObject.bottom <= this.top || movingObject.top >= this.bottom || movingObject.right <= this.left || movingObject.left >= this.right) {
            return false;
        } else {
            return true;
        }
    }
}


class Level {
    constructor(grid = [], actors = []) {
        // эту проверку можно убрать, т.к. если не передать аргументы, то дальше ничего не зарабовает
        if(arguments.length > 0) {
            this.grid = grid;
            this.actors = actors;
            // метод find принимает функцию обратного вызова, которая должна возвращать true/false,
            // а не объект
            this.player = actors.find((el) => { if(el.type === 'player') { return el; } });
            // этот код нужно упростить
            // зачем тут проверка длины?
            // проверку того, что аргументы являются массивами можно сделать в начале
            if(grid.length > 0 && Array.isArray(grid[0])) {
                const nextArray = [];
                // это можно заменить на метод map
                grid.forEach((el) => nextArray.push(el.length));
                // вместо apply можно использовать ...
                this.width =  Math.max.apply(null, nextArray);
                this.height = grid.length;
            } else if(grid[0] === undefined) {
                this.width = 0
                this.height = grid.length;
            } else {
                this.height = grid.length;
                this.width = 1;
            }
            this.status = null;
            this.finishDelay = 1;
        } else {
            this.height = 0;
            this.width = 0;
            this.status = null;
            this.finishDelay = 1;
        }

    }

    isFinished() {
        // лучше вместо такого if писать просто return <выражение в if>
        if (status !== null && this.finishDelay < 0) {
            return true;
        } else {
            return false;
        }
    }

    actorAt(actor) {
        if (!(actor instanceof Actor) || actor === null) {
            throw new Error('Неверный аргумент!');
        }
        // эту проверку лучше сделать в конструкторе
        if(this.actors === undefined || this.actors.length === 1) {
            return undefined;
            // 2 раза осуществляется поиск по массиву, нужно исправить
        } else if(this.actors.find((el) => el.isIntersect(actor))) {
            return this.actors.find((el) => el.isIntersect(actor));
        } else {
            return undefined;
        }
    }

    obstacleAt(pos, size) {
        if (!(pos instanceof Vector && size instanceof Vector)) {
            throw new Error('Невреные аргументы!');
        }
        if(pos.x < 0  || pos.x > this.width - size.x || pos.y < 0) {
            return 'wall';
        } else if(pos.y > this.height - size.y) {
            return 'lava';
        }
        let result;
        // вы обходите всё игровое поле, а нужно только клетки на которых располагается объект
        this.grid.forEach((row, rowIndex) => {
            if(rowIndex >= Math.floor(pos.y) && rowIndex < Math.ceil(pos.y + size.y)) {
                row.forEach((cell, cellIndex) => {
                    if(cellIndex >= Math.floor(pos.x) && cellIndex < Math.ceil(pos.x + size.x)) {
                        if (this.grid[rowIndex][cellIndex]) {
                            result = this.grid[rowIndex][cellIndex];
                        }
                    }
                })
            }
            return result;
        })
        return result;
    }

    removeActor(actor) {
        // код отработает некорректно, если объект не будет найден
        this.actors.splice(this.actors.indexOf(actor), 1);
    }

    noMoreActors(actorType) {
        // эту проверка лучше сделать в кончструкторе
        if(this.actors === undefined) {
            return true;
            // здесь использовать метод some
        } else if(this.actors.filter((el) => el.type === actorType).length === 0) {
            return true;
        } else {
            return false;
        }
    }

    playerTouched(object, actor) {
        // лучше обратить условие и написать там return, чтобы уменьшить вложенность
        if(this.status === null) {
            if(object === 'coin' && actor !== undefined) {
                // дублирование removeActor
                this.actors.splice( this.actors.indexOf(actor), 1);
                // дублирование noMoreActors
                if(!( this.actors.find( (el) => el.type === 'coin' ))) {
                    this.status = 'won';
                }
            }
            if(object === 'lava' || object === 'fireball') {
                this.status = 'lost';
            }
        }
    }
}

class LevelParser {
    // здесь лучше добавить значение по-умолчанию
    constructor(actorDict) {
        // здесь лучше создать копию объекта
        this.actorDict = actorDict;
    }

    actorFromSymbol(sym) {
        // лишний цикл
        for (let key in this.actorDict ) {
            // лишнее стравнение
            if(key === sym) {
                return this.actorDict[sym];
            }
        }
    }

    obstacleFromSymbol(sym) {
        if(sym === 'x') {
            return 'wall';
            // else можно убрать
        } else if(sym === '!') {
            return 'lava';
            // лишняя строчка
        } else return undefined;
    }

    createGrid(array) {
        // лишняя проверка
        if( array.length === 0 ) {
            return [];
        } else {
            const mapLevel = [];
            // .map
            array.forEach((el) => mapLevel.push(el.split('')));

            // .map
            mapLevel.forEach((row) => {
                row.forEach((cell, numIndex) => {
                row[numIndex] = this.obstacleFromSymbol(cell);
                })
            })

            return mapLevel;
        }
    }

    createActors(array) {
        const actorMap =[];
        // лишние проверки
        if( array.length === 0  || this.actorDict === undefined) {
            console.log(this.actorDict);
            return [];
        } else {
            const tempArray =[];
            array.forEach((el) => tempArray.push(el.split('')));

            tempArray.forEach((row, rowIndex) => {
                row.forEach((cell, numIndex ) => {
                    // this.actorDict[cell] лучше записать в переменную иначе сложно понять что происходит
                    if(typeof(this.actorDict[cell]) === 'function'
                        // проверки дублируют друг друга
                    && (this.actorDict[cell].prototype instanceof Actor
                        // почему бы просто не создать объект, проверить его тип
                        // и если он нужный - добавить его в массив
                    || Object.create(this.actorDict[cell].prototype) instanceof Actor)) {
                        actorMap.push(new this.actorDict[cell](new Vector(numIndex, rowIndex)) );
                    } else { //  тут какая-то логическая нестыковка, зачем из forEach возвращать пустой массив
                        return [];
                    }
                })
            })
        }

        return actorMap;
    }

    parse(array) {
        return new Level(this.createGrid(array), this.createActors(array));
    }

}

class Fireball extends Actor {
    // не опускайте аргументы конструктора класса Vector
    constructor(pos = new Vector(), speed = new Vector()) {
        super(...arguments);
        // pos, size, speed должны задаваться через конструктор родительского класса
        this.pos = pos;
        this.speed = speed;
        this.size = new Vector(1, 1);
    }

    act(time, level) {
        const nextPos = this.getNextPosition(time);
        if(level.obstacleAt(nextPos, this.size) === undefined) {
            this.pos = nextPos;
        } else {
            this.handleObstacle();
        }
    }

    get type() {
        return 'fireball';
    }

    getNextPosition(time = 1) {
        // не опускайте аргументы конструктора класса Vector
        // и зачем тут new Vector()?
        return new Vector().plus(this.pos).plus(this.speed.times(time));
    }

    handleObstacle() {
        this.speed = this.speed.times(-1);
    }

}

class HorizontalFireball extends Fireball {
    // не опускайте аргументы конструктора класса Vector
    constructor(pos = new Vector(), speed = new Vector()) {
        super(pos, speed);
        // pos, speed должны задаваться через конструктор родительского класса
        this.pos = pos;
        this.speed = new Vector(2, 0);
    }

}

class VerticalFireball extends Fireball {
    // не опускайте аргументы конструктора класса Vector
    constructor(pos = new Vector(), speed = new Vector()) {
        super(pos, speed);
        // pos, speed должны задаваться через конструктор родительского класса
        this.pos = pos;
        this.speed = new Vector(0, 2);
    }

}

class FireRain extends Fireball {
    // лучше добавить значение по-умолчанию
    constructor(pos) {
        super(pos);
        // speed должна задаваться через конструктор родительского класса
        this.speed = new Vector(0, 3);
        this.basePos = pos;

    }

    handleObstacle() {
        this.pos = this.basePos;
    }
}

class Coin extends Actor {
    // не опускайте аргументы конструктора класса Vector
    constructor(pos = new Vector()) {
        super(pos);
        // pos, size должны задаваться через конструктор родительского класса
        this.pos = pos.plus(new Vector(0.2, 0.1));
        this.size = new Vector(0.6, 0.6);
        // зачем +0?
        this.spring = Math.random() * ((2 * Math.PI) - 0) + 0;
        this.springSpeed = 8;
        this.springDist = 0.07;
        this.basePos = pos.plus(new Vector(0.2, 0.1));
    }

    act(time) {
        this.pos = this.getNextPosition(time);
    }

    get type() {
        return 'coin';
    }

    updateSpring(time = 1) {
        this.spring += this.springSpeed * time;
    }

    getSpringVector() {
        return new Vector(0, Math.sin(this.spring) * this.springDist);
    }

    getNextPosition(time = 1) {
        this.spring += this.springSpeed * time;
        return this.basePos.plus(this.getSpringVector());

    }

}

class Player extends Actor {
    // не опускайте аргументы конструктора класса Vector
    constructor(pos = new Vector()) {
        super();
        // pos, size должны задаваться через конструктор родительского класса
        this.pos = new Vector(pos.x, pos.y - 0.5);
        this.size = new Vector(0.8, 1.5);
    }

    get type() {
        return 'player';
    }
}

const schemas = [
    [
        '         ',
        '         ',
        '    =    ',
        '       o ',
        '     !xxx',
        ' @       ',
        'xxx!     ',
        '         '
    ],
    [
    '      v  ',
    '    v    ',
    '  v      ',
    '        o',
    '        x',
    '@   x    ',
    'x        ',
    '         '
    ],
    [
    '      v                ',
    '    v      =          x',
    '  v         x          ',
    '        o              ',
    '        x   x        o ',
    '@   x       x   =      ',
    'x           xxxxxxxxxxx',
    '                       '
    ]
];
const actorDict = {
    '@': Player,
    'v': FireRain,
    'o': Coin,
    '=': HorizontalFireball,
    '|': VerticalFireball
}
const parser = new LevelParser(actorDict);
runGame(schemas, parser, DOMDisplay)
.then(() => alert('Вы выиграли приз!'));