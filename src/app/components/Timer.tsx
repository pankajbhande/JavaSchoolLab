import { useState, useEffect } from 'react';
import { Clock, Play, Pause, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';

export function Timer() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const reset = () => {
    setSeconds(0);
    setIsRunning(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl shadow-md border border-blue-200 dark:border-blue-700"
    >
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Study Timer</h3>
      </div>
      
      <div className="text-3xl font-mono font-bold text-center mb-4 text-gray-800 dark:text-gray-200">
        {formatTime(seconds)}
      </div>
      
      <div className="flex gap-2 justify-center">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsRunning(!isRunning)}
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={reset}
          className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}
