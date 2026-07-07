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
            <div className="bg-slate-700 p-4 rounded-xl flex-1 border border-emerald-500/30">
              <span className="block text-4xl font-bold text-emerald-400">{correctCount}</span>
              <span className="text-sm text-slate-400 font-medium mt-2">Câu đúng</span>
            </div>
            <div className="bg-slate-700 p-4 rounded-xl flex-1 border border-rose-500/30">
              <span className="block text-4xl font-bold text-rose-400">{incorrectCount}</span>
              <span className="text-sm text-slate-400 font-medium mt-2">Câu sai</span>
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
    const timeTakenSeconds = Math.floor((Date.now() - startTime) / 1000);
    const timeTakenStr = \`\${Math.floor(timeTakenSeconds / 60)} phút \${timeTakenSeconds % 60} giây\`;
    return (
      <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col items-center justify-center p-6 text-white">
        <div className="max-w-xl w-full bg-slate-800 p-10 rounded-3xl text-center border border-slate-700 shadow-2xl">
          <Award className="w-24 h-24 text-yellow-400 mx-auto mb-6 animate-bounce" />
          <h2 className="text-4xl font-black mb-4 text-emerald-400 uppercase tracking-wide">Chúc mừng!</h2>
          <p className="text-xl text-slate-200 mb-8 font-medium leading-relaxed">
            Bạn đã hoàn thành bài thi <strong className="text-cyan-400">{questTitle}</strong>
          </p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-700 p-4 rounded-2xl flex flex-col items-center justify-center border border-emerald-500/30">
              <span className="block text-4xl font-bold text-emerald-400">{correctCount}</span>
              <span className="text-sm text-slate-400 font-medium mt-2 text-center">Câu đúng</span>
            </div>
            <div className="bg-slate-700 p-4 rounded-2xl flex flex-col items-center justify-center border border-rose-500/30">
              <span className="block text-4xl font-bold text-rose-400">{incorrectCount}</span>
              <span className="text-sm text-slate-400 font-medium mt-2 text-center">Câu sai</span>
            </div>
            <div className="bg-slate-700 p-4 rounded-2xl flex flex-col items-center justify-center border border-cyan-500/30">
              <span className="block text-2xl font-bold text-cyan-400 text-center">{timeTakenStr}</span>
              <span className="text-sm text-slate-400 font-medium mt-2 text-center">Thời gian làm bài</span>
            </div>
          </div>
          <button onClick={handleFinish} className="w-full py-5 px-6 rounded-2xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-xl shadow-emerald-600/30 text-xl">
            Hoàn tất và Xem kết quả
          </button>
        </div>
      </div>
    );
  }`;
  
code = code.replace(oldQuizFinished, newQuizFinished);
fs.writeFileSync('src/components/QuizPlayer.tsx', code);
