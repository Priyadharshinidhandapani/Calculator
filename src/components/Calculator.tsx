import React, { useState, useEffect, useCallback } from 'react';

interface CalculatorState {
  display: string;
  previousValue: string;
  operation: string | null;
  waitingForOperand: boolean;
}

const Calculator: React.FC = () => {
  const [state, setState] = useState<CalculatorState>({
    display: '0',
    previousValue: '',
    operation: null,
    waitingForOperand: false,
  });

  const inputNumber = useCallback((num: string) => {
    if (state.waitingForOperand) {
      setState(prev => ({
        ...prev,
        display: num,
        waitingForOperand: false,
      }));
    } else {
      setState(prev => ({
        ...prev,
        display: prev.display === '0' ? num : prev.display + num,
      }));
    }
  }, [state.waitingForOperand]);

  const inputDecimal = useCallback(() => {
    if (state.waitingForOperand) {
      setState(prev => ({
        ...prev,
        display: '0.',
        waitingForOperand: false,
      }));
    } else if (state.display.indexOf('.') === -1) {
      setState(prev => ({
        ...prev,
        display: prev.display + '.',
      }));
    }
  }, [state.waitingForOperand, state.display]);

  const clear = useCallback(() => {
    setState({
      display: '0',
      previousValue: '',
      operation: null,
      waitingForOperand: false,
    });
  }, []);

  const performOperation = useCallback((nextOperation: string) => {
    const inputValue = parseFloat(state.display);

    if (state.previousValue === '') {
      setState(prev => ({
        ...prev,
        previousValue: String(inputValue),
        operation: nextOperation,
        waitingForOperand: true,
      }));
    } else if (state.operation) {
      const currentValue = parseFloat(state.previousValue) || 0;
      let result: number;

      switch (state.operation) {
        case '+':
          result = currentValue + inputValue;
          break;
        case '-':
          result = currentValue - inputValue;
          break;
        case '×':
          result = currentValue * inputValue;
          break;
        case '÷':
          result = inputValue !== 0 ? currentValue / inputValue : 0;
          break;
        case '=':
          result = inputValue;
          break;
        default:
          return;
      }

      setState({
        display: String(result),
        previousValue: nextOperation === '=' ? '' : String(result),
        operation: nextOperation === '=' ? null : nextOperation,
        waitingForOperand: true,
      });
    }
  }, [state.display, state.previousValue, state.operation]);

  const percentage = useCallback(() => {
    const value = parseFloat(state.display) / 100;
    setState(prev => ({
      ...prev,
      display: String(value),
    }));
  }, [state.display]);

  const toggleSign = useCallback(() => {
    const value = parseFloat(state.display);
    setState(prev => ({
      ...prev,
      display: String(value * -1),
    }));
  }, [state.display]);

  // Keyboard support
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key;
      
      if (key >= '0' && key <= '9') {
        inputNumber(key);
      } else if (key === '.') {
        inputDecimal();
      } else if (key === '+') {
        performOperation('+');
      } else if (key === '-') {
        performOperation('-');
      } else if (key === '*') {
        performOperation('×');
      } else if (key === '/') {
        event.preventDefault();
        performOperation('÷');
      } else if (key === 'Enter' || key === '=') {
        performOperation('=');
      } else if (key === 'Escape' || key.toLowerCase() === 'c') {
        clear();
      } else if (key === '%') {
        percentage();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [inputNumber, inputDecimal, performOperation, clear, percentage]);

  const formatDisplay = (value: string): string => {
    const number = parseFloat(value);
    if (isNaN(number)) return '0';
    
    // Handle very large numbers
    if (Math.abs(number) > 1e15) {
      return number.toExponential(6);
    }
    
    // Handle very small numbers
    if (Math.abs(number) < 1e-6 && number !== 0) {
      return number.toExponential(6);
    }
    
    // Regular formatting
    return number.toLocaleString('en-US', {
      maximumFractionDigits: 8,
      useGrouping: false
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-purple-500/30 w-full max-w-md">
        {/* Display */}
        <div className="bg-gradient-to-b from-slate-900 to-black px-8 py-10 border-b border-purple-500/20">
          <div className="text-right">
            <div className="text-purple-300 text-sm mb-2 h-6">
              {state.previousValue && state.operation ? 
                `${formatDisplay(state.previousValue)} ${state.operation}` : ''
              }
            </div>
            <div className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 text-5xl font-light tracking-wide overflow-hidden">
              {formatDisplay(state.display)}
            </div>
          </div>
        </div>

        {/* Button Grid */}
        <div className="grid grid-cols-4 gap-px bg-purple-800/50">
          {/* Row 1 */}
          <button
            onClick={clear}
            className="bg-gradient-to-b from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white text-xl font-medium h-20 transition-all duration-150 active:from-red-600 active:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-inset shadow-lg"
          >
            AC
          </button>
          <button
            onClick={toggleSign}
            className="bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white text-xl font-medium h-20 transition-all duration-150 active:from-emerald-600 active:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-inset shadow-lg"
          >
            ±
          </button>
          <button
            onClick={percentage}
            className="bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white text-xl font-medium h-20 transition-all duration-150 active:from-emerald-600 active:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-inset shadow-lg"
          >
            %
          </button>
          <button
            onClick={() => performOperation('÷')}
            className="bg-gradient-to-b from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-2xl font-medium h-20 transition-all duration-150 active:from-amber-600 active:to-orange-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-inset shadow-lg"
          >
            ÷
          </button>

          {/* Row 2 */}
          <button
            onClick={() => inputNumber('7')}
            className="bg-gradient-to-b from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white text-xl font-medium h-20 transition-all duration-150 active:from-slate-800 active:to-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-inset shadow-lg"
          >
            7
          </button>
          <button
            onClick={() => inputNumber('8')}
            className="bg-gradient-to-b from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white text-xl font-medium h-20 transition-all duration-150 active:from-slate-800 active:to-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-inset shadow-lg"
          >
            8
          </button>
          <button
            onClick={() => inputNumber('9')}
            className="bg-gradient-to-b from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white text-xl font-medium h-20 transition-all duration-150 active:from-slate-800 active:to-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-inset shadow-lg"
          >
            9
          </button>
          <button
            onClick={() => performOperation('×')}
            className="bg-gradient-to-b from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-2xl font-medium h-20 transition-all duration-150 active:from-amber-600 active:to-orange-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-inset shadow-lg"
          >
            ×
          </button>

          {/* Row 3 */}
          <button
            onClick={() => inputNumber('4')}
            className="bg-gradient-to-b from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white text-xl font-medium h-20 transition-all duration-150 active:from-slate-800 active:to-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-inset shadow-lg"
          >
            4
          </button>
          <button
            onClick={() => inputNumber('5')}
            className="bg-gradient-to-b from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white text-xl font-medium h-20 transition-all duration-150 active:from-slate-800 active:to-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-inset shadow-lg"
          >
            5
          </button>
          <button
            onClick={() => inputNumber('6')}
            className="bg-gradient-to-b from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white text-xl font-medium h-20 transition-all duration-150 active:from-slate-800 active:to-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-inset shadow-lg"
          >
            6
          </button>
          <button
            onClick={() => performOperation('-')}
            className="bg-gradient-to-b from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-2xl font-medium h-20 transition-all duration-150 active:from-amber-600 active:to-orange-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-inset shadow-lg"
          >
            −
          </button>

          {/* Row 4 */}
          <button
            onClick={() => inputNumber('1')}
            className="bg-gradient-to-b from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white text-xl font-medium h-20 transition-all duration-150 active:from-slate-800 active:to-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-inset shadow-lg"
          >
            1
          </button>
          <button
            onClick={() => inputNumber('2')}
            className="bg-gradient-to-b from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white text-xl font-medium h-20 transition-all duration-150 active:from-slate-800 active:to-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-inset shadow-lg"
          >
            2
          </button>
          <button
            onClick={() => inputNumber('3')}
            className="bg-gradient-to-b from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white text-xl font-medium h-20 transition-all duration-150 active:from-slate-800 active:to-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-inset shadow-lg"
          >
            3
          </button>
          <button
            onClick={() => performOperation('+')}
            className="bg-gradient-to-b from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-2xl font-medium h-20 transition-all duration-150 active:from-amber-600 active:to-orange-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-inset shadow-lg"
          >
            +
          </button>

          {/* Row 5 */}
          <button
            onClick={() => inputNumber('0')}
            className="bg-gradient-to-b from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white text-xl font-medium h-20 col-span-2 transition-all duration-150 active:from-slate-800 active:to-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-inset shadow-lg"
          >
            0
          </button>
          <button
            onClick={inputDecimal}
            className="bg-gradient-to-b from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white text-xl font-medium h-20 transition-all duration-150 active:from-slate-800 active:to-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-inset shadow-lg"
          >
            .
          </button>
          <button
            onClick={() => performOperation('=')}
            className="bg-gradient-to-b from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white text-2xl font-medium h-20 transition-all duration-150 active:from-pink-600 active:to-purple-700 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-inset shadow-lg"
          >
            =
          </button>
        </div>
      </div>
    </div>
  );
};

export default Calculator;