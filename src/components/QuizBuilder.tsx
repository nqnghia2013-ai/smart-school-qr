import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { Bot, Plus, Trash2, Zap } from 'lucide-react';

interface QuizBuilderProps {
  initialQuestions?: QuizQuestion[];
  onSave: (questions: QuizQuestion[]) => void;
}

export default function QuizBuilder({ initialQuestions = [], onSave }: QuizBuilderProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(initialQuestions);
  const [aiPrompt, setAiPrompt] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);

  const addQuestion = () => {
    setQuestions([...questions, {
      id: `q_${Date.now()}`,
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      difficulty: 'easy'
    }]);
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    const newQs = [...questions];
    newQs[index] = { ...newQs[index], [field]: value };
    setQuestions(newQs);
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    const newQs = [...questions];
    newQs[qIndex].options[optIndex] = value;
    setQuestions(newQs);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const generateWithAi = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const prompt = `Bạn là một chuyên gia ra đề trắc nghiệm. Dựa vào nội dung sau, hãy tạo ra ${numQuestions} câu hỏi trắc nghiệm (có độ khó trộn lẫn dễ và khó). TRẢ VỀ CHUỖI JSON MẢNG CÁC ĐỐI TƯỢNG (không có markdown nào khác, chỉ trả về JSON), cấu trúc mỗi đối tượng:
[
  {
    "question": "Nội dung câu hỏi?",
    "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
    "correctAnswer": 0, 
    "explanation": "Giải thích chi tiết vì sao chọn đáp án đó.",
    "difficulty": "easy" // hoặc "hard"
  }
]
Nội dung: ${aiPrompt}`;
      
      const res = await fetch('/api/workspace/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: 'Bạn là chuyên gia tạo quiz. Luôn trả về JSON hợp lệ.',
          prompt: prompt
        })
      });
      const data = await res.json();
      
      let jsonStr = data.reply.trim();
      if (jsonStr.startsWith('```json')) jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
      if (jsonStr.startsWith('```')) jsonStr = jsonStr.replace(/```/g, '').trim();
      
      try {
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed)) {
          const generated = parsed.map(q => ({
            id: `q_${Math.random().toString(36).substring(2, 9)}`,
            question: q.question || '',
            options: q.options || ['', '', '', ''],
            correctAnswer: q.correctAnswer || 0,
            explanation: q.explanation || '',
            difficulty: q.difficulty || 'easy'
          }));
          setQuestions([...questions, ...generated]);
          setAiPrompt('');
        }
      } catch (parseError) {
        console.error("Lỗi parse JSON:", parseError, jsonStr);
        alert("Lỗi khi phân tích phản hồi AI (không đúng định dạng JSON). Phản hồi:\n" + jsonStr.substring(0, 100));
      }
    } catch (e) {
      console.error(e);
      alert('Có lỗi khi tạo quiz bằng AI. Vui lòng thử lại.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Expose questions to parent whenever they change by calling onSave(questions) but maybe we just pass a ref?
  // Let's just use an effect
  React.useEffect(() => {
    onSave(questions);
  }, [questions]);

  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold text-sm text-indigo-800 dark:text-indigo-300 flex items-center gap-2">
            <Bot className="w-4 h-4" /> AI Tạo Đề Trắc Nghiệm Tự Động
          </h4>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Số câu:</span>
            <input 
              type="number"
              min="1"
              max="20"
              value={numQuestions || ''}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="w-16 px-2 py-1 text-xs border border-indigo-200 dark:border-indigo-700 rounded-lg outline-none bg-white dark:bg-slate-800 text-center"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Nhập nội dung bài học, AI sẽ tự động sinh ra các câu hỏi trắc nghiệm..."
            className="flex-1 border border-indigo-200 dark:border-indigo-700 focus:border-indigo-500 rounded-xl p-3 outline-none text-sm bg-white dark:bg-slate-800 h-20 resize-none"
          />
          <button
            type="button"
            onClick={generateWithAi}
            disabled={isGenerating || !aiPrompt.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded-xl font-bold flex flex-col items-center justify-center gap-1 min-w-[100px] disabled:opacity-50"
          >
            {isGenerating ? <Zap className="w-5 h-5 animate-pulse" /> : <Zap className="w-5 h-5" />}
            <span className="text-xs">{isGenerating ? 'Đang tạo...' : 'Tạo AI'}</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((q, qIndex) => (
          <div key={q.id} className="border border-slate-200 dark:border-slate-700 p-4 rounded-2xl relative bg-slate-50 dark:bg-slate-800/50">
            <button 
              type="button"
              onClick={() => removeQuestion(qIndex)}
              className="absolute top-4 right-4 p-1.5 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="mb-3 pr-8">
              <label className="block text-xs font-bold text-slate-500 mb-1">Câu hỏi {qIndex + 1}</label>
              <input
                type="text"
                value={q.question || ''}
                onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 outline-none text-sm font-medium bg-white dark:bg-slate-900"
                placeholder="Nhập nội dung câu hỏi..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              {q.options.map((opt, optIndex) => (
                <div key={optIndex} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct_${q.id}`}
                    checked={q.correctAnswer === optIndex}
                    onChange={() => updateQuestion(qIndex, 'correctAnswer', optIndex)}
                    className="w-4 h-4 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={opt || ''}
                    onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                    className="flex-1 border border-slate-200 dark:border-slate-700 rounded-lg p-2 outline-none text-sm bg-white dark:bg-slate-900"
                    placeholder={`Đáp án ${['A', 'B', 'C', 'D'][optIndex]}`}
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-500 mb-1">Giải thích (tùy chọn)</label>
                <input
                  type="text"
                  value={q.explanation || ''}
                  onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-2 outline-none text-xs bg-white dark:bg-slate-900"
                  placeholder="Giải thích vì sao đáp án này đúng..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Độ khó</label>
                <select
                  value={q.difficulty || 'easy'}
                  onChange={(e) => updateQuestion(qIndex, 'difficulty', e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-2 outline-none text-xs font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                >
                  <option value="easy">Dễ</option>
                  <option value="hard">Khó</option>
                </select>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addQuestion}
          className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-slate-500 hover:text-indigo-600 font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Thêm câu hỏi thủ công
        </button>
      </div>
    </div>
  );
}
