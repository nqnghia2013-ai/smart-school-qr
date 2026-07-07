const fs = require('fs');

let code = fs.readFileSync('src/components/QuizPlayer.tsx', 'utf8');

const readSoundFunction = `  const readText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.rate = 1;
      
      const voices = window.speechSynthesis.getVoices();
      const viVoice = voices.find(v => v.lang === 'vi-VN' && v.name.toLowerCase().includes('female')) || voices.find(v => v.lang === 'vi-VN');
      if (viVoice) utterance.voice = viVoice;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (isStarted && !showExplanation && !isQuizFinished && questions[currentIndex]) {
      const q = questions[currentIndex];
      const textToRead = \`Câu hỏi: \${q.question}. Các đáp án: A. \${q.options[0]}. B. \${q.options[1]}. C. \${q.options[2]}. D. \${q.options[3]}.\`;
      readText(textToRead);
    }
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentIndex, isStarted, showExplanation, isQuizFinished]);

  const playSound = (isCorrect: boolean) => {`;

code = code.replace("  const playSound = (isCorrect: boolean) => {", readSoundFunction);

const oldHandleAnswer = `    setShowExplanation(true);
    
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
        setShowExplanation(false);
        setFeedbackImage(null);
      } else {
        setIsQuizFinished(true);
      }
    }, 3000);
  };`;

const newHandleAnswer = `    setShowExplanation(true);
  };`;

code = code.replace(oldHandleAnswer, newHandleAnswer);

const oldButton = `<div className="mt-8">
                    <div className="px-6 py-3 bg-slate-700 text-slate-300 font-bold rounded-xl text-sm animate-pulse border border-slate-600">
                       Tự động chuyển sau 3s...
                    </div>
                  </div>`;

const newButton = `<div className="mt-8">
                    <button onClick={handleNext} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-lg transition-colors shadow-lg shadow-indigo-600/30">
                       {currentIndex < questions.length - 1 ? 'Tiếp theo' : 'Hoàn thành'}
                    </button>
                  </div>`;

code = code.replace(oldButton, newButton);

fs.writeFileSync('src/components/QuizPlayer.tsx', code);
