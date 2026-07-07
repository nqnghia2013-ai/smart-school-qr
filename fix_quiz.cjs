const fs = require('fs');

let code = fs.readFileSync('src/components/QuizPlayer.tsx', 'utf8');

// Fix pointer-events-none
code = code.replace(
  /className="fixed inset-0 z-\[200\] flex items-center justify-center p-4 bg-slate-900\/80 backdrop-blur-sm pointer-events-none"/,
  'className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"'
);

// Fix readText
const oldReadText = `  const readText = (text: string) => {
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
  };`;

const newReadText = `  const readText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.rate = 1;
      
      const setVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        let viVoice = voices.find(v => v.lang.includes('vi') && (v.name.includes('Linh') || v.name.includes('Google') || v.name.toLowerCase().includes('female')));
        if (!viVoice) {
          viVoice = voices.find(v => v.lang.includes('vi'));
        }
        if (viVoice) utterance.voice = viVoice;
        window.speechSynthesis.speak(utterance);
      };

      if (window.speechSynthesis.getVoices().length > 0) {
        setVoice();
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          setVoice();
        };
      }
    }
  };`;

code = code.replace(oldReadText, newReadText);

fs.writeFileSync('src/components/QuizPlayer.tsx', code);
