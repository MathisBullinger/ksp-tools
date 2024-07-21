export type Vec = [x: number, y: number];

export const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1]];
export const subtract = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1]];

export const multiply = (vec: Vec, m: number): Vec => [vec[0] * m, vec[1] * m];
export const divide = (vec: Vec, m: number): Vec => multiply(vec, 1 / m);

export const magnitude = ([x, y]: Vec): number => Math.sqrt(x ** 2 + y ** 2);
export const scale = (vec: Vec, m: number): Vec =>
  multiply(vec, (1 / magnitude(vec)) * m);

export const rotate = ([x, y]: Vec, theta: number): Vec => [
  Math.cos(theta) * x - Math.sin(theta) * y,
  Math.sin(theta) * x + Math.cos(theta) * y,
];
