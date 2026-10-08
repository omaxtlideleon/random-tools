const testUntil = 1000n;

const sqrtCache = new Map();

function bigSqrt(n) {
    if (sqrtCache.has(n)) return sqrtCache.get(n);
    if (n < 2n) return n;

    let x = n >> BigInt(n.toString(2).length >> 1);
    let y = (x + n / x) >> 1n;

    while (y < x) {
        x = y;
        y = (x + n / x) >> 1n;
    }

    sqrtCache.set(n, x);
    return x;
}

function findLargestPeak(stopAt) {
    let globalMaxPeak = 0n;
    let winnerStart = 0n;
    let winnerSteps = 0;
    let totalSteps = 0;

    for (let i = 0n; i <= stopAt; i++) {
        let current = i;
        let localMax = i;
        let steps = 0;

        while (current > 1n) {
            // Even = n^(1/2), Odd = n^(3/2)
            if (current % 2n === 0n) {
                current = bigSqrt(current);
            } else {
                current = bigSqrt(current ** 3n);
            }
            
            if (current > localMax) localMax = current;
            steps++;
            totalSteps++;
        }

        if (localMax > globalMaxPeak) {
            globalMaxPeak = localMax;
            winnerStart = i;
            winnerSteps = steps;
        }
    }
    return { winnerStart, globalMaxPeak, winnerSteps, totalSteps };
}

function toScientificNotation(bigInt) {
    const str = bigInt.toString();
    if (str.length <= 15) return str;
    return `${str[0]}.${str.slice(1, 4)} x 10^${str.length - 1}`;
}

const startTime = performance.now();
const result = findLargestPeak(testUntil);
const endTime = performance.now();

console.log(`--- Search complete (0 to ${testUntil}) ---`);
console.log(`Winner Start: ${result.winnerStart}`);
console.log(`Peak Value:   ${toScientificNotation(result.globalMaxPeak)}`);
console.log(`Steps:        ${result.winnerSteps}`);
console.log(`Total Steps:  ${result.totalSteps}`);
console.log(`Time:         ${(endTime - startTime).toFixed(2)} ms`);
