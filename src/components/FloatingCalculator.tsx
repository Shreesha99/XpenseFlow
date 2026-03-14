import { useState, useEffect } from 'react';
import { Calculator as CalcIcon, X, Minus, Plus, Hash, RotateCcw, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function FloatingCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [isNewNumber, setIsNewNumber] = useState(true);

  const handleNumber = (num: string) => {
    if (isNewNumber) {
      setDisplay(num);
      setIsNewNumber(false);
    } else {
      setDisplay(display === '0' && num !== '.' ? num : display + num);
    }
  };

  const handleOperator = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setIsNewNumber(true);
  };

  const handleEqual = () => {
    try {
      const cleanEq = (equation + display).replace('×', '*').replace('÷', '/');
      const result = eval(cleanEq);
      setDisplay(String(Number(result.toFixed(2))));
      setEquation('');
      setIsNewNumber(true);
    } catch (e) {
      setDisplay('ERR');
      setEquation('');
      setIsNewNumber(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
    setIsNewNumber(true);
  };

  return (
    <div className="fixed bottom-28 md:bottom-8 right-4 md:right-8 z-[200]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.9, y: 40, filter: 'blur(10px)' }}
            className="bg-[#151619] border border-[#2A2C32] rounded-3xl shadow-[0_40px_80px_rgba(0,0,0,0.5)] w-80 overflow-hidden mb-6"
          >
            {/* Hardware Header */}
            <div className="px-6 py-4 bg-[#1A1C20] border-b border-[#2A2C32] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-[#8E9299] uppercase tracking-[0.2em]">System.Calc_v2.1</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-1.5 hover:bg-[#2A2C32] rounded-lg transition-all text-[#8E9299] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Digital Display */}
              <div className="bg-[#0D0E10] border border-[#2A2C32] rounded-2xl p-6 text-right relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none bg-[radial-gradient(circle_at_center,_var(--emerald-500)_0%,_transparent_70%)]" />
                <p className="text-[10px] font-mono text-emerald-500/40 h-4 truncate mb-1 tracking-widest">{equation}</p>
                <p className="text-4xl font-mono font-bold text-white tracking-tighter truncate drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                  {display}
                </p>
              </div>

              {/* Control Grid */}
              <div className="grid grid-cols-4 gap-3">
                <CalcButton label="AC" onClick={handleClear} variant="danger" />
                <CalcButton label="±" onClick={() => setDisplay(d => d.startsWith('-') ? d.slice(1) : '-' + d)} variant="secondary" />
                <CalcButton label="%" onClick={() => setDisplay(d => String(parseFloat(d) / 100))} variant="secondary" />
                <CalcButton label="÷" onClick={() => handleOperator('÷')} variant="operator" />

                <CalcButton label="7" onClick={() => handleNumber('7')} />
                <CalcButton label="8" onClick={() => handleNumber('8')} />
                <CalcButton label="9" onClick={() => handleNumber('9')} />
                <CalcButton label="×" onClick={() => handleOperator('×')} variant="operator" />

                <CalcButton label="4" onClick={() => handleNumber('4')} />
                <CalcButton label="5" onClick={() => handleNumber('5')} />
                <CalcButton label="6" onClick={() => handleNumber('6')} />
                <CalcButton label="-" onClick={() => handleOperator('-')} variant="operator" />

                <CalcButton label="1" onClick={() => handleNumber('1')} />
                <CalcButton label="2" onClick={() => handleNumber('2')} />
                <CalcButton label="3" onClick={() => handleNumber('3')} />
                <CalcButton label="+" onClick={() => handleOperator('+')} variant="operator" />

                <CalcButton label="0" onClick={() => handleNumber('0')} className="col-span-2" />
                <CalcButton label="." onClick={() => handleNumber('.')} />
                <CalcButton label="=" onClick={handleEqual} variant="primary" />
              </div>

              {/* Status Bar */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-1">
                  {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-[#2A2C32]" />)}
                </div>
                <span className="text-[8px] font-mono text-[#4A4D54] uppercase tracking-widest">Precision_Mode_Active</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all duration-500 active:scale-90 group relative overflow-hidden ${
          isOpen 
            ? 'bg-rose-500 text-white rotate-90' 
            : 'bg-[#151619] border border-[#2A2C32] text-white hover:border-emerald-500/50'
        }`}
      >
        {!isOpen && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.1)_0%,_transparent_70%)]" />
        )}
        {isOpen ? <X className="w-6 h-6" /> : <CalcIcon className="w-6 h-6 text-emerald-500" />}
      </button>
    </div>
  );
}

function CalcButton({ label, onClick, variant = 'default', className = '' }: { label: string, onClick: () => void, variant?: 'default' | 'operator' | 'primary' | 'secondary' | 'danger', className?: string }) {
  const variants = {
    default: 'bg-[#1A1C20] hover:bg-[#2A2C32] text-[#E0E0E0] border border-[#2A2C32]',
    operator: 'bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
    primary: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]',
    secondary: 'bg-[#1A1C20] hover:bg-[#2A2C32] text-[#8E9299] border border-[#2A2C32]',
    danger: 'bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 border border-rose-500/20'
  };

  return (
    <button
      onClick={onClick}
      className={`h-12 rounded-xl text-xs font-mono font-bold transition-all active:scale-95 flex items-center justify-center ${variants[variant]} ${className}`}
    >
      {label}
    </button>
  );
}
