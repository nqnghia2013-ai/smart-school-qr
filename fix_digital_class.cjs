const fs = require('fs');
let code = fs.readFileSync('src/pages/DigitalClass.tsx', 'utf8');

// Fix 1: adding Lock icon
if (!code.includes('Lock')) {
  code = code.replace(/import {([^}]+)} from 'lucide-react';/, "import {$1, Lock } from 'lucide-react';");
}

// Fix 2: displaying Xu instead of Diem ren luyen for Quiz
const oldRewardText = `  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Phần thưởng</span>
                                  <span className="text-sm font-black text-cyan-400 flex items-center gap-1 mt-0.5 justify-end">
                                    +{q.points} Điểm rèn luyện
                                  </span>`;
                                  
const newRewardText = `  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Phần thưởng</span>
                                  <span className="text-sm font-black text-cyan-400 flex items-center gap-1 mt-0.5 justify-end">
                                    +{q.type === 'quiz' ? 10 : (q.points || 10)} {q.type === 'quiz' ? 'Xu' : 'Điểm rèn luyện'}
                                  </span>`;

code = code.replace(oldRewardText, newRewardText);

// Fix 3: updating handleQuizFinish to award exactly 10 coins
const oldAwardCoins = `      // Award points (coins) for completion
      const userDoc = users.find(u => u.id === currentUser.id);
      if (userDoc) {
        addUser({ ...userDoc, coins: (userDoc.coins || 0) + (quest.points || 10) });
      }`;

const newAwardCoins = `      // Award points (coins) for completion
      const userDoc = users.find(u => u.id === currentUser.id);
      if (userDoc) {
        addUser({ ...userDoc, coins: (userDoc.coins || 0) + 10 });
      }`;

code = code.replace(oldAwardCoins, newAwardCoins);

// Fix 4: Showing Lock symbol for completed quizzes
const oldButtonText = `                                  {isTeacherOrAdmin ? (
                                    <>
                                      <TrendingUp className="w-4 h-4" /> Xem số liệu
                                    </>
                                  ) : isCompleted ? (
                                    <>
                                      <CheckCircle className="w-4 h-4" /> Đã hoàn thành
                                    </>
                                  ) : (
                                    <>
                                      <Rocket className="w-4 h-4" /> {q.type === 'quiz' ? 'Bắt đầu Quiz' : 'Chinh phục nhiệm vụ'}
                                    </>
                                  )}`;

const newButtonText = `                                  {isTeacherOrAdmin ? (
                                    <>
                                      <TrendingUp className="w-4 h-4" /> Xem số liệu
                                    </>
                                  ) : isCompleted ? (
                                    <>
                                      {q.type === 'quiz' ? <><Lock className="w-4 h-4" /> Đã khóa</> : <><CheckCircle className="w-4 h-4" /> Đã hoàn thành</>}
                                    </>
                                  ) : (
                                    <>
                                      <Rocket className="w-4 h-4" /> {q.type === 'quiz' ? 'Bắt đầu Quiz' : 'Chinh phục nhiệm vụ'}
                                    </>
                                  )}`;

code = code.replace(oldButtonText, newButtonText);

fs.writeFileSync('src/pages/DigitalClass.tsx', code);
