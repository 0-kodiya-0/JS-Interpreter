// JS-Interpreter Jest Test Suite
const Interpreter = require('../Interpreter.class');

// Mock acorn if it's not available in test environment
global.acorn = global.acorn || require('../acorn');

describe('JS-Interpreter', () => {
  let interpreter;
  let consoleOutput;

  beforeEach(() => {
    // Capture console output for testing
    consoleOutput = [];
    jest.spyOn(console, 'log').mockImplementation((text) => {
      consoleOutput.push(text);
    });
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  describe('Basic Functionality', () => {
    test('should execute simple arithmetic', () => {
      const code = `
        var result = 5 + 3;
        alert(result);
      `;

      const initFunc = createAlertFunction();
      interpreter = new Interpreter(code, initFunc);
      runInterpreterSync(interpreter);

      expect(consoleOutput).toContain(8);
    });

    test('should handle variable assignments', () => {
      const code = `
        var x = 10;
        var y = 20;
        var sum = x + y;
        alert(sum);
      `;

      const initFunc = createAlertFunction();
      interpreter = new Interpreter(code, initFunc);
      runInterpreterSync(interpreter);

      expect(consoleOutput).toContain(30);
    });

    test('should execute the fibonacci example', () => {
      const code = `
        var result = [];
        function fibonacci(n, output) {
          var a = 1, b = 1, sum;
          for (var i = 0; i < n; i++) {
            output.push(a);
            sum = a + b;
            a = b;
            b = sum;
          }
        }
        fibonacci(8, result);
        alert(result.join(', '));
      `;

      const initFunc = createAlertFunction();
      interpreter = new Interpreter(code, initFunc);
      runInterpreterSync(interpreter);

      expect(consoleOutput).toContain('1, 1, 2, 3, 5, 8, 13, 21');
    });
  });

  describe('Functions', () => {
    test('should handle function declarations and calls', () => {
      const code = `
        function greet(name) {
          return "Hello, " + name + "!";
        }
        var message = greet("World");
        alert(message);
      `;

      const initFunc = createAlertFunction();
      interpreter = new Interpreter(code, initFunc);
      runInterpreterSync(interpreter);

      expect(consoleOutput).toContain('Hello, World!');
    });

    test('should handle recursive functions', () => {
      const code = `
        function factorial(n) {
          if (n <= 1) return 1;
          return n * factorial(n - 1);
        }
        var result = factorial(5);
        alert(result);
      `;

      const initFunc = createAlertFunction();
      interpreter = new Interpreter(code, initFunc);
      runInterpreterSync(interpreter);

      expect(consoleOutput).toContain(120);
    });

    test('should handle function expressions', () => {
      const code = `
        var multiply = function(a, b) {
          return a * b;
        };
        var result = multiply(4, 7);
        alert(result);
      `;

      const initFunc = createAlertFunction();
      interpreter = new Interpreter(code, initFunc);
      runInterpreterSync(interpreter);

      expect(consoleOutput).toContain(28);
    });
  });

  describe('Control Flow', () => {
    test('should handle if-else statements', () => {
      const code = `
        var x = 15;
        if (x > 10) {
          alert("greater than 10");
        } else {
          alert("less than or equal to 10");
        }
      `;

      const initFunc = createAlertFunction();
      interpreter = new Interpreter(code, initFunc);
      runInterpreterSync(interpreter);

      expect(consoleOutput).toContain('greater than 10');
    });

    test('should handle for loops', () => {
      const code = `
        var sum = 0;
        for (var i = 1; i <= 5; i++) {
          sum += i;
        }
        alert(sum);
      `;

      const initFunc = createAlertFunction();
      interpreter = new Interpreter(code, initFunc);
      runInterpreterSync(interpreter);

      expect(consoleOutput).toContain(15);
    });

    test('should handle while loops', () => {
      const code = `
        var count = 0;
        var sum = 0;
        while (count < 4) {
          sum += count;
          count++;
        }
        alert(sum);
      `;

      const initFunc = createAlertFunction();
      interpreter = new Interpreter(code, initFunc);
      runInterpreterSync(interpreter);

      expect(consoleOutput).toContain(6);
    });
  });

  describe('Arrays and Objects', () => {
    test('should handle array operations', () => {
      const code = `
        var arr = [1, 2, 3];
        arr.push(4);
        alert(arr.length);
        alert(arr[3]);
      `;

      const initFunc = createAlertFunction();
      interpreter = new Interpreter(code, initFunc);
      runInterpreterSync(interpreter);

      expect(consoleOutput).toContain(4);
      expect(consoleOutput).toContain(4);
    });

    test('should handle object properties', () => {
      const code = `
        var person = {
          name: "John",
          age: 30
        };
        person.city = "New York";
        alert(person.name);
        alert(person.age);
        alert(person.city);
      `;

      const initFunc = createAlertFunction();
      interpreter = new Interpreter(code, initFunc);
      runInterpreterSync(interpreter);

      expect(consoleOutput).toContain('John');
      expect(consoleOutput).toContain(30);
      expect(consoleOutput).toContain('New York');
    });
  });

  describe('Native Functions', () => {
    test('should handle custom native functions', () => {
      const code = `
        var result = customAdd(5, 3);
        alert(result);
      `;

      const initFunc = function(interpreter, globalObject) {
        // Alert function
        const alertWrapper = function(text) {
          console.log(text);
        };
        interpreter.setProperty(globalObject, 'alert',
            interpreter.createNativeFunction(alertWrapper));

        // Custom add function
        const addWrapper = function(a, b) {
          return a + b;
        };
        interpreter.setProperty(globalObject, 'customAdd',
            interpreter.createNativeFunction(addWrapper));
      };

      interpreter = new Interpreter(code, initFunc);
      runInterpreterSync(interpreter);

      expect(consoleOutput).toContain(8);
    });

    test('should handle native functions with callbacks', () => {
      const code = `
        var numbers = [1, 2, 3, 4, 5];
        var doubled = mapArray(numbers, function(x) {
          return x * 2;
        });
        alert(doubled.join(', '));
      `;

      const initFunc = function(interpreter, globalObject) {
        // Alert function
        const alertWrapper = function(text) {
          console.log(text);
        };
        interpreter.setProperty(globalObject, 'alert',
            interpreter.createNativeFunction(alertWrapper));

        // Map array function
        const mapWrapper = function(arr, callback) {
          const result = [];
          for (let i = 0; i < arr.length; i++) {
            result.push(callback(arr[i], i));
          }
          return result;
        };
        interpreter.setProperty(globalObject, 'mapArray',
            interpreter.createNativeFunction(mapWrapper));
      };

      interpreter = new Interpreter(code, initFunc);
      runInterpreterSync(interpreter);

      expect(consoleOutput).toContain('2, 4, 6, 8, 10');
    });
  });

  describe('Error Handling', () => {
    test('should handle syntax errors gracefully', () => {
      const invalidCode = `
        var x = 5 +;
      `;

      expect(() => {
        new Interpreter(invalidCode);
      }).toThrow();
    });

    test('should handle runtime errors', () => {
      const code = `
        var obj = null;
        obj.property = "test";
      `;

      const initFunc = createAlertFunction();
      interpreter = new Interpreter(code, initFunc);

      expect(() => {
        runInterpreterSync(interpreter);
      }).toThrow();
    });

    test('should handle undefined variables', () => {
      const code = `
        alert(undefinedVariable);
      `;

      const initFunc = createAlertFunction();
      interpreter = new Interpreter(code, initFunc);

      expect(() => {
        runInterpreterSync(interpreter);
      }).toThrow();
    });
  });

  describe('Async Execution', () => {
    test('should handle step-by-step execution', () => {
      const code = `
        for (var i = 0; i < 3; i++) {
          alert(i);
        }
      `;

      const initFunc = createAlertFunction();
      interpreter = new Interpreter(code, initFunc);

      let steps = 0;
      while (!interpreter.run() && steps < 100) {
        steps++;
      }

      expect(consoleOutput).toEqual([0, 1, 2]);
      expect(steps).toBeGreaterThan(0);
    });

    test('should handle async completion with setTimeout simulation', (done) => {
      const code = `
        var count = 0;
        function increment() {
          count++;
          alert(count);
          if (count < 3) {
            setTimeout(increment, 1);
          }
        }
        increment();
      `;

      const initFunc = function(interpreter, globalObject) {
        // Alert function
        const alertWrapper = function(text) {
          console.log(text);
        };
        interpreter.setProperty(globalObject, 'alert',
            interpreter.createNativeFunction(alertWrapper));

        // setTimeout simulation
        const setTimeoutWrapper = function(callback, delay) {
          setTimeout(() => {
            callback();
          }, delay);
        };
        interpreter.setProperty(globalObject, 'setTimeout',
            interpreter.createNativeFunction(setTimeoutWrapper));
      };

      interpreter = new Interpreter(code, initFunc);

      const runToCompletion = function() {
        if (interpreter.run()) {
          setTimeout(runToCompletion, 10);
        } else {
          expect(consoleOutput).toEqual([1, 2, 3]);
          done();
        }
      };
      runToCompletion();
    });
  });

  describe('Complex Examples', () => {
    test('should handle object-oriented patterns', () => {
      const code = `
        function Person(name, age) {
          this.name = name;
          this.age = age;
        }
        
        Person.prototype.greet = function() {
          return "Hi, I'm " + this.name + " and I'm " + this.age + " years old.";
        };
        
        var john = new Person("John", 25);
        alert(john.greet());
      `;

      const initFunc = createAlertFunction();
      interpreter = new Interpreter(code, initFunc);
      runInterpreterSync(interpreter);

      expect(consoleOutput).toContain("Hi, I'm John and I'm 25 years old.");
    });

    test('should handle closures', () => {
      const code = `
        function createCounter(start) {
          var count = start;
          return function() {
            count++;
            return count;
          };
        }
        
        var counter = createCounter(5);
        alert(counter());
        alert(counter());
        alert(counter());
      `;

      const initFunc = createAlertFunction();
      interpreter = new Interpreter(code, initFunc);
      runInterpreterSync(interpreter);

      expect(consoleOutput).toEqual([6, 7, 8]);
    });

    test('should handle complex array manipulations', () => {
      const code = `
        var numbers = [1, 2, 3, 4, 5];
        var doubled = [];
        var filtered = [];
        
        // Double each number
        for (var i = 0; i < numbers.length; i++) {
          doubled.push(numbers[i] * 2);
        }
        
        // Filter even numbers from doubled array
        for (var j = 0; j < doubled.length; j++) {
          if (doubled[j] % 2 === 0) {
            filtered.push(doubled[j]);
          }
        }
        
        alert("Original: " + numbers.join(', '));
        alert("Doubled: " + doubled.join(', '));
        alert("Even doubled: " + filtered.join(', '));
      `;

      const initFunc = createAlertFunction();
      interpreter = new Interpreter(code, initFunc);
      runInterpreterSync(interpreter);

      expect(consoleOutput).toContain('Original: 1, 2, 3, 4, 5');
      expect(consoleOutput).toContain('Doubled: 2, 4, 6, 8, 10');
      expect(consoleOutput).toContain('Even doubled: 2, 4, 6, 8, 10');
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty code', () => {
      const code = '';
      const initFunc = createAlertFunction();
      
      expect(() => {
        interpreter = new Interpreter(code, initFunc);
        runInterpreterSync(interpreter);
      }).not.toThrow();
    });

    test('should handle code with only comments', () => {
      const code = `
        // This is a comment
        /* This is also a comment */
      `;

      const initFunc = createAlertFunction();
      interpreter = new Interpreter(code, initFunc);
      runInterpreterSync(interpreter);

      expect(consoleOutput).toHaveLength(0);
    });

    test('should handle nested function calls', () => {
      const code = `
        function add(a, b) {
          return a + b;
        }
        
        function multiply(a, b) {
          return a * b;
        }
        
        var result = multiply(add(2, 3), add(4, 6));
        alert(result);
      `;

      const initFunc = createAlertFunction();
      interpreter = new Interpreter(code, initFunc);
      runInterpreterSync(interpreter);

      expect(consoleOutput).toContain(50); // (2+3) * (4+6) = 5 * 10 = 50
    });
  });

  describe('Interpreter State', () => {
    test('should maintain state between execution steps', () => {
      const code = `
        var counter = 0;
        function increment() {
          counter++;
          alert(counter);
        }
        increment();
        increment();
        increment();
      `;

      const initFunc = createAlertFunction();
      interpreter = new Interpreter(code, initFunc);
      runInterpreterSync(interpreter);

      expect(consoleOutput).toEqual([1, 2, 3]);
    });

    test('should handle multiple interpreters independently', () => {
      const code1 = `
        var x = 10;
        alert(x);
      `;

      const code2 = `
        var x = 20;
        alert(x);
      `;

      const initFunc = createAlertFunction();
      
      const interpreter1 = new Interpreter(code1, initFunc);
      const interpreter2 = new Interpreter(code2, initFunc);

      runInterpreterSync(interpreter1);
      runInterpreterSync(interpreter2);

      expect(consoleOutput).toEqual([10, 20]);
    });
  });

  describe('Native Function Integration', () => {
    test('should handle multiple native functions', () => {
      const code = `
        var result1 = customAdd(5, 3);
        var result2 = customMultiply(4, 6);
        alert(result1);
        alert(result2);
      `;

      const initFunc = function(interpreter, globalObject) {
        // Alert function
        const alertWrapper = function(text) {
          console.log(text);
        };
        interpreter.setProperty(globalObject, 'alert',
            interpreter.createNativeFunction(alertWrapper));

        // Custom add function
        const addWrapper = function(a, b) {
          return a + b;
        };
        interpreter.setProperty(globalObject, 'customAdd',
            interpreter.createNativeFunction(addWrapper));

        // Custom multiply function
        const multiplyWrapper = function(a, b) {
          return a * b;
        };
        interpreter.setProperty(globalObject, 'customMultiply',
            interpreter.createNativeFunction(multiplyWrapper));
      };

      interpreter = new Interpreter(code, initFunc);
      runInterpreterSync(interpreter);

      expect(consoleOutput).toEqual(['8', '24']);
    });

    test('should handle native functions returning objects', () => {
      const code = `
        var data = getData();
        alert(data.name);
        alert(data.value);
      `;

      const initFunc = function(interpreter, globalObject) {
        // Alert function
        const alertWrapper = function(text) {
          console.log(text);
        };
        interpreter.setProperty(globalObject, 'alert',
            interpreter.createNativeFunction(alertWrapper));

        // Function that returns an object
        const getDataWrapper = function() {
          return { name: "Test", value: 42 };
        };
        interpreter.setProperty(globalObject, 'getData',
            interpreter.createNativeFunction(getDataWrapper));
      };

      interpreter = new Interpreter(code, initFunc);
      runInterpreterSync(interpreter);

      expect(consoleOutput).toEqual(['Test', '42']);
    });
  });
});

// Helper function to create alert function for interpreter
function createAlertFunction() {
  return function(interpreter, globalObject) {
    const wrapper = function(text) {
      console.log(text);
    };
    interpreter.setProperty(globalObject, 'alert',
        interpreter.createNativeFunction(wrapper));
  };
}

// Helper function to run interpreter synchronously for testing
function runInterpreterSync(interpreter) {
  interpreter.run()
}