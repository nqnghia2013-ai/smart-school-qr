const fs = require('fs');

let code = fs.readFileSync('src/pages/DigitalClass.tsx', 'utf8');

const oldQuizFinish = `  const handleQuizFinish = (questId: string, correct: number, incorrect: number, timeTaken: number) => {
    if (!currentUser) return;
    
    // Find the quest and calculate if it was completed
    const questIdx = quests.findIndex(q => q.id === questId);
    if (questIdx === -1) return;
    
    const quest = quests[questIdx];
    
    const result = {
      studentId: currentUser.id,
      studentName: currentUser.fullName,
      timeTaken,
      correctCount: correct,
      incorrectCount: incorrect,
      date: new Date().toISOString()
    };
    
    const updatedQuests = [...quests];
    const newQuest = { ...quest };
    if (!newQuest.results) newQuest.results = [];
    
    // Check if student already did it
    const existingIdx = newQuest.results.findIndex((r: any) => r.studentId === currentUser.id);
    if (existingIdx !== -1) {
      newQuest.results[existingIdx] = result;
    } else {
      newQuest.results.push(result);
    }
    
    if (!newQuest.completedBy) newQuest.completedBy = [];
    if (!newQuest.completedBy.includes(currentUser.id)) {
      newQuest.completedBy.push(currentUser.id);
      
      // Award points (coins) for completion
      const userDoc = users.find(u => u.id === currentUser.id);
      if (userDoc) {
        addUser({ ...userDoc, coins: (userDoc.coins || 0) + 10 });
      }
    }
    
    updatedQuests[questIdx] = newQuest;
    setQuests(updatedQuests);
    setActiveQuizQuest(null);
  };`;

const newQuizFinish = `  const handleQuizFinish = (questId: string, correct: number, incorrect: number, timeTaken: number) => {
    if (!currentUser || !classData) return;
    
    const studentIdOfUser = classData.students?.find(s => s.userId === currentUser.id)?.id || classData.students?.[0]?.id;
    if (!studentIdOfUser) return;
    
    // Find the quest and calculate if it was completed
    const questIdx = quests.findIndex(q => q.id === questId);
    if (questIdx === -1) return;
    
    const quest = quests[questIdx];
    
    const result = {
      studentId: studentIdOfUser,
      studentName: currentUser.fullName,
      timeTaken,
      correctCount: correct,
      incorrectCount: incorrect,
      date: new Date().toISOString()
    };
    
    const updatedQuests = [...quests];
    const newQuest = { ...quest };
    if (!newQuest.results) newQuest.results = [];
    
    // Check if student already did it
    const existingIdx = newQuest.results.findIndex((r: any) => r.studentId === studentIdOfUser);
    if (existingIdx !== -1) {
      newQuest.results[existingIdx] = result;
    } else {
      newQuest.results.push(result);
    }
    
    if (!newQuest.completedBy) newQuest.completedBy = [];
    if (!newQuest.completedBy.includes(studentIdOfUser)) {
      newQuest.completedBy.push(studentIdOfUser);
      
      // Award points (coins) for completion
      const userDoc = users.find(u => u.id === currentUser.id);
      if (userDoc) {
        addUser({ ...userDoc, coins: (userDoc.coins || 0) + 10 });
      }
    }
    
    updatedQuests[questIdx] = newQuest;
    setQuests(updatedQuests);
    setActiveQuizQuest(null);
  };`;

code = code.replace(oldQuizFinish, newQuizFinish);
fs.writeFileSync('src/pages/DigitalClass.tsx', code);
