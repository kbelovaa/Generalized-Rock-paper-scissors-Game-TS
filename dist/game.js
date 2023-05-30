"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const secure_random_1 = __importDefault(require("secure-random"));
const base64url_1 = __importDefault(require("base64url"));
const crypto = __importStar(require("crypto"));
const readline_sync_1 = __importDefault(require("readline-sync"));
const tty_table_1 = __importDefault(require("tty-table"));
class Table {
    constructor(moves) {
        this.moves = moves;
    }
    showRules() {
        const header = [{ value: 'v PC/User >' }];
        const rows = [];
        const options = {
            borderStyle: "solid",
            borderColor: "blue",
            headerAlign: "center",
            align: "left",
            color: "white",
            truncate: "...",
            width: "90%"
        };
        this.moves.forEach((move, i) => {
            var _a;
            header.push({ value: move });
            const row = { 'v PC/User >': move };
            const array = [...this.moves];
            for (let j = array.length - 1; j >= i; j--) {
                array.unshift((_a = array.pop()) !== null && _a !== void 0 ? _a : '');
            }
            this.moves.forEach((m) => {
                let result = '';
                if (array.indexOf(m) === 0) {
                    result = 'Draw';
                }
                else if (array.indexOf(m) <= Math.floor(array.length / 2)) {
                    result = 'Win';
                }
                else {
                    result = 'Lose';
                }
                row[m] = result;
            });
            rows.push(row);
        });
        console.log((0, tty_table_1.default)(header, rows, options).render());
    }
}
class Rules {
    constructor(moves) {
        this.moves = moves;
    }
    determineWinner(userMove, scriptMove) {
        var _a;
        if (userMove === scriptMove) {
            return 'Draw!';
        }
        const j = this.moves.indexOf(scriptMove);
        for (let i = this.moves.length - 1; i >= j; i--) {
            this.moves.unshift((_a = this.moves.pop()) !== null && _a !== void 0 ? _a : '');
        }
        if (this.moves.indexOf(userMove) <= Math.floor(this.moves.length / 2)) {
            return 'You won!';
        }
        return 'You lost!';
    }
}
class KeyGen {
    generateKey() {
        return (0, base64url_1.default)((0, secure_random_1.default)(256, { type: 'Buffer' }));
    }
    calculateHmac(move, key) {
        return crypto.createHmac('sha3-256', key).update(move).digest('hex');
    }
}
class Game {
    constructor(moves) {
        this.moves = moves;
    }
    playGame() {
        this.checkParameters();
        this.key = new KeyGen().generateKey();
        this.scriptMove = this.makeScriptMove();
        const hmac = new KeyGen().calculateHmac(this.scriptMove, this.key);
        console.log(`HMAC: ${hmac}`);
        this.showMenu();
    }
    checkParameters() {
        let message = '';
        if (this.moves.length % 2 === 0) {
            message = 'Input error: Number of parameters must be odd. For example: node game.js rock paper scissors';
        }
        if (this.moves.length <= 1) {
            message = 'Input error: Three or more parameters must be entered. For example: node game.js rock paper scissors';
        }
        if (new Set(this.moves).size !== this.moves.length) {
            message = 'Input error: Enter non-repeated parameters. For example: node game.js rock paper scissors';
        }
        if (message) {
            console.log(message);
            process.exit(-1);
        }
    }
    makeScriptMove() {
        return this.moves[Math.floor(Math.random() * this.moves.length)];
    }
    showMenu() {
        console.log('Available moves:');
        this.moves.forEach((move, i) => console.log(`${i + 1} - ${move}`));
        console.log('0 - exit\n? - help');
        this.userMove = readline_sync_1.default.question("Enter your move: ");
        this.checkUserMove();
    }
    checkUserMove() {
        if (this.userMove === '0') {
            process.exit(-1);
        }
        else if (this.userMove === '?') {
            new Table(this.moves).showRules();
            this.showMenu();
        }
        else if (!Number.isInteger(Number(this.userMove)) || Number(this.userMove) < 0 || Number(this.userMove) > this.moves.length || !this.userMove) {
            console.log('Input error: Enter one of the available menu options');
            this.showMenu();
        }
        else {
            this.showResults();
        }
    }
    showResults() {
        console.log(`Your move: ${this.moves[Number(this.userMove) - 1]}`);
        console.log(`Computer move: ${this.scriptMove}`);
        console.log(new Rules(this.moves).determineWinner(this.moves[Number(this.userMove) - 1], this.scriptMove));
        console.log(`HMAC key: ${this.key}`);
    }
}
new Game(process.argv.slice(2)).playGame();
//# sourceMappingURL=game.js.map