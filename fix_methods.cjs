const fs = require('fs');

let code = fs.readFileSync('src/components/QuizPlayer.tsx', 'utf8');

code = code.replace(
  /const \[isQuizFinished, setIsQuizFinished\] = useState\(false\);/,
  `const [isQuizFinished, setIsQuizFinished] = useState(false);

  useEffect(() => {
    if (isStarted && timeLeft > 0 && !showExplanation) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
    if (timeLeft === 0 && !showExplanation) {
      handleFinish();
    }
  }, [isStarted, timeLeft, showExplanation]);

  const handleStart = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(() => {});
    }
    setIsStarted(true);
    setStartTime(Date.now());
  };

  const handleFinish = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    onFinish(correctCount, incorrectCount, timeTaken);
  };`
);

fs.writeFileSync('src/components/QuizPlayer.tsx', code);
