export function randomInt(a: number, b: number): number {
    const min: number = Math.min(a, b);
    const max: number = Math.max(a, b);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}