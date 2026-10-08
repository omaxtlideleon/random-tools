function narcissistic(maxDigits) {
    const results = [];

    for (let d = 1; d <= maxDigits; d++) {
        const dBig = BigInt(d);
        const powers = Array.from({ length: 10 }, (_, i) => BigInt(i) ** dBig);
        const minVal = d === 1 ? 0n : 10n ** (dBig - 1n);
        const maxVal = (10n ** dBig) - 1n;
        const counts = new Uint8Array(10);
        const offsets = Array.from({ length: 10 }, (_, digit) => 
            Array.from({ length: d + 1 }, (_, rem) => BigInt(rem) * powers[digit])
        );

        function backtrack(remainingSlots, startDigit, currentSum) {
            if (currentSum + offsets[startDigit][remainingSlots] < minVal) return;
            if (currentSum > maxVal) return;
            if (remainingSlots === 0) {
                if (check(currentSum, d, counts)) {
                    results.push(currentSum.toString());
                }
                return;
            }
            for (let digit = startDigit; digit >= 0; digit--) {
                counts[digit]++;
                backtrack(remainingSlots - 1, digit, currentSum + powers[digit]);
                counts[digit]--;
            }
        }
      
        function check(num, len, targetCounts) {
            const s = num.toString();
            if (s.length !== len) return false;
            const temp = new Uint8Array(10);
            for (let i = 0; i < s.length; i++) temp[s.charCodeAt(i) - 48]++;
            for (let i = 0; i < 10; i++) {
                if (temp[i] !== targetCounts[i]) return false;
            }
            return true;
        }
        backtrack(d, 9, 0n);
    }
    return results.sort((a, b) => (BigInt(a) < BigInt(b) ? -1 : 1));
}

const start = performance.now();
const found = narcissistic(10);
const end = performance.now();
console.log(`Found ${found.length} numbers. Took: ${(end - start).toFixed(2)}ms`);
console.log(`${found}`);
