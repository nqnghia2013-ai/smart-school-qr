const fs = require('fs');

let code = fs.readFileSync('src/components/QuizPlayer.tsx', 'utf8');

const badPart = `    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      if (currentQ.difficulty === 'hard') {
        setFeedbackImage('/1.png');
      } else {
        setFeedbackImage('/2.png');
      }
      playSound(true);
    } else {
      setIncorrectCount(prev => prev + 1);
      setFeedbackImage('/3.png');
      playSound(false);
    }`;

const goodPart = `    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      setFeedbackImage('/dung.png');
      playSound(true);
    } else {
      setIncorrectCount(prev => prev + 1);
      if (currentQ.difficulty === 'hard') {
        setFeedbackImage('/kho.png');
      } else {
        setFeedbackImage('/de.png');
      }
      playSound(false);
    }`;

code = code.replace(badPart, goodPart);

fs.writeFileSync('src/components/QuizPlayer.tsx', code);
