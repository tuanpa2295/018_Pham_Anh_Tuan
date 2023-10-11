class SumOfNumber {
  // Iteration solution
  // Complexity: O(n) since the algorithm iterates from 1 to n.
  public static sum_to_n_iteration(n: number): number {
    let sum: number = 0;
    let i: number = 1;

    do {
        sum += i;
        i++;
    } while (i <= n);

    return sum;
  }

  // Recursive solution
  // Time Complexity: O(n) since the algorithm takes n recursice call till it reaches 1.
  // Space Complexity: O(n) since it takes n call stack
  public static sum_to_n_recursive(n: number): number {
    if (n > Number.MAX_SAFE_INTEGER) {
      throw new Error("Input is too large. Cannot compute the sum.");
    }

    if (n === 1) {
        return 1;
    }
    return n + this.sum_to_n_recursive(n - 1);
  }

  // Applying formula sum = n * (n + 1)/2 solution
  // Time Complexity: O(1) since the algorithm applies the formula to get result.
  public static sum_to_n_c(n: number): number {
    return (n * (n + 1)) / 2;
  }
}

console.time('Iteration Approach');
const sumA = SumOfNumber.sum_to_n_iteration(100);
console.log('Iteration Approach', sumA);
console.timeLog('Iteration Approach');

console.time('Recursive Approach');
const sumB = SumOfNumber.sum_to_n_recursive(100);
console.log('Recursive Approach', sumB);
console.timeLog('Recursive Approach');

console.time('Formula Approach');
const sumC = SumOfNumber.sum_to_n_c(100);
console.log('Formula Approach', sumC);
console.timeLog('Formula Approach');
