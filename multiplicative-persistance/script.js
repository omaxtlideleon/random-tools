// compute the multiplicative persistence of a number (array of digits)
function multiplicativePersistenceFromDigits(digits, base = 10) {
    let steps = 0;
    // this should be correct
    while (digits.length > 1) {
        let product = 1;
        for (let digit of digits) {
            product *= digit;
            if (product === 0) break;
        }

        if (product < base) {
            return steps + 1;
        }

        digits = [];
        while (product > 0) {
            digits.push(product % base);
            product = Math.floor(product / base);
        }

        steps++;
    }

    return steps;
}

function* generateMultisets(length, minDigit, maxDigit) {
    const digits = Array(length).fill(minDigit);
    while (true) {
        yield [...digits];
        let i = length - 1;
        while (i >= 0 && digits[i] === maxDigit) i--;
        if (i < 0) break;
        const nextVal = digits[i] + 1;
        for (let j = i; j < length; j++) {
            digits[j] = nextVal;
        }
    }
}

function findHighestPersistence({ base = 10, timeLimit = null, maxDigits = 14, minDigit = 2 }) {
    let highestPersistence = 0;
    let digitsWithHighest = [];
    let totalChecked = 0;
    let foundAtLength = 0;

    const maxDigit = base - 1;
    const start = Date.now();

    for (let length = 1; length <= maxDigits; length++) {
        for (const digits of generateMultisets(length, minDigit, maxDigit)) {
            const persistence = multiplicativePersistenceFromDigits(digits, base);
            totalChecked++;

            if (persistence > highestPersistence) {
                highestPersistence = persistence;
                digitsWithHighest = digits;
                foundAtLength = length;
            }

            if (timeLimit && Date.now() - start > timeLimit) {
                return { digitsWithHighest, highestPersistence, foundAtLength, totalChecked };
            }
        }
    }

    return { digitsWithHighest, highestPersistence, foundAtLength, totalChecked };
}

function digitsToBigInt(digits, base) {
    return digits.reduce((acc, d) => acc * BigInt(base) + BigInt(d), 0n);
}

function toScientificNotation(bigInt, base = 10) {
    const str = bigInt.toString(base);
    const exponent = str.length - 1;
    const mantissa = str[0] + (str.length > 1 ? '.' + str.slice(1, 3) : '');
    return `${mantissa} x ${base}^${exponent}`;
}

const searchParams = { base: 10, maxDigits: 15, timeLimit: null, minDigit: 2 };
const t0 = performance.now();
const result = findHighestPersistence(searchParams);
const t1 = performance.now();

const numberBigInt = digitsToBigInt(result.digitsWithHighest, searchParams.base);
const expNumber = toScientificNotation(numberBigInt, searchParams.base);
const formattedDigits = result.digitsWithHighest.join('');

console.log(`Base: ${searchParams.base}`);
console.log('Number with Highest Persistence: ' + formattedDigits + ' (' + expNumber + ')');
console.log('Highest Persistence Found: ' + result.highestPersistence);
console.log('Found at digit length: ' + result.foundAtLength);
console.log('Total multisets checked: ' + result.totalChecked);

const timeTaken = t1 - t0;
if (timeTaken >= 1 && timeTaken < 1000) {
    console.log('Time Taken: ' + timeTaken.toFixed(2) + ' ms');
} else if (timeTaken < 1) {
    console.log('Time Taken: ' + (timeTaken * 1000).toFixed() + ' µs');
} else if (timeTaken >= 1000) {
    console.log('Time Taken: ' + (timeTaken / 1000).toFixed(3) + ' s');
}
