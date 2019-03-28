
export function isValid(input: string) {
  return /^[a-zA-Z0-9|.|;|=|\-|\+|\*|\/|\(|\)|\^|\s]*$/.test(input);
}

export function isEOL(input: string) {
  return input.length === 0;
}

export function isWhitespace(input: string) {
  return /^(\s)$/.test(input);
}

export function isNewLine(input: string) {
  return /^(\n)$/.test(input);
}

export function isSymbol(input: string) {
  return /^[a-zA-Z0-9]$/.test(input);
}

export function isLetter(input: string) {
  return /^[a-zA-Z]$/.test(input);
}

export function isDigit(input: string) {
  return /^[0-9]$/.test(input);
}

export function isReservedSymbol(input: string) {
  return /^(;|=|-|\+|\*|\/|\(|\)|\^)$/.test(input);
}

export function isDot(input: string) {
  return /^(.)$/.test(input);
}

export function isInteger(input: string) {
  return /^[0-9]+$/.test(input);
}

export function isReal(input: string) {
  return /^([0-9]+\.[0-9]+)$/.test(input);
}

export function isVariable(input: string) {
  return /^[a-zA-Z][a-zA-Z0-9]*$/.test(input);
}

export function isFunction(input: string) {
  return /^(sin|cos|abs)$/.test(input);
}

export function isEndJob(input: string) {
  return /^(End|of|job)$/.test(input);
}

export function isType(input: string) {
  return /^(Real|Int)$/.test(input);
}

export function isBorder(input: string) {
  return /^(Begin)$/.test(input);
}
