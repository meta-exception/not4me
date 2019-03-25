
import { IToken } from './token';

export class Parser {
  public static e = 'Something terrible!';

  private tokens: IToken[];
  private tokenPtr: number;
  private lookaheadPtr: number;

  constructor(tokens: IToken[]) {
    this.tokens = tokens;
    this.tokenPtr = 0;
    this.lookaheadPtr = 0;
  }

  public getAST() {
    return this.parseLang();
  }

  private parseLang() {
    const start = this.tokens[this.tokenPtr];
    if (start.value === 'Start') {
      this.tokenPtr++;
      const chain = this.parseChain();
      const calculations = this.parseCalculations();
      const stop = this.tokens[this.tokenPtr];
      if (stop.value === 'Stop') {
        this.tokenPtr++;
        const eol = this.tokens[this.tokenPtr];
        if (eol.type === 'EOL') {
          return {
            node: 'Lang',
            start,
            chain,
            calculations,
            stop,
          };
        } else {
          return {
            node: 'Lang',
            start,
            chain,
            calculations,
            stop,
            error: {
              message: 'После слова "Stop" ожидается конец ввода.',
              start: eol.token.start,
              end: eol.token.end,
            },
          };
        }
      } else {
        return {
          node: 'Lang',
          start,
          chain,
          calculations,
          stop: null,
          error: {
            message: 'Язык заканчивается не словом "Stop"',
            start: stop.token.start,
            end: stop.token.end,
          },
        };
      }
    } else {
      return {
        node: 'Lang',
        start: null,
        chain: null,
        calculations: null,
        stop: null,
        error: {
          message: 'Язык не начинается со слова "Start"',
          start: start.token.start,
          end: start.token.end,
        },
      };
    }
  }

  private parseChain(): any {
    const nexus = this.parseNexus();
    this.tokenPtr++;
    if (this.tokens[this.tokenPtr + 1].type === ':') {
      const chain = this.parseChain();
      return {
        node: 'Chain',
        nexus,
        chain,
      };
    } else {
      return {
        node: 'Chain',
        nexus,
      };
    }
  }

  private parseNexus() {
    const id = this.tokens[this.tokenPtr];
    if (id.type === 'Integer') {
      this.tokenPtr++;
      const colon = this.tokens[this.tokenPtr];
      if (colon.type === ':') {
        this.tokenPtr++;
        const figure = this.parseFigure();
        this.tokenPtr++;
        const comma = this.tokens[this.tokenPtr];
        if (comma.type === ',') {
          this.tokenPtr++;
          const color = this.tokens[this.tokenPtr];
          if (color.type === 'Color') {
            return {
              node: 'Nexus',
              id,
              figure,
              color,
            };
          } else {
            return {
              node: 'Nexus',
              id,
              figure,
              color: null,
              error: {
                message: 'Цвет может принимать значения: "red", "green", "blue".',
                start: color.token.start,
                end: color.token.end,
              },
            };
          }
        } else {
          return {
            node: 'Nexus',
            id,
            figure,
            color: null,
            error: {
              message: 'Пропущенна запятая после Фигуры.',
              start: comma.token.start,
              end: comma.token.end,
            },
          };
        }
      } else {
        return {
          node: 'Nexus',
          id: null,
          figure: null,
          color: null,
          error: {
            message: 'После id ожидается ":".',
            start: colon.token.start,
            end: colon.token.end,
          },
        };
      }
    } else {
      return {
        node: 'Nexus',
        id: null,
        figure: null,
        color: null,
        error: {
          message: 'Id не целое.',
          start: id.token.start,
          end: id.token.end,
        },
      };
    }
  }

  private parseFigure() {
    const label = this.tokens[this.tokenPtr];
    if (label.type === 'Label') {
      this.tokenPtr++;
      const comma = this.tokens[this.tokenPtr];
      if (comma.type === ',') {
        this.tokenPtr++;
        switch (label.value) {
        case 'circle': {
          const radius = this.tokens[this.tokenPtr];
          if (radius.type === 'Real') {
            return {
              node: 'Circle',
              label,
              radius,
            };
          } else {
            return {
              node: 'Circle',
              label,
              radius: null,
              error: {
                message: 'Радиус должен быть задан вещественным числом.',
                start: radius.token.start,
                end: radius.token.end,
              },
            };
          }
          break;
          }
        case 'rectangle': {
          const xAxis = this.tokens[this.tokenPtr];
          if (xAxis.type === 'Real') {
            this.tokenPtr++;
            const comma = this.tokens[this.tokenPtr];
            if (comma.type === ',') {
              this.tokenPtr++;
              const yAxis = this.tokens[this.tokenPtr];
              if (yAxis.type === 'Real') {
                return {
                  node: 'Rectangle',
                  label,
                  xAxis,
                  yAxis,
                };
              } else {
                return {
                  node: 'Rectangle',
                  label,
                  xAxis,
                  yAxis: null,
                  error: {
                    message: 'Сторона должна быть задана вещественным числом.',
                    start: yAxis.token.start,
                    end: yAxis.token.end,
                  },
                };
              }
            } else {
              return {
                node: 'Rectangle',
                label,
                xAxis,
                yAxis: null,
                error: {
                  message: 'После стороны ожидается ",".',
                  start: comma.token.start,
                  end: comma.token.end,
                },
              };
            }
          } else {
            return {
              node: 'Rectangle',
              label,
              xAxis: null,
              yAxis: null,
              error: {
                message: 'Сторона должна быть задана вещественным числом.',
                start: xAxis.token.start,
                end: xAxis.token.end,
              },
            };
          }
          break;
          }
        case 'triangle': {
          const xAxis = this.tokens[this.tokenPtr];
          if (xAxis.type === 'Real') {
            this.tokenPtr++;
            const comma = this.tokens[this.tokenPtr];
            if (comma.type === ',') {
              this.tokenPtr++;
              const yAxis = this.tokens[this.tokenPtr];
              if (yAxis.type === 'Real') {
                this.tokenPtr++;
                if (comma.type === ',') {
                  this.tokenPtr++;
                  const angle = this.tokens[this.tokenPtr];
                  if (angle.type === 'Real') {
                    return {
                      node: 'Triangle',
                      label,
                      xAxis,
                      yAxis,
                      angle,
                    };
                  } else {
                    return {
                      node: 'Triangle',
                      label,
                      xAxis,
                      yAxis,
                      angle: null,
                      error: {
                        message: 'Угол должн быть задан вещественным числом.',
                        start: yAxis.token.start,
                        end: yAxis.token.end,
                      },
                    };
                  }
                } else {
                  return {
                    node: 'Triangle',
                    label,
                    xAxis,
                    yAxis: null,
                    angle: null,
                    error: {
                      message: 'После стороны ожидается ",".',
                      start: comma.token.start,
                      end: comma.token.end,
                    },
                  };
                }
              } else {
                return {
                  node: 'Triangle',
                  label,
                  xAxis,
                  yAxis: null,
                  angle: null,
                  error: {
                    message: 'Сторона должна быть задана вещественным числом.',
                    start: yAxis.token.start,
                    end: yAxis.token.end,
                  },
                };
              }
            } else {
              return {
                node: 'Triangle',
                label,
                xAxis,
                yAxis: null,
                error: {
                  message: 'После стороны ожидается ",".',
                  start: comma.token.start,
                  end: comma.token.end,
                },
              };
            }
          } else {
            return {
              node: 'Triangle',
              label,
              xAxis: null,
              yAxis: null,
              error: {
                message: 'Сторона должна быть задана вещественным числом.',
                start: xAxis.token.start,
                end: xAxis.token.end,
              },
            };
          }
          break;
          }
        case 'trapezium': {
          const xAxis = this.tokens[this.tokenPtr];
          if (xAxis.type === 'Real') {
            this.tokenPtr++;
            const comma = this.tokens[this.tokenPtr];
            if (comma.type === ',') {
              this.tokenPtr++;
              const yAxis = this.tokens[this.tokenPtr];
              if (yAxis.type === 'Real') {
                this.tokenPtr++;
                const comma = this.tokens[this.tokenPtr];
                if (comma.type === ',') {
                  this.tokenPtr++;
                  const zAxis = this.tokens[this.tokenPtr];
                  if (zAxis.type === 'Real') {
                    this.tokenPtr++;
                    const comma = this.tokens[this.tokenPtr];
                    if (comma.type === ',') {
                      this.tokenPtr++;
                      const angle = this.tokens[this.tokenPtr];
                      if (angle.type === 'Real') {
                        return {
                          node: 'Trapezium',
                          label,
                          xAxis,
                          yAxis,
                          zAxis,
                          angle,
                        };
                      } else {
                        return {
                          node: 'Trapezium',
                          label,
                          xAxis,
                          yAxis,
                          zAxis,
                          angle: null,
                          error: {
                            message: 'Угол должн быть задан вещественным числом.',
                            start: yAxis.token.start,
                            end: yAxis.token.end,
                          },
                        };
                      }
                    } else {
                      return {
                        node: 'Trapezium',
                        label,
                        xAxis,
                        yAxis,
                        zAxis,
                        angle: null,
                        error: {
                          message: 'После стороны ожидается ",".',
                          start: comma.token.start,
                          end: comma.token.end,
                        },
                      };
                    }
                  } else {
                    return {
                      node: 'Trapezium',
                      label,
                      xAxis,
                      yAxis,
                      zAxis: null,
                      angle: null,
                      error: {
                        message: 'Сторона должна быть задана вещественным числом.',
                        start: zAxis.token.start,
                        end: zAxis.token.end,
                      },
                    };
                  }
                } else {
                  return {
                    node: 'Trapezium',
                    label,
                    xAxis,
                    yAxis,
                    zAxis: null,
                    angle: null,
                    error: {
                      message: 'После стороны ожидается ",".',
                      start: comma.token.start,
                      end: comma.token.end,
                    },
                  };
                }
              } else {
                return {
                  node: 'Trapezium',
                  label,
                  xAxis,
                  yAxis: null,
                  zAxis: null,
                  angle: null,
                  error: {
                    message: 'Сторона должна быть задана вещественным числом',
                    start: comma.token.start,
                    end: comma.token.end,
                  },
                };
              }
            } else {
              return {
                node: 'Trapezium',
                label,
                xAxis,
                yAxis: null,
                zAxis: null,
                angle: null,
                error: {
                  message: 'После стороны ожидается ",".',
                  start: comma.token.start,
                  end: comma.token.end,
                },
              };
            }
          } else {
            return {
              node: 'Trapezium',
              label,
              xAxis: null,
              yAxis: null,
              zAxis: null,
              angle: null,
              error: {
                message: 'Сторона должна быть задана вещественным числом.',
                start: xAxis.token.start,
                end: xAxis.token.end,
              },
            };
          }
          break;
        }
        case 'paral': {
          const xAxis = this.tokens[this.tokenPtr];
          if (xAxis.type === 'Real') {
            this.tokenPtr++;
            const comma = this.tokens[this.tokenPtr];
            if (comma.type === ',') {
              this.tokenPtr++;
              const yAxis = this.tokens[this.tokenPtr];
              if (yAxis.type === 'Real') {
                this.tokenPtr++;
                const comma = this.tokens[this.tokenPtr];
                if (comma.type === ',') {
                  this.tokenPtr++;
                  const height = this.tokens[this.tokenPtr];
                  if (height.type === 'Real') {
                    this.tokenPtr++;
                    const comma = this.tokens[this.tokenPtr];
                    if (comma.type === ',') {
                      this.tokenPtr++;
                      const angle = this.tokens[this.tokenPtr];
                      if (angle.type === 'Real') {
                        return {
                          node: 'Paral',
                          label,
                          xAxis,
                          yAxis,
                          height,
                          angle,
                        };
                      } else {
                        return {
                          node: 'Paral',
                          label,
                          xAxis,
                          yAxis,
                          height,
                          angle: null,
                          error: {
                            message: 'Угол должн быть задан вещественным числом.',
                            start: yAxis.token.start,
                            end: yAxis.token.end,
                          },
                        };
                      }
                    } else {
                      return {
                        node: 'Paral',
                        label,
                        xAxis,
                        yAxis,
                        height,
                        angle: null,
                        error: {
                          message: 'После высоты ожидается ",".',
                          start: comma.token.start,
                          end: comma.token.end,
                        },
                      };
                    }
                  } else {
                    return {
                      node: 'Paral',
                      label,
                      xAxis,
                      yAxis,
                      height: null,
                      angle: null,
                      error: {
                        message: 'Высота должна быть задана вещественным числом.',
                        start: height.token.start,
                        end: height.token.end,
                      },
                    };
                  }
                } else {
                  return {
                    node: 'Paral',
                    label,
                    xAxis,
                    yAxis,
                    height: null,
                    angle: null,
                    error: {
                      message: 'После стороны ожидается ",".',
                      start: comma.token.start,
                      end: comma.token.end,
                    },
                  };
                }
              } else {
                return {
                  node: 'Paral',
                  label,
                  xAxis,
                  yAxis: null,
                  height: null,
                  angle: null,
                  error: {
                    message: 'Сторона должна быть задана вещественным числом',
                    start: comma.token.start,
                    end: comma.token.end,
                  },
                };
              }
            } else {
              return {
                node: 'Trapezium',
                label,
                xAxis,
                yAxis: null,
                height: null,
                angle: null,
                error: {
                  message: 'После стороны ожидается ",".',
                  start: comma.token.start,
                  end: comma.token.end,
                },
              };
            }
          } else {
            return {
              node: 'Trapezium',
              label,
              xAxis: null,
              yAxis: null,
              height: null,
              angle: null,
              error: {
                message: 'Сторона должна быть задана вещественным числом.',
                start: xAxis.token.start,
                end: xAxis.token.end,
              },
            };
          }
          break;
        }
        }
      } else {
        return {
          node: 'Figure',
          label,
          error: {
            message: 'После фигуры ожидается ",".',
            start: comma.token.start,
            end: comma.token.end,
          },
        };
      }
    } else {
      return {
        node: 'Figure',
        error: {
          message: 'Фигура должна начинаеться с "circle", "rectangle", "triangle", "trapezium", "paral".',
          start: label.token.start,
          end: label.token.end,
        },
      };
    }
  }

  private parseCalculations(): any {
    const operator = this.parseOperator();
    const comma = this.tokens[this.tokenPtr];
    if (comma.type === ',') {
      this.tokenPtr++;
      if (this.tokens[this.tokenPtr + 1].type === ';') {
        const calculations = this.parseCalculations();
        return {
          node: 'Calculations',
          operator,
          calculations,
        };
      } else {
        return {
          node: 'Calculations',
          operator,
        };
      }
    } else {
      return {
        node: 'Calculations',
        operator,
      };
    }
    console.log(this.tokens[this.tokenPtr]);

  }

  private parseOperator() {
    const id = this.tokens[this.tokenPtr];
    if (id.type === 'Integer') {
      this.tokenPtr++;
      const semicolon = this.tokens[this.tokenPtr];
      if (semicolon.type === ';') {
        this.tokenPtr++;
        const label = this.tokens[this.tokenPtr];
        if (label.type === 'Label') {
          this.tokenPtr++;
          const colon = this.tokens[this.tokenPtr];
          if (colon.type === ':') {
            this.tokenPtr++;
            const formula = this.parseFormula();
            return {
              node: 'Operator',
              id,
              label,
              formula,
            };
          } else {
            return {
              node: 'Operator',
              id,
              label,
              formula: null,
              error: {
                message: 'После метки ожидается ":".',
                start: semicolon.token.start,
                end: semicolon.token.end,
              },
            };
          }
        } else {
          return {
            node: 'Operator',
            id,
            label: null,
            formula: null,
            error: {
              message: 'Метка может принимать значения: "circle", "rectangle", "triangle", "trapezium", "paral".',
              start: label.token.start,
              end: label.token.end,
            },
          };
        }
      } else {
        return {
          node: 'Operator',
          id: null,
          label: null,
          formula: null,
          error: {
            message: 'После id ожидается ";".',
            start: semicolon.token.start,
            end: semicolon.token.end,
          },
        };
      }
    } else {
      return {
        node: 'Operator',
        id: null,
        label: null,
        formula: null,
        error: {
          message: 'Id не целое.',
          start: id.token.start,
          end: id.token.end,
        },
      };
    }
  }

  private parseFormula() {
    const left = this.tokens[this.tokenPtr];
    if (left.type === 'Square') {
      this.tokenPtr++;
      const eq = this.tokens[this.tokenPtr];
      if (eq.type === '=') {
        this.tokenPtr++;
        const right = this.parseRight();
        return {
          node: 'Formula',
          left,
          right,
        };
      } else {
        return {
          node: 'Formula',
          left,
          right: null,
          error: {
            message: 'Ожидается "=".',
            start: left.token.start,
            end: left.token.end,
          },
        };
      }
    } else if (left.type === 'Perimeter') {
      this.tokenPtr++;
      const eq = this.tokens[this.tokenPtr];
      if (eq.type === '=') {
        this.tokenPtr++;
        const right = this.parseRight();
        return {
          node: 'Formula',
          left,
          right,
        };
      } else {
        return {
          node: 'Formula',
          left,
          right: null,
          error: {
            message: 'Ожидается "=".',
            start: left.token.start,
            end: left.token.end,
          },
        };
      }
    } else {
      return {
        node: 'Formula',
        left: null,
        right: null,
        error: {
          message: 'Ожидается "s" или "p".',
          start: left.token.start,
          end: left.token.end,
        },
      };
    }
  }

  private parseRight() {
    return this.parseAS();
  }

  private parseF(): any {
    const LP = this.tokens[this.tokenPtr];
    if (LP.type === '(') {
      this.tokenPtr++;
      const ev = this.parseAS();
      const RP = this.tokens[this.tokenPtr];
      if (RP.type === ')') {
        this.tokenPtr++;
        return {
          node: 'F',
          ev,
        };
      } else {
        return {
          node: 'F',
          ev,
          error: {
            message: 'Ожидается закрытая скобка ")".',
            start: RP.token.start,
            end: RP.token.end,
          },
        };
      }
    } else {
      return this.parseU();
    }
  }

  private parseP() {
    const LP = this.tokens[this.tokenPtr];
    if (LP.type === '(') {
      this.tokenPtr++;
      const ev = this.parseAS();
      const RP = this.tokens[this.tokenPtr];
      if (RP.type === ')') {
        this.tokenPtr++;
        return {
          node: 'F',
          ev,
        };
      } else {
        return {
          node: 'F',
          ev,
          error: {
            message: 'Ожидается закрытая скобка ")".',
            start: RP.token.start,
            end: RP.token.end,
          },
        };
      }
    } else if (LP.type === '-') {
      this.tokenPtr++;
      const LP = this.tokens[this.tokenPtr];
      if (LP.type === '(') {
        this.tokenPtr++;
        const ev = this.parseAS();
        const RP = this.tokens[this.tokenPtr];
        if (RP.type === ')') {
          this.tokenPtr++;
          return {
            node: 'F',
            ev,
          };
        } else {
          return {
            node: 'F',
            ev,
            error: {
              message: 'Ожидается закрытая скобка ")".',
              start: RP.token.start,
              end: RP.token.end,
            },
          };
        }
      } else {
        const u = this.parseU();
        return {
          value: -(u as any).value,
        };
      }
    } else {
      return this.parseU();
    }
  }

  private parseE(): any {
    const p = this.parseP();
    const exp = this.tokens[this.tokenPtr];
    if (exp.type === '^') {
      this.tokenPtr++;
      const e = this.parseE();
      return {
        node: 'Exp',
        p,
        e,
        value: Math.pow(parseFloat((p as any).value), parseFloat((e as any).value)),
      };
    } else {
      return p;
    }
  }

  private parseMD() {
    const e = this.parseE();
    const md = this.parseMDl();
    return {
      node: 'MD',
      e,
      md,
    };
  }

  private parseMDl(): any {
    const mul = this.tokens[this.tokenPtr];
    if (mul.type === '/' || mul.type === '*') {
      this.tokenPtr++;
      const e = this.parseE();
      const md = this.parseMDl();
      return {
        op: mul.type,
        node: 'MDl',
        e,
        md,
      };
    } else {
      return;
    }
  }

  private parseAS() {
    const md = this.parseMD();
    const as = this.parseASl();
    return {
      node: 'AS',
      md,
      as,
    };
  }

  private parseASl(): any {
    const mul = this.tokens[this.tokenPtr];
    if (mul.type === '-' || mul.type === '+') {
      this.tokenPtr++;
      const md = this.parseMD();
      const as = this.parseASl();
      return {
        node: 'ASl',
        md,
        as,
      };
    } else {
      return;
    }
  }

  private parseU() {
    const m = this.tokens[this.tokenPtr];
    if (m.type === '-') {
      this.tokenPtr++;
      const n = this.parseN();
      return {
        node: 'Unary',
        n,
        value: -(n as any).value,
      };
    } else {
      return this.parseN();
    }
  }

  private parseN() {
    const n = this.tokens[this.tokenPtr];
    if (n.type === 'Real') {
      this.tokenPtr++;
      return n;
    } else if (n.type === 'Integer') {
      this.tokenPtr++;
      return n;
    } else if (n.type === 'Function') {
      this.tokenPtr++;
      const f = this.parseF();
      return {
        node: 'N',
        n,
        f,
      };
    } else {
      return {
        node: 'N',
        error: {
          message: 'Ожидается функция, целое или вещественное число.',
          start: n.token.start,
          end: n.token.end,
        },
      };
    }
  }

}
