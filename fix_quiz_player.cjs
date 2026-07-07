const fs = require('fs');
let code = fs.readFileSync('src/components/QuizPlayer.tsx', 'utf8');

const oldQuizFinished = `  if (isQuizFinished) {
    return (
      <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col items-center justify-center p-6 text-white">
        <div className="max-w-md w-full bg-slate-800 p-8 rounded-3xl text-center border border-slate-700 shadow-2xl">
          <Award className="w-20 h-20 text-yellow-400 mx-auto mb-4 animate-bounce" />
          <h2 className="text-3xl font-black mb-4 text-emerald-400 uppercase tracking-wide">Chúc mừng!</h2>
          <p className="text-xl text-slate-200 mb-6 font-medium leading-relaxed">
            Bạn đã hoàn thành bài thi <strong className="text-cyan-400">{questTitle}</strong>
          </p>
          <div className="flex gap-4 items-center justify-center mb-8">
            <div className="bg-slate-700 p-4 rounded-xl flex-1">
              <span className="block text-xl font-bold text-white">{correctCount}</span>
              <span className="text-xs text-slate-400 font-medium">Đúng</span>
            </div>
            <div className="bg-slate-700 p-4 rounded-xl flex-1">
              <span className="block text-xl font-bold text-white">{incorrectCount}</span>
              <span className="text-xs text-slate-400 font-medium">Sai</span>
            </div>
          </div>
          <button onClick={handleFinish} className="w-full py-4 px-6 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20 text-lg">
            Hoàn tất
          </button>
        </div>
      </div>
    );
  }`;

const newQuizFinished = `  if (isQuizFinished) {
    const timeTakenStr = \`\${Math.floor(Math.floor((Date.now() - startTime) / 1000) / 60)} phút \${Math.floor((Date.now() - startTime) / 1000) % 60} giây\`;
    return (
      <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col items-center justify-center p-6 text-white">
        <div className="max-w-lg w-full bg-slate-800 p-10 rounded-3xl text-center border border-slate-700 shadow-2xl">
          <Award className="w-24 h-24 text-yellow-400 mx-auto mb-6 animate-bounce" />
          <h2 className="text-4xl font-black mb-4 text-emerald-400 uppercase tracking-wide">Chúc mừng!</h2>
          <p className="text-2xl text-slate-200 mb-8 font-medium leading-relaxed">
            Bạn đã hoàn thành bài thi <strong className="text-cyan-400">{questTitle}</strong>
          </p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-700 p-4 rounded-2xl flex flex-col items-center justify-center">
              <span className="block text-3xl font-bold text-emerald-400">{correctCount}</span>
              <span className="text-sm text-slate-400 font-medium mt-1">Số câu đúng</span>
            </div>
            <div className="bg-slate-700 p-4 rounded-2xl flex flex-col items-center justify-center">
              <span className="block text-3xl font-bold text-rose-400">{incorrectCount}</span>
              <span className="text-sm text-slate-400 font-medium mt-1">Số câu sai</span>
            </div>
            <div className="bg-slate-700 p-4 rounded-2xl flex flex-col items-center justify-center">
              <span className="block text-xl font-bold text-cyan-400 whitespace-nowrap">{timeTakenStr}</span>
              <span className="text-sm text-slate-400 font-medium mt-1">Thời gian làm bài</span>
            </div>
          </div>
          <button onClick={handleFinish} className="w-full py-5 px-6 rounded-2xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-xl shadow-emerald-600/30 text-xl">
            Hoàn tất và Xem kết quả
          </button>
        </div>
      </div>
    );
  }`;
  
// Note: handleFinish is also inside handleNext if it's the last question
code = code.replace(oldQuizFinished, newQuizFinished);

// Make the cat image and the popup bigger
code = code.replace(/max-w-lg w-full text-center/g, 'max-w-2xl w-full text-center');
code = code.replace(/className="w-64 h-64 object-contain/g, 'className="w-80 h-80 object-contain');

// Make the main quiz container bigger
code = code.replace(/max-w-3xl w-full flex-1/g, 'max-w-5xl w-full flex-1');

// Change text-2xl for question to text-3xl
code = code.replace(/<h2 className="text-2xl font-medium leading-relaxed">\{currentQ.question\}<\/h2>/g, '<h2 className="text-3xl font-medium leading-relaxed">{currentQ.question}</h2>');

// Change padding on option buttons to be bigger
code = code.replace(/className={\`p-6 rounded-2xl/g, 'className={`p-8 rounded-2xl text-2xl');

// Add specific voices for better female Vietnamese
const oldVoiceSelection = `        let viVoice = voices.find(v => v.lang.includes('vi') && (v.name.includes('Linh') || v.name.includes('Google') || v.name.toLowerCase().includes('female')));
        if (!viVoice) {
          viVoice = voices.find(v => v.lang.includes('vi'));
        }`;

const newVoiceSelection = `        let viVoice = voices.find(v => v.lang === 'vi-VN' && (v.name.includes('Linh') || v.name.includes('HoaiMy') || v.name.toLowerCase().includes('female')));
        if (!viVoice) {
          viVoice = voices.find(v => v.lang.includes('vi') && (v.name.includes('Linh') || v.name.includes('Google') || v.name.toLowerCase().includes('female')));
        }
        if (!viVoice) {
          viVoice = voices.find(v => v.lang.includes('vi'));
        }`;

code = code.replace(oldVoiceSelection, newVoiceSelection);

fs.writeFileSync('src/components/QuizPlayer.tsx', code);
