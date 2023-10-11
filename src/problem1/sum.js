var SumOfNumber = /** @class */ (function () {
    function SumOfNumber(n) {
        // if (n > Number.MAX_SAFE_INTEGER) {
        //   throw new Error("Input is too large to compute the sum.");
        // }
    }
    // Iteration solution
    // Complexity: O(n) since the algorithm iterates from 1 to n.
    SumOfNumber.prototype.sum_to_n_iteration = function (n) {
        var sum = 0;
        var i = 1;
        do {
            sum += i;
            i++;
        } while (i <= n);
        return sum;
    };
    // Recursive solution
    // Time Complexity: O(n) since the algorithm takes n recursice call till it reaches 1.
    // Space Complexity: O(n) since it takes n call stack
    SumOfNumber.prototype.sum_to_n_recursive = function (n) {
        if (n === 1) {
            return 1;
        }
        return n + this.sum_to_n_recursive(n - 1);
    };
    // Applying formula sum = n * (n + 1)/2 solution
    // Time Complexity: O(1) since the algorithm applies the formula to get result.
    SumOfNumber.prototype.sum_to_n_c = function (n) {
        return (n * (n + 1)) / 2;
    };
    return SumOfNumber;
}());
var sumOfNumber = new SumOfNumber(100);
console.time('Iteration Approach');
var sumA = sumOfNumber.sum_to_n_iteration(100);
console.log(sumA);
console.timeEnd('Iteration Approach');
console.time('Recursive Approach');
var sumB = sumOfNumber.sum_to_n_recursive(100);
console.log(sumB);
console.timeEnd('Recursive Approach');
console.time('Formula Approach');
var sumC = sumOfNumber.sum_to_n_c(100);
console.log(sumC);
console.timeEnd('Formula Approach');
