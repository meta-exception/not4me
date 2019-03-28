
import { INode, INodeError, ITermNode, IToken } from './model';

export class Parser {

  private tokens: IToken[];
  private tokenPtr: number;
  private errors: INodeError[];

  private nested: number;

  constructor(tokens: IToken[]) {
    this.tokens = tokens;
    this.tokenPtr = 0;
    this.errors = [];
    this.nested = 0;
  }

  public getAST(): INode | null | INodeError {
    const ast = this.parseLang();
    if (this.errors.length > 0) {
      this.errors.sort((errA, errB) => errB.error.priority - errA.error.priority);
      console.error(this.errors);
      return this.errors[0];
    }
    return ast;
  }

  private parseLang(): INode | null  {
    const start = this.tokens[this.tokenPtr];
    if (start.lexeme === 'Begin') {
      this.tokenPtr++;
      const terms = this.parseTerms();
      const operators = this.parseOperators();
      const eol = this.tokens[this.tokenPtr];
      if (eol.type === 'EOL') {
        return {
          node: 'Lang',
          children: [terms, operators],
          value: (terms.value as string) + '\n' + (operators.value as string),
        };
      }
      const err = {
        node: 'Lang',
        children: [terms, operators],
        error: {
          message: 'Ожидается конец ввода.',
          priority: 1,
          token: eol,
        },
      };
      this.errors.push(err);
      return null;
    }
    const err = {
      node: 'Lang',
      children: [],
      error: {
        message: 'Язык не начинается со слова "Begin".',
        priority: 0,
        token: start,
      },
    };
    this.errors.push(err);
    return null;
  }

  private parseTerms(): INode {
    const term = this.parseTerm();
    if (this.tokens[this.tokenPtr].type === 'Type') {
      const terms = this.parseTerms();
      return {
        node: 'Terms',
        children: [term, terms],
        value: ((term as any).value as string) + '\n' + (terms.value as string),
      };
    }
    return {
      node: 'Terms',
      children: [term],
      value: term ? term.value : '',
    };
  }

  private parseTerm(): INode | null  {
    const type = this.tokens[this.tokenPtr];
    if (type.lexeme === 'Real') {
      if (this.tokens[this.tokenPtr + 1].type === 'Variable') {
        const variables = [];
        do {
          this.tokenPtr++;
          const variable = this.tokens[this.tokenPtr];
          variables.push(variable);
        } while (this.tokens[this.tokenPtr].type === 'Variable');
        if (this.tokens[this.tokenPtr].lexeme === 'End') {
          this.tokenPtr++;
          if (this.tokens[this.tokenPtr].lexeme === 'of') {
            this.tokenPtr++;
            if (this.tokens[this.tokenPtr].lexeme === 'job') {
              this.tokenPtr++;
              return {
                node: 'Term',
                children: [],
                value: '',
              };
            }
          }
        }
        const err = {
          node: 'Term',
          children: [],
          error: {
            message: 'Ожидается "End of job".',
            priority: 28,
            token: this.tokens[this.tokenPtr],
          },
        };
        this.errors.push(err);
        return null;
      }
      const err = {
        node: 'Term',
        children: [],
        error: {
          message: 'Ожидается переменная.',
          priority: 22,
          token: this.tokens[this.tokenPtr + 1],
        },
      };
      this.errors.push(err);
      return null;
    } else if (type.lexeme === 'Int') {
      const integers = [];
      do {
        this.tokenPtr++;
        const integer = this.tokens[this.tokenPtr];
        integers.push(integer);
      } while (this.tokens[this.tokenPtr].type === 'Integer');
      return {
        node: 'Term',
        children: [],
        value: '',
      };
    }
    const err = {
      node: 'Term',
      children: [],
      error: {
        message: 'Ожидается "Real" или "Int".',
        priority: 20,
        token: type,
      },
    };
    this.errors.push(err);
    return null;
  }

  private parseOperators(): INode {
    const operator = this.parseOperator();
    const semicolon = this.tokens[this.tokenPtr];
    if (semicolon.lexeme === ';') {
      this.tokenPtr++;
      if (this.tokens[this.tokenPtr].type === 'Variable') {
        const operators = this.parseOperators();
        return {
          node: 'Operators',
          children: [operator, operators],
          value: (operator ? operator.value : '') + '\n' + operators.value,
        };
      }
      return {
        node: 'Operators',
        children: [operator],
        value: operator ? operator.value : '',
      };
    }
    return {
      node: 'Operators',
      children: [operator],
      value: operator ? operator.value : '',
    };
  }

  private parseOperator(): INode | null  {
    const left = this.tokens[this.tokenPtr];
    if (left.type === 'Variable') {
      this.tokenPtr++;
      const eq = this.tokens[this.tokenPtr];
      if (eq.type === '=') {
        this.tokenPtr++;
        const right = this.parseRight();
        return {
          node: 'Operator',
          children: [right],
          value: left.lexeme + '=' + (right ? right.value : ''),
        };
      }
      const err = {
        node: 'Operator',
        children: [],
        error: {
          message: 'Ожидается "=".',
          priority: 27,
          token: eq,
        },
      };
      this.errors.push(err);
      return null;
    }
    const err = {
      node: 'Operator',
      children: [],
      error: {
        message: 'Ожидается переменная.',
        priority: 23,
        token: left,
      },
    };
    this.errors.push(err);
    return null;
  }

  private parseRight(): INode | null {
    return this.parseAS();
  }

  private parseF(): INode | null {
    const LP = this.tokens[this.tokenPtr];
    if (LP.type === '(') {
      this.tokenPtr++;
      const ev = this.parseAS();
      const RP = this.tokens[this.tokenPtr];
      if (RP.type === ')') {
        this.tokenPtr++;
        return {
          node: 'F',
          children: [ev],
          value: ev ? ev.value : '',
        };
      }
      const err = {
        node: 'F',
        children: [ev],
        error: {
          message: 'Ожидается закрытая скобка ")".',
          priority: 22,
          token: RP,
        },
      };
      this.errors.push(err);
      return null;
    }
    return this.parseU();
  }

  private parseP(): INode | null  {
    const LP = this.tokens[this.tokenPtr];
    if (LP.type === '(') {
      this.nested++;
      if (this.nested <= 3) {
        this.tokenPtr++;
        const ev = this.parseAS();
        const RP = this.tokens[this.tokenPtr];
        if (RP.type === ')') {
          this.nested--;
          this.tokenPtr++;
          return {
            node: 'P',
            children: [ev],
            value: ev ? ev.value : '',
          };
        }
        const err = {
          node: 'P',
          children: [ev],
          error: {
            message: 'Ожидается закрытая скобка ")".',
            priority: 20,
            token: RP,
          },
        };
        this.errors.push(err);
        return null;
      }
      const err = {
        node: 'P',
        children: [],
        error: {
          message: 'Ожидается не более 3-х уровней вложенности скобок.',
          priority: 21,
          token: LP,
        },
      };
      this.errors.push(err);
      return null;
    } else if (LP.type === '-') {
      this.tokenPtr++;
      const LP = this.tokens[this.tokenPtr];
      if (LP.type === '(') {
        this.nested++;
        if (this.nested <= 3) {
          this.tokenPtr++;
          const ev = this.parseAS();
          const RP = this.tokens[this.tokenPtr];
          if (RP.type === ')') {
            this.nested--;
            this.tokenPtr++;
            return {
              node: 'P',
              children: [ev],
              value: ev ? ev.value : '',
            };
          }
          const err = {
            node: 'P',
            children: [ev],
            error: {
              message: 'Ожидается закрытая скобка ")".',
              priority: 20,
              token: RP,
            },
          };
          this.errors.push(err);
          return null;
        }
        const err = {
          node: 'P',
          children: [],
          error: {
            message: 'Ожидается не более 3-х уровней вложенности скобок.',
            priority: 21,
            token: LP,
          },
        };
        this.errors.push(err);
        return null;
      }
      const u = this.parseU();
      return {
        node: 'P',
        children: [u],
        value: -(u as any).value,
      };
    }
    return this.parseU();
  }

  private parseE(): INode | null  {
    const p = this.parseP();
    const exp = this.tokens[this.tokenPtr];
    if (exp.type === '^') {
      this.tokenPtr++;
      const e = this.parseE();
      return {
        node: 'Exp',
        children: [p, e],
        value: Math.pow((p as any).value, (e as any).value),
      };
    }
    return p;
  }

  private parseMD(): INode | null  {
    const e = this.parseE();
    const md = this.parseMDl();
    if (md === null) {
      return e;
    }
    if (md.node === '*') {
      return {
        node: '*',
        children: [e, md],
        value: (e as any).value * (md as any).value,
      };
    }
    return {
      node: '/',
      children: [e, md],
      value: (e as any).value / (md as any).value,
    };
  }

  private parseMDl(): INode | null {
    const op = this.tokens[this.tokenPtr];
    if (op.type === '/' || op.type === '*') {
      this.tokenPtr++;
      const e = this.parseE();
      const md = this.parseMDl();
      if (md === null) {
        if (op.type === '*') {
          return {
            node: '*',
            children: [e],
            value: e ? e.value : '',
          };
        }
        return {
          node: '/',
          children: [e],
          value: e ? e.value : '',
        };
      }
      if (md.node === '*') {
        return {
          node: op.type,
          children: [e, md],
          value: (e as any).value * (md as any).value,
        };
      }
      return {
        node: op.type,
        children: [e, md],
        value: (e as any).value / (md as any).value,
      };
    }
    return null;
  }

  private parseAS(): INode | null {
    const md = this.parseMD();
    const as = this.parseASl();
    if (as === null) {
      return md;
    } else {
      if (as.node === '+') {
        return {
          node: '+',
          children: [as, md],
          value: parseFloat(as.value) + md.value ? parseFloat(md.value) : 0,
        };
      }
      return {
        node: '-',
        children: [as, md],
        value: parseFloat(as.value) - parseFloat(md.value),
      };
    }
  }

  private parseASl(): INode | null {
    const op = this.tokens[this.tokenPtr];
    if (op.type === '-' || op.type === '+') {
      this.tokenPtr++;
      const md = this.parseMD();
      const as = this.parseASl();
      if (as === null) {
        if (op.type === '+') {
          return {
            node: '+',
            children: [md],
            value: md ? md.value : '',
          };
        }
        return {
          node: '-',
          children: [md],
          value: md ? md.value : '',
        };
      } else {
        if (as.node === '+') {
          return {
            node: op.type,
            children: [md, as],
            value: parseFloat(as.value) + parseFloat(md.value),
          };
        }
        return {
          node: op.type,
          children: [md, as],
          value: parseFloat(as.value) - parseFloat(md.value),
        };
      }
    }
    return null;
  }

  private parseU(): INode | null {
    const m = this.tokens[this.tokenPtr];
    if (m.type === '-') {
      this.tokenPtr++;
      const n = this.parseN();
      return {
        node: 'Unary',
        children: [n],
        value: -(n as any).value,
      };
    }
    return this.parseN();
  }

  private parseN(): INode | null {
    const n = this.tokens[this.tokenPtr];
    if (n.type === 'Real') {
      this.tokenPtr++;
      return {
        node: 'N',
        children: [],
        value: parseFloat(n.lexeme),
      };
    } else if (n.type === 'Integer') {
      this.tokenPtr++;
      return {
        node: 'N',
        children: [],
        value: parseInt(n.lexeme, 10),
      };
    } else if (n.type === 'Function') {
      this.tokenPtr++;
      const f = this.parseF();
      switch (n.lexeme) {
        case 'sin':
          return {
            node: 'N',
            children: [f],
            value: Math.sin((f as any).value),
          };
          break;
        case 'cos':
          return {
            node: 'N',
            children: [f],
            value: Math.cos((f as any).value),
          };
          break;
        case 'abs':
          return {
            node: 'N',
            children: [f],
            value: Math.abs((f as any).value),
          };
          break;
        default:
          const err = {
            node: 'N',
            children: [],
            error: {
              message: 'Неизвестная функция.',
              priority: 51,
              token: n,
            },
          };
          this.errors.push(err);
          return null;
          break;
      }
    }
    const err = {
      node: 'N',
      children: [],
      error: {
        message: 'Ожидается функция, целое или вещественное число.',
        priority: 50,
        token: n,
      },
    };
    this.errors.push(err);
    return null;
  }
}
