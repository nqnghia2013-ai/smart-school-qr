import React, { createContext, useContext, useState, useEffect } from 'react';
import { SubjectRoom, StudentProfile, DigitalClass, DashboardStats, User, StaffProfile, AppNotification, QA, StoreGif, LearningApp } from '../types';
import { signOut as firebaseSignOut, db } from '../lib/firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, getDocs, query, where } from 'firebase/firestore';
import { seedDatabase } from '../lib/seed';

export interface AppContextType {
  currentUser: User | null;
  users: User[];
  rooms: SubjectRoom[];
  students: StudentProfile[];
  classes: DigitalClass[];
  staffs: StaffProfile[];
  stats: DashboardStats;
  notifications: AppNotification[];
  qas: QA[];
  storeGifs: StoreGif[];
  learningApps: LearningApp[];
  login: (user: User) => void;
  logout: () => void;
  addUser: (user: Omit<User, 'id'>) => string;
  updateUser: (id: string, updates: Partial<User>) => void;
  updateClass: (id: string, updates: Partial<DigitalClass>) => void;
  updateStudent: (id: string, updates: Partial<StudentProfile>) => void;
  addRoom: (room: Omit<SubjectRoom, 'id'>) => void;
  updateRoom: (id: string, updates: Partial<SubjectRoom>) => void;
  deleteRoom: (id: string) => void;
  addClass: (cls: Omit<DigitalClass, 'id'>) => void;
  deleteClass: (id: string) => void;
  addStudent: (student: Omit<StudentProfile, 'id'>) => void;
  deleteStudent: (id: string) => void;
  updateUserRole: (id: string, role: string) => void;
  deleteUser: (id: string) => void;
  addStaff: (staff: Omit<StaffProfile, 'id'>) => void;
  deleteStaff: (id: string) => void;
  recordRoomVisit: () => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'isRead' | 'date'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  addQA: (qa: Omit<QA, 'id' | 'date' | 'likes' | 'status'>) => string;
  answerQA: (id: string, answer: string, teacherName: string) => void;
  addStoreGif: (gif: Omit<StoreGif, 'id'>) => void;
  deleteStoreGif: (id: string) => void;
  addLearningApp: (app: Omit<LearningApp, 'id' | 'createdAt'>) => void;
  deleteLearningApp: (id: string) => void;
  getSchoolName: (schoolId: string) => string;
}

const defaultStats: DashboardStats = {
  totalVisits: 0,
  activeStudents: 0,
  activeRooms: 0,
  qrHours: 0,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('smart_school_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<User[]>([]);

  const [rooms, setRooms] = useState<SubjectRoom[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [classes, setClasses] = useState<DigitalClass[]>([]);
  const [staffs, setStaffs] = useState<StaffProfile[]>([]);
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [qas, setQas] = useState<QA[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [storeGifs, setStoreGifs] = useState<StoreGif[]>([]);
  const [learningApps, setLearningApps] = useState<LearningApp[]>([]);

  // FIREBASE SYNC (onSnapshot)
  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), d => {
        setUsers(d.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
    });
    const unsubRooms = onSnapshot(collection(db, 'rooms'), d => setRooms(d.docs.map(doc => ({ id: doc.id, ...doc.data() } as SubjectRoom))));
    const unsubStudents = onSnapshot(collection(db, 'students'), d => setStudents(d.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudentProfile))));
    const unsubClasses = onSnapshot(collection(db, 'classes'), d => setClasses(d.docs.map(doc => ({ id: doc.id, ...doc.data() } as DigitalClass))));
    const unsubStaffs = onSnapshot(collection(db, 'staffs'), d => setStaffs(d.docs.map(doc => ({ id: doc.id, ...doc.data() } as StaffProfile))));
    const unsubQAs = onSnapshot(collection(db, 'qas'), d => setQas(d.docs.map(doc => ({ id: doc.id, ...doc.data() } as QA))));
    const unsubNotifs = onSnapshot(collection(db, 'notifications'), d => setNotifications(d.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppNotification))));
    const unsubStoreGifs = onSnapshot(collection(db, 'storeGifs'), d => setStoreGifs(d.docs.map(doc => ({ id: doc.id, ...doc.data() } as StoreGif))));
    const unsubLearningApps = onSnapshot(collection(db, 'learningApps'), d => setLearningApps(d.docs.map(doc => ({ id: doc.id, ...doc.data() } as LearningApp))));

    return () => {
      unsubUsers(); unsubRooms(); unsubStudents(); unsubClasses();
      unsubStaffs(); unsubQAs(); unsubNotifs(); unsubStoreGifs(); unsubLearningApps();
    };
  }, []);

  // Update currentUser local state when user login changed
  useEffect(() => {
    if (currentUser) localStorage.setItem('smart_school_current_user', JSON.stringify(currentUser));
    else localStorage.removeItem('smart_school_current_user');
  }, [currentUser]);

  // Real-time online/offline presence tracking
  useEffect(() => {
    if (!currentUser) return;

    // Immediately mark as online
    const markOnline = async () => {
      try {
        await setDoc(doc(db, 'users', currentUser.id), {
          status: 'online',
          lastActive: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.error("Error setting presence online:", err);
      }
    };
    markOnline();

    // Setup heartbeat interval (every 30 seconds)
    const interval = setInterval(async () => {
      try {
        await setDoc(doc(db, 'users', currentUser.id), {
          lastActive: new Date().toISOString(),
          status: 'online'
        }, { merge: true });
      } catch (err) {
        console.error("Error sending presence heartbeat:", err);
      }
    }, 30000);

    // Mark offline on exit
    const handleUnload = () => {
      setDoc(doc(db, 'users', currentUser.id), {
        status: 'offline',
        lastActive: new Date().toISOString()
      }, { merge: true }).catch(console.error);
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleUnload);
      handleUnload();
    };
  }, [currentUser]);

  // Database migration to reset all users' streaks for the new system (runs once)
  useEffect(() => {
    if (!currentUser) return;
    const migrateStreaks = async () => {
      const migrated = localStorage.getItem('smart_school_migrated_streaks_v3');
      if (!migrated) {
        try {
          const q = query(collection(db, 'users'));
          const snap = await getDocs(q);
          const today = new Date().toLocaleDateString('en-CA');
          for (const d of snap.docs) {
            const isMe = d.id === currentUser.id;
            await setDoc(doc(db, 'users', d.id), {
              streakCount: isMe ? 1 : 0,
              lastVisitDate: isMe ? today : "",
              visitedDates: isMe ? [today] : [],
              streakFreezeCount: isMe ? 0 : 0, // initially 0, they can claim 1 free one in the shop!
              frozenDates: [],
              claimedFreeFreeze: false
            }, { merge: true });
          }
          localStorage.setItem('smart_school_migrated_streaks_v3', 'true');
          console.log("Successfully migrated and reset all users' streaks!");
        } catch (e) {
          console.error("Streak reset migration failed:", e);
        }
      }
    };
    migrateStreaks();
  }, [currentUser?.id]);

  // Check and process learning streak globally with Streak Freeze support
  useEffect(() => {
    if (!currentUser) return;

    const checkAndProcessStreak = async () => {
      const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
      const lastVisit = currentUser.lastVisitDate;
      
      if (lastVisit !== today) {
        let streak = currentUser.streakCount || 0;
        let newCoins = currentUser.coins || 0;
        let justReached7Days = false;
        let history = currentUser.visitedDates || [];
        let freezeCount = currentUser.streakFreezeCount || 0;
        let freezes = currentUser.frozenDates || [];
        let usedFreeze = false;
        
        if (!history.includes(today)) {
          history = [...history, today];
        }
        history = history.slice(-30);

        if (lastVisit) {
          const lastDate = new Date(lastVisit + 'T00:00:00');
          const currentDate = new Date(today + 'T00:00:00');
          const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
          
          if (diffDays === 1) {
            streak += 1;
            if (streak % 7 === 0 && streak > 0) {
              newCoins += 20;
              justReached7Days = true;
            }
          } else if (diffDays === 2 && freezeCount > 0) {
            // Missed exactly 1 day (diffDays = 2) and has a freeze!
            const yesterdayDate = new Date(currentDate.getTime() - (1000 * 3600 * 24));
            const yesterdayStr = yesterdayDate.toLocaleDateString('en-CA');
            
            if (!freezes.includes(yesterdayStr)) {
              freezes = [...freezes, yesterdayStr];
            }
            freezeCount -= 1;
            streak += 1; // Streak preserved and continued today
            usedFreeze = true;
            
            if (streak % 7 === 0 && streak > 0) {
              newCoins += 20;
              justReached7Days = true;
            }
          } else if (diffDays > 1) {
            // Missed more than 1 day or has no freezes left
            streak = 1;
          }
        } else {
          streak = 1;
        }

        const updateData: any = {
          lastVisitDate: today,
          streakCount: streak,
          visitedDates: history,
          streakFreezeCount: freezeCount,
          frozenDates: freezes
        };

        if (justReached7Days) {
          updateData.coins = newCoins;
          
          const notifId = `notif_${Date.now()}`;
          try {
            await setDoc(doc(db, 'notifications', notifId), {
              userId: currentUser.id,
              title: "Chuỗi đăng nhập 7 ngày!",
              message: "Chúc mừng bạn đã duy trì chuỗi học 7 ngày liên tiếp. Bạn được thưởng 20 xu!",
              type: 'info',
              createdAt: new Date().toISOString(),
              read: false
            });
          } catch (err) {
            console.error("Error creating streak notification:", err);
          }
        }

        if (usedFreeze) {
          const notifId = `notif_freeze_${Date.now()}`;
          try {
            await setDoc(doc(db, 'notifications', notifId), {
              userId: currentUser.id,
              title: "Chuỗi học đã được cứu!",
              message: `Bạn đã bỏ lỡ việc học ngày hôm qua, nhưng một "Đóng băng chuỗi" đã được sử dụng tự động để giữ nguyên chuỗi ${streak} ngày của bạn!`,
              type: 'info',
              createdAt: new Date().toISOString(),
              read: false
            });
          } catch (err) {
            console.error("Error creating freeze use notification:", err);
          }
        }

        try {
          await setDoc(doc(db, 'users', currentUser.id), updateData, { merge: true });
          setCurrentUser(prev => prev ? { ...prev, ...updateData } : null);
        } catch (err) {
          console.error("Error updating streak counts:", err);
        }
      } else {
        const history = currentUser.visitedDates || [];
        if (!history.includes(today)) {
          const updatedHistory = [...history, today].slice(-30);
          try {
            await setDoc(doc(db, 'users', currentUser.id), { visitedDates: updatedHistory }, { merge: true });
            setCurrentUser(prev => prev ? { ...prev, visitedDates: updatedHistory } : null);
          } catch (err) {
            console.error("Error updating streak history:", err);
          }
        }
      }
    };

    checkAndProcessStreak();
  }, [currentUser?.id]);

  const login = (user: User) => setCurrentUser(user);
  
  const logout = async () => {
    if (currentUser) {
      try {
        await setDoc(doc(db, 'users', currentUser.id), {
          status: 'offline',
          lastActive: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        console.error("Error during offline presence set:", e);
      }
    }
    setCurrentUser(null);
    try { await firebaseSignOut(); } catch (e) { console.error(e); }
  };

  const addUser = (user: Omit<User, 'id'>) => {
    const id = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const finalUser = {
      ...user,
      schoolId: user.schoolId || currentUser?.schoolId || ''
    };
    setDoc(doc(db, 'users', id), finalUser).catch(console.error);
    return id;
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    const cleanUpdates = Object.fromEntries(Object.entries(updates).filter(([_, v]) => v !== undefined));
    setDoc(doc(db, 'users', id), cleanUpdates, { merge: true }).catch(console.error);
    if (currentUser?.id === id) {
       setCurrentUser({ ...currentUser, ...updates });
    }
  };

  const updateClass = (id: string, updates: Partial<DigitalClass>) => {
    const cleanUpdates = Object.fromEntries(Object.entries(updates).filter(([_, v]) => v !== undefined));
    setDoc(doc(db, 'classes', id), cleanUpdates, { merge: true }).catch(console.error);
  };
  
  const updateStudent = (id: string, updates: Partial<StudentProfile>) => {
    const cleanUpdates = Object.fromEntries(Object.entries(updates).filter(([_, v]) => v !== undefined));
    setDoc(doc(db, 'students', id), cleanUpdates, { merge: true }).catch(console.error);
  };

  const addRoom = (room: Omit<SubjectRoom, 'id'>) => {
    const id = Date.now().toString();
    const finalRoom = {
      ...room,
      schoolId: (room as any).schoolId || currentUser?.schoolId || ''
    };
    const cleanRoom = Object.fromEntries(Object.entries(finalRoom).filter(([_, v]) => v !== undefined));
    setDoc(doc(db, 'rooms', id), cleanRoom).catch(console.error);
  };

  const updateRoom = (id: string, updates: Partial<SubjectRoom>) => {
    const cleanUpdates = Object.fromEntries(Object.entries(updates).filter(([_, v]) => v !== undefined));
    setDoc(doc(db, 'rooms', id), cleanUpdates, { merge: true }).catch(console.error);
  };

  const deleteRoom = (id: string) => {
    deleteDoc(doc(db, 'rooms', id)).catch(console.error);
  };

  const addClass = (cls: Omit<DigitalClass, 'id'>) => {
    const id = Date.now().toString();
    const finalCls = {
      ...cls,
      schoolId: cls.schoolId || currentUser?.schoolId || ''
    };
    const cleanCls = Object.fromEntries(Object.entries(finalCls).filter(([_, v]) => v !== undefined));
    setDoc(doc(db, 'classes', id), cleanCls).catch(console.error);
  };

  const deleteClass = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'classes', id));
      
      // AI check & remove logic:
      // Delete all students that belong to this class
      const stQuery = query(collection(db, 'students'), where('classId', '==', id));
      const stSnap = await getDocs(stQuery);
      
      stSnap.docs.forEach(async (stDoc) => {
        const stData = stDoc.data() as StudentProfile;
        await deleteDoc(doc(db, 'students', stDoc.id));
        
        // Delete student user account
        if (stData.userId) {
          await deleteDoc(doc(db, 'users', stData.userId));
        }
        
        // Find and delete any parent user accounts linked to this student
        const parentQuery = query(collection(db, 'users'), where('linkedStudentId', '==', stDoc.id));
        const parentSnap = await getDocs(parentQuery);
        parentSnap.docs.forEach(async (pDoc) => {
          await deleteDoc(doc(db, 'users', pDoc.id));
        });
      });
      
      // Also delete any users that have assignedClassId == id
      const userQuery = query(collection(db, 'users'), where('assignedClassId', '==', id));
      const userSnap = await getDocs(userQuery);
      userSnap.docs.forEach(async (uDoc) => {
        await deleteDoc(doc(db, 'users', uDoc.id));
      });
    } catch (error) {
      console.error(error);
    }
  };

  const addStudent = (student: Omit<StudentProfile, 'id'>) => {
    const id = Date.now().toString();
    const finalStudent = {
      ...student,
      schoolId: student.schoolId || currentUser?.schoolId || ''
    };
    setDoc(doc(db, 'students', id), finalStudent).catch(console.error);
  };

  const deleteStudent = async (id: string) => {
    try {
      const stDoc = await getDocs(query(collection(db, 'students'), where('__name__', '==', id)));
      if (!stDoc.empty) {
        const stData = stDoc.docs[0].data() as StudentProfile;
        if (stData.userId) {
          await deleteDoc(doc(db, 'users', stData.userId));
        }
      }
      
      await deleteDoc(doc(db, 'students', id));
      
      const parentQuery = query(collection(db, 'users'), where('linkedStudentId', '==', id));
      const parentSnap = await getDocs(parentQuery);
      parentSnap.docs.forEach(async (pDoc) => {
        await deleteDoc(doc(db, 'users', pDoc.id));
      });
    } catch (error) {
      console.error(error);
    }
  };

  const addStaff = (staff: Omit<StaffProfile, 'id'>) => {
    const id = Date.now().toString();
    setDoc(doc(db, 'staffs', id), staff).catch(console.error);
  };

  const deleteStaff = async (id: string) => {
    try {
      const staffDoc = await getDocs(query(collection(db, 'staffs'), where('__name__', '==', id)));
      if (!staffDoc.empty) {
        const staffEmail = (staffDoc.docs[0].data() as StaffProfile).email;
        if (staffEmail) {
           const uQuery = query(collection(db, 'users'), where('email', '==', staffEmail));
           const uSnap = await getDocs(uQuery);
           uSnap.docs.forEach(async (uDoc) => {
             await deleteDoc(doc(db, 'users', uDoc.id));
           });
        }
      }
      
      await deleteDoc(doc(db, 'staffs', id));
    } catch (error) {
      console.error(error);
    }
  };

  const updateUserRole = (id: string, role: string) => {
    updateDoc(doc(db, 'users', id), { role }).catch(console.error);
    if (currentUser?.id === id) {
      setCurrentUser(prev => prev ? { ...prev, role: role as any } : null);
    }
  };

  const deleteUser = (id: string) => {
    deleteDoc(doc(db, 'users', id)).catch(console.error);
  };

  const recordRoomVisit = () => {
    setStats(prev => ({
      ...prev,
      totalVisits: prev.totalVisits + 1,
      qrHours: prev.qrHours + 0.5,
    }));
  };

  const addNotification = (notif: Omit<AppNotification, 'id' | 'isRead' | 'date'>) => {
    const newNotif = {
      ...notif,
      isRead: false,
      date: new Date().toISOString(),
      schoolId: (notif as any).schoolId || currentUser?.schoolId || ''
    };
    const id = Date.now().toString();
    setDoc(doc(db, 'notifications', id), newNotif).catch(console.error);
  };

  const markNotificationAsRead = (id: string) => {
    updateDoc(doc(db, 'notifications', id), { isRead: true }).catch(console.error);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  const clearAllNotifications = () => {
    notifications.forEach(notif => {
       if (notif.userId === currentUser?.id || (!notif.userId && currentUser?.role === 'admin')) {
           deleteDoc(doc(db, 'notifications', notif.id)).catch(console.error);
       }
    });
  };

  const addQA = (qa: Omit<QA, 'id' | 'date' | 'likes' | 'status'>) => {
    const id = Date.now().toString();
    const newQA = {
      ...qa,
      date: new Date().toISOString(),
      likes: 0,
      status: 'waiting',
      schoolId: currentUser?.schoolId || ''
    };
    setDoc(doc(db, 'qas', id), newQA).catch(console.error);
    return id;
  };

  const answerQA = (id: string, answer: string, teacherName: string) => {
    updateDoc(doc(db, 'qas', id), { status: 'answered', answer, teacher: teacherName }).catch(console.error);
  };

  const addStoreGif = (gif: Omit<StoreGif, 'id'>) => {
    const id = Date.now().toString();
    setDoc(doc(db, 'storeGifs', id), gif).catch(console.error);
  };

  const deleteStoreGif = (id: string) => {
    deleteDoc(doc(db, 'storeGifs', id)).catch(console.error);
  };

  const addLearningApp = (app: Omit<LearningApp, 'id' | 'createdAt'>) => {
    const id = Date.now().toString();
    const newApp = { ...app, createdAt: new Date().toISOString() };
    setDoc(doc(db, 'learningApps', id), newApp).catch(console.error);
  };

  const deleteLearningApp = (id: string) => {
    deleteDoc(doc(db, 'learningApps', id)).catch(console.error);
  };

  const getSchoolName = (schoolIdVal: string) => {
    if (!schoolIdVal) return 'Smart School Workspace';
    const school = users.find(u => u.role === 'school' && (u.id === schoolIdVal || u.schoolId === schoolIdVal));
    return school?.fullName || 'Smart School Workspace';
  };

  // Seed default admin if cloud DB has NO users yet!
  useEffect(() => {
    seedDatabase().catch(console.error);
  }, []);

  // Multi-tenant isolation filters
  const schoolId = currentUser?.schoolId;
  const isTechnician = currentUser?.role === 'technician';

  const filteredUsers = users.filter(u => {
    if (!currentUser) return true;
    if (isTechnician) return true;
    return u.schoolId === schoolId || u.role === 'technician';
  });

  const filteredRooms = rooms.filter(r => {
    if (!currentUser) return true;
    if (isTechnician) return true;
    return (r as any).schoolId === schoolId || !(r as any).schoolId;
  });

  const filteredClasses = classes.filter(c => {
    if (!currentUser) return true;
    if (isTechnician) return true;
    return c.schoolId === schoolId;
  });

  const filteredStudents = students.filter(s => {
    if (!currentUser) return true;
    if (isTechnician) return true;
    return s.schoolId === schoolId;
  });

  const filteredStaffs = staffs.filter(st => {
    if (!currentUser) return true;
    if (isTechnician) return true;
    return (st as any).schoolId === schoolId || !(st as any).schoolId;
  });

  const filteredQas = qas.filter(q => {
    if (!currentUser) return true;
    if (isTechnician) return true;
    return (q as any).schoolId === schoolId || !(q as any).schoolId;
  });

  const filteredNotifications = notifications.filter(notif => {
    if (!currentUser) return true;
    if (isTechnician) return true;
    return notif.schoolId === schoolId || !notif.schoolId;
  });

  return (
    <AppContext.Provider value={{
      currentUser,
      users: filteredUsers,
      rooms: filteredRooms,
      students: filteredStudents,
      classes: filteredClasses,
      staffs: filteredStaffs,
      stats,
      notifications: filteredNotifications,
      qas: filteredQas,
      storeGifs,
      learningApps,
      getSchoolName,
      login, logout, addUser, updateUser, updateClass, updateStudent, updateUserRole, deleteUser,
      addRoom, updateRoom, deleteRoom, addClass, deleteClass, addStudent, deleteStudent, addStaff, deleteStaff, 
      recordRoomVisit, addNotification, markNotificationAsRead, clearAllNotifications, showToast, addQA, answerQA, addStoreGif, deleteStoreGif, addLearningApp, deleteLearningApp
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

