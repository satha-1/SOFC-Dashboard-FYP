import { useEffect, useState } from 'react';

export default function Footer() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <footer className="h-12 bg-white dark:bg-sofc-dark-card border-t border-gray-200 dark:border-sofc-dark-border px-6 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
      <span>SOFC Fuel Cell Monitoring – University Prototype</span>
      <span className="font-mono">
        {currentTime.toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}{' '}
        {currentTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })}
      </span>
    </footer>
  );
}

