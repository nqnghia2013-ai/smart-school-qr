import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, Clock, Award, AlertTriangle, ShieldAlert } from 'lucide-react';

interface QuizPlayerProps {
  questTitle: string;
  questions: QuizQuestion[];
  timeLimit: number; // in minutes
  onFinish: (correctCount: number, incorrectCount: number, timeTakenSeconds: number) => void;
  onCancel: () => void;
}

export default function QuizPlayer({ questTitle, questions, timeLimit, onFinish, onCancel }: QuizPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60);
  const [isStarted, setIsStarted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [feedbackImage, setFeedbackImage] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  useEffect(() => {
    if (isStarted && timeLeft > 0 && !showExplanation) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
    if (timeLeft === 0 && !showExplanation) {
      setIsQuizFinished(true);
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
  };

  const readText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.rate = 1;
      
      const setVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        let viVoice = voices.find(v => v.lang === 'vi-VN' && (v.name.includes('Linh') || v.name.includes('HoaiMy') || v.name.toLowerCase().includes('female')));
        if (!viVoice) {
          viVoice = voices.find(v => v.lang.includes('vi') && (v.name.includes('Linh') || v.name.includes('Google') || v.name.toLowerCase().includes('female')));
        }
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
  };

  useEffect(() => {
    if (isStarted && !showExplanation && !isQuizFinished && questions[currentIndex]) {
      const q = questions[currentIndex];
      const textToRead = `Câu hỏi: ${q.question}. Các đáp án: A. ${q.options[0]}. B. ${q.options[1]}. C. ${q.options[2]}. D. ${q.options[3]}.`;
      readText(textToRead);
    }
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentIndex, isStarted, showExplanation, isQuizFinished]);

  const playSound = (isCorrect: boolean) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      if (isCorrect) {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.5);
      } else {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
        oscillator.frequency.linearRampToValueAtTime(200, audioCtx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.4);
      }
    } catch (e) {
      console.log('Audio context not supported or blocked');
    }
  };

  const handleAnswer = (optIndex: number) => {
    if (selectedOption !== null) return; // Prevent double click
    setSelectedOption(optIndex);
    
    const currentQ = questions[currentIndex];
    const isCorrect = optIndex === currentQ.correctAnswer;
    
    if (isCorrect) {
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
    }
    
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
      setFeedbackImage(null);
    } else {
      setIsQuizFinished(true);
    }
  };

  if (isQuizFinished) {
    const timeTakenSeconds = Math.floor((Date.now() - startTime) / 1000);
    const timeTakenStr = `${Math.floor(timeTakenSeconds / 60)} phút ${timeTakenSeconds % 60} giây`;
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
  }

  if (!isStarted) {
    return (
      <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col items-center justify-center p-6 text-white">
        <div className="max-w-md w-full bg-slate-800 p-8 rounded-3xl text-center border border-slate-700 shadow-2xl">
          <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black mb-2 uppercase tracking-wide">Chuẩn bị thi!</h2>
          <p className="text-slate-300 mb-6 font-medium leading-relaxed">
            Bạn chuẩn bị bước vào bài thi <strong className="text-cyan-400">{questTitle}</strong>. 
            Bài thi sẽ được mở toàn màn hình và <span className="text-rose-400">vô hiệu hóa các tính năng thoát ra ngoài</span>. 
            Vui lòng làm bài trung thực!
          </p>
          <div className="flex gap-4 items-center justify-center mb-8">
            <div className="bg-slate-700 p-4 rounded-xl flex-1">
              <span className="block text-xl font-bold text-white">{questions.length}</span>
              <span className="text-xs text-slate-400 font-medium">Câu hỏi</span>
            </div>
            <div className="bg-slate-700 p-4 rounded-xl flex-1">
              <span className="block text-xl font-bold text-white">{timeLimit}</span>
              <span className="text-xs text-slate-400 font-medium">Phút</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors">
              Hủy bỏ
            </button>
            <button onClick={handleStart} className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20">
              Bắt đầu ngay
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col text-white select-none">
      <div className="bg-slate-800 px-6 py-4 flex items-center justify-between border-b border-slate-700">
        <h3 className="font-bold text-lg text-slate-200">{questTitle}</h3>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-cyan-400 font-bold bg-cyan-900/30 px-3 py-1.5 rounded-lg border border-cyan-500/20">
            <Award className="w-5 h-5" /> Câu {currentIndex + 1}/{questions.length}
          </div>
          <div className={`flex items-center gap-2 font-mono text-xl font-bold ${timeLeft < 60 ? 'text-rose-500 animate-pulse' : 'text-slate-300'}`}>
            <Clock className="w-5 h-5" /> 
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
        <div className="max-w-5xl w-full my-auto flex flex-col justify-center">
          <div className="bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-700 mb-6">
            <div className="flex justify-between items-start mb-4">
              <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${currentQ.difficulty === 'hard' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                Câu hỏi {currentQ.difficulty === 'hard' ? 'Khó' : 'Dễ'}
              </span>
            </div>
            <h2 className="text-3xl font-medium leading-relaxed">{currentQ.question}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQ.options.map((opt, idx) => {
              let btnClass = "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700";
              if (showExplanation) {
                if (idx === currentQ.correctAnswer) {
                  btnClass = "bg-emerald-600/20 border-emerald-500 text-emerald-400";
                } else if (idx === selectedOption) {
                  btnClass = "bg-rose-600/20 border-rose-500 text-rose-400";
                } else {
                  btnClass = "bg-slate-800/50 border-slate-800 text-slate-500 opacity-50";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={showExplanation}
                  className={`p-8 rounded-2xl text-2xl border-2 text-left font-medium text-lg transition-all ${btnClass} flex items-center gap-4`}
                >
                  <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-bold border-2 ${showExplanation && idx === currentQ.correctAnswer ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-700 border-slate-600 text-slate-300'}`}>
                    {['A', 'B', 'C', 'D'][idx]}
                  </div>
                  {opt}
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", duration: 0.5, bounce: 0.5 }}
                className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
              >
                <div className="bg-slate-800 p-8 rounded-3xl border-4 shadow-2xl flex flex-col items-center max-w-2xl w-full text-center" style={{ borderColor: selectedOption === currentQ.correctAnswer ? '#10b981' : '#f43f5e' }}>
                  {feedbackImage && (
                    <motion.img 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      src={feedbackImage} 
                      alt="Feedback" 
                      className="w-80 h-80 object-contain drop-shadow-2xl mb-6" 
                    />
                  )}
                  <h4 className={`font-black text-3xl mb-4 flex items-center justify-center gap-3 ${selectedOption === currentQ.correctAnswer ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {selectedOption === currentQ.correctAnswer ? <><CheckCircle className="w-8 h-8"/> CHÍNH XÁC!</> : <><XCircle className="w-8 h-8"/> SAI RỒI!</>}
                  </h4>
                  <p className="text-slate-200 text-lg leading-relaxed bg-slate-900/50 p-6 rounded-2xl font-medium w-full border border-slate-700/50">{currentQ.explanation}</p>
                  
                  <div className="mt-8">
                    <button onClick={handleNext} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-lg transition-colors shadow-lg shadow-indigo-600/30">
                       {currentIndex < questions.length - 1 ? 'Tiếp theo' : 'Hoàn thành'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
