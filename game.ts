import secureRandom from 'secure-random';
import base64url from 'base64url';
import * as crypto from 'crypto';
import readline from 'readline-sync';
import table from 'tty-table';

class Table {
  moves: string[];

  constructor(moves: string[]) {
    this.moves = moves;
  }

  showRules() {
    const header: {value: string}[] = [{value: 'v PC/User >'}];
    const rows: {[index: string]: string}[] = [];
    const options = {
      borderStyle: "solid",
      borderColor: "blue",
      headerAlign: "center",
      align: "left",
      color: "white",
      truncate: "...",
      width: "90%"
    }
    this.moves.forEach((move: string, i: number) => {
      header.push({value: move});
      const row: {[index: string]: string} = {'v PC/User >': move};
      const array: string[] = [...this.moves];
      for (let j = array.length - 1; j >= i; j--) {
        array.unshift(array.pop() ?? '');
      }
      this.moves.forEach((m: string) => {
        let result = '';
        if (array.indexOf(m) === 0) {
          result = 'Draw';
        } else if (array.indexOf(m) <= Math.floor(array.length/2)) {
          result = 'Win';
        } else {
          result = 'Lose';
        }
        row[m] = result;
      });
      rows.push(row);
    });
    console.log(table(header,rows,options).render());
  }
}

class Rules {
  moves: string[];

  constructor(moves: string[]) {
    this.moves = moves;
  }

  determineWinner(userMove: string, scriptMove: string) {
    if (userMove === scriptMove) {
      return 'Draw!';
    }
    const j: number = this.moves.indexOf(scriptMove);
    for (let i = this.moves.length - 1; i >= j; i--) {
      this.moves.unshift(this.moves.pop() ?? '');
    }
    if (this.moves.indexOf(userMove) <= Math.floor(this.moves.length/2)) {
      return 'You won!';
    }
    return 'You lost!';
  }
}

class KeyGen {
  generateKey() {
    return base64url(secureRandom(256, {type: 'Buffer'}));
  }
  
  calculateHmac(move: string, key: string) {
    return crypto.createHmac('sha3-256', key).update(move).digest('hex');
  }
}

class Game {
  moves: string[];
  key: string;
  scriptMove: string;
  userMove: string;

  constructor(moves: string[]) {
    this.moves = moves;
  }

  playGame() {
    this.checkParameters();
    this.key = new KeyGen().generateKey();
    this.scriptMove = this.makeScriptMove();
    const hmac: string = new KeyGen().calculateHmac(this.scriptMove, this.key);
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
    this.moves.forEach((move: string, i: number) => console.log(`${i + 1} - ${move}`));
    console.log('0 - exit\n? - help');
    this.userMove = readline.question("Enter your move: ");
    this.checkUserMove();
  }

  checkUserMove() {
    if (this.userMove === '0') {
      process.exit(-1);
    } else if (this.userMove === '?') {
      new Table(this.moves).showRules();
      this.showMenu();
    } else if (!Number.isInteger(Number(this.userMove)) || Number(this.userMove) < 0 || Number(this.userMove) > this.moves.length || !this.userMove) {
      console.log('Input error: Enter one of the available menu options');
      this.showMenu();
    } else {
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