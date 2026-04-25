import type { Formula } from "@/lib/industrial-data";

type TokenType = "number" | "identifier" | "operator" | "leftParen" | "rightParen" | "comma" | "function";

interface Token {
  type: TokenType;
  value: string;
}

export interface FormulaValidation {
  valid: boolean;
  error?: string;
  variablesInExpression: string[];
  missingVariables: string[];
  unusedVariables: string[];
}

const functionArities: Record<string, number> = {
  abs: 1,
  cbrt: 1,
  cos: 1,
  exp: 1,
  ln: 1,
  log: 1,
  max: 2,
  min: 2,
  sin: 1,
  sqrt: 1,
  tan: 1,
};

const constants: Record<string, number> = {
  pi: Math.PI,
};

const operatorPrecedence: Record<string, number> = {
  "+": 1,
  "-": 1,
  "*": 2,
  "/": 2,
  "^": 4,
  "u-": 5,
};

const rightAssociative = new Set(["^", "u-"]);

export function getFormulaBody(expression: string) {
  const [, ...rightSide] = expression.split("=");
  return normalizeMathExpression(rightSide.length ? rightSide.join("=") : expression);
}

export function getResultSymbol(expression: string) {
  const [leftSide] = expression.split("=");
  const symbol = leftSide.trim();
  return symbol || "Resultado";
}

export function normalizeMathExpression(expression: string) {
  return expression
    .replace(/[×·]/g, "*")
    .replace(/\s[xX]\s/g, " * ")
    .replace(/(\d),(\d)/g, "$1.$2")
    .trim();
}

export function extractVariableNames(expression: string) {
  const body = getFormulaBody(expression);
  const tokens = tokenize(body);
  const names = tokens
    .filter((token) => token.type === "identifier")
    .map((token) => token.value)
    .filter((name) => !(name in constants) && !(name in functionArities));

  return Array.from(new Set(names));
}

export function validateFormula(expression: string, variableNames: string[]): FormulaValidation {
  const declaredNames = variableNames.map((name) => name.trim()).filter(Boolean);

  if (!expression.trim()) {
    return {
      valid: false,
      error: "Digite uma formula para validar.",
      variablesInExpression: [],
      missingVariables: [],
      unusedVariables: declaredNames,
    };
  }

  try {
    const expressionVariables = extractVariableNames(expression);
    const missingVariables = expressionVariables.filter((name) => !declaredNames.includes(name));
    const unusedVariables = declaredNames.filter((name) => !expressionVariables.includes(name));
    const sampleValues = Object.fromEntries(expressionVariables.map((name) => [name, 1]));

    evaluateExpression(getFormulaBody(expression), sampleValues);

    return {
      valid: missingVariables.length === 0,
      error: missingVariables.length ? `Variaveis sem cadastro: ${missingVariables.join(", ")}.` : undefined,
      variablesInExpression: expressionVariables,
      missingVariables,
      unusedVariables,
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Formula invalida.",
      variablesInExpression: [],
      missingVariables: [],
      unusedVariables: declaredNames,
    };
  }
}

export function evaluateFormula(formula: Formula, values: Record<string, string | number>) {
  const numericValues = Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, typeof value === "number" ? value : Number.parseFloat(value || "0")]),
  );

  return evaluateExpression(getFormulaBody(formula.expression), numericValues);
}

export function buildCalculationSteps(formula: Formula, values: Record<string, string>, result: string | null) {
  const resultSymbol = getResultSymbol(formula.expression);
  const body = getFormulaBody(formula.expression);
  const substitutedBody = substituteVariables(body, values);

  return [
    `${formula.expression}`,
    `${resultSymbol} = ${formatFormulaForDisplay(substitutedBody)}`,
    result ? `${resultSymbol} = ${result}${formula.resultUnit ? ` ${formula.resultUnit}` : ""}` : `${resultSymbol} = aguardando calculo`,
  ];
}

export function formatFormulaForDisplay(expression: string) {
  return expression.replace(/\*/g, "x").replace(/\^/g, "^");
}

function tokenize(expression: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;
  let previousToken: Token | undefined;

  while (index < expression.length) {
    const char = expression[index];

    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    if (/[0-9.]/.test(char)) {
      let value = char;
      index += 1;
      while (index < expression.length && /[0-9.]/.test(expression[index])) {
        value += expression[index];
        index += 1;
      }
      if (Number.isNaN(Number.parseFloat(value))) {
        throw new Error(`Numero invalido: ${value}`);
      }
      previousToken = { type: "number", value };
      tokens.push(previousToken);
      continue;
    }

    if (/[A-Za-z_]/.test(char)) {
      let value = char;
      index += 1;
      while (index < expression.length && /[A-Za-z0-9_]/.test(expression[index])) {
        value += expression[index];
        index += 1;
      }

      const nextNonSpace = expression.slice(index).match(/\S/)?.[0];
      previousToken = {
        type: nextNonSpace === "(" && value in functionArities ? "function" : "identifier",
        value,
      };
      tokens.push(previousToken);
      continue;
    }

    if ("+-*/^".includes(char)) {
      const isUnaryMinus =
        char === "-" &&
        (!previousToken || previousToken.type === "operator" || previousToken.type === "leftParen" || previousToken.type === "comma");
      previousToken = { type: "operator", value: isUnaryMinus ? "u-" : char };
      tokens.push(previousToken);
      index += 1;
      continue;
    }

    if (char === "(") {
      previousToken = { type: "leftParen", value: char };
      tokens.push(previousToken);
      index += 1;
      continue;
    }

    if (char === ")") {
      previousToken = { type: "rightParen", value: char };
      tokens.push(previousToken);
      index += 1;
      continue;
    }

    if (char === ",") {
      previousToken = { type: "comma", value: char };
      tokens.push(previousToken);
      index += 1;
      continue;
    }

    throw new Error(`Caractere nao permitido: ${char}`);
  }

  return tokens;
}

function toRpn(tokens: Token[]) {
  const output: Token[] = [];
  const operators: Token[] = [];

  tokens.forEach((token) => {
    if (token.type === "number" || token.type === "identifier") {
      output.push(token);
      return;
    }

    if (token.type === "function") {
      operators.push(token);
      return;
    }

    if (token.type === "comma") {
      while (operators.length && operators[operators.length - 1].type !== "leftParen") {
        output.push(operators.pop() as Token);
      }
      if (!operators.length) {
        throw new Error("Separador de funcao fora de parenteses.");
      }
      return;
    }

    if (token.type === "operator") {
      while (operators.length) {
        const top = operators[operators.length - 1];
        const shouldPop =
          top.type === "operator" &&
          (operatorPrecedence[top.value] > operatorPrecedence[token.value] ||
            (operatorPrecedence[top.value] === operatorPrecedence[token.value] && !rightAssociative.has(token.value)));

        if (!shouldPop) break;
        output.push(operators.pop() as Token);
      }
      operators.push(token);
      return;
    }

    if (token.type === "leftParen") {
      operators.push(token);
      return;
    }

    if (token.type === "rightParen") {
      while (operators.length && operators[operators.length - 1].type !== "leftParen") {
        output.push(operators.pop() as Token);
      }
      if (!operators.length) {
        throw new Error("Parenteses sem abertura.");
      }
      operators.pop();
      if (operators.length && operators[operators.length - 1].type === "function") {
        output.push(operators.pop() as Token);
      }
    }
  });

  while (operators.length) {
    const token = operators.pop() as Token;
    if (token.type === "leftParen" || token.type === "rightParen") {
      throw new Error("Parenteses incompletos.");
    }
    output.push(token);
  }

  return output;
}

function evaluateExpression(expression: string, values: Record<string, number>) {
  const tokens = tokenize(expression);
  const rpn = toRpn(tokens);
  const stack: number[] = [];

  rpn.forEach((token) => {
    if (token.type === "number") {
      stack.push(Number.parseFloat(token.value));
      return;
    }

    if (token.type === "identifier") {
      if (token.value in constants) {
        stack.push(constants[token.value]);
        return;
      }
      if (!(token.value in values)) {
        throw new Error(`Variavel sem valor: ${token.value}`);
      }
      stack.push(values[token.value]);
      return;
    }

    if (token.type === "operator") {
      if (token.value === "u-") {
        const value = stack.pop();
        if (value === undefined) throw new Error("Operador negativo sem valor.");
        stack.push(-value);
        return;
      }

      const right = stack.pop();
      const left = stack.pop();
      if (left === undefined || right === undefined) {
        throw new Error(`Operador ${token.value} sem operandos.`);
      }

      if (token.value === "+") stack.push(left + right);
      if (token.value === "-") stack.push(left - right);
      if (token.value === "*") stack.push(left * right);
      if (token.value === "/") stack.push(left / right);
      if (token.value === "^") stack.push(left ** right);
      return;
    }

    if (token.type === "function") {
      const arity = functionArities[token.value];
      const args = stack.splice(stack.length - arity, arity);
      if (args.length !== arity) {
        throw new Error(`Funcao ${token.value} com argumentos insuficientes.`);
      }
      stack.push(runFunction(token.value, args));
    }
  });

  if (stack.length !== 1) {
    throw new Error("Formula incompleta ou ambigua.");
  }

  return stack[0];
}

function runFunction(name: string, args: number[]) {
  switch (name) {
    case "abs":
      return Math.abs(args[0]);
    case "cbrt":
      return Math.cbrt(args[0]);
    case "cos":
      return Math.cos(args[0]);
    case "exp":
      return Math.exp(args[0]);
    case "ln":
      return Math.log(args[0]);
    case "log":
      return Math.log10(args[0]);
    case "max":
      return Math.max(args[0], args[1]);
    case "min":
      return Math.min(args[0], args[1]);
    case "sin":
      return Math.sin(args[0]);
    case "sqrt":
      return Math.sqrt(args[0]);
    case "tan":
      return Math.tan(args[0]);
    default:
      throw new Error(`Funcao nao suportada: ${name}`);
  }
}

function substituteVariables(expression: string, values: Record<string, string>) {
  return tokenize(expression)
    .map((token) => {
      if (token.type === "identifier" && token.value in values) {
        return values[token.value] || "0";
      }
      if (token.type === "operator" && token.value === "u-") {
        return "-";
      }
      return token.value;
    })
    .join(" ");
}
