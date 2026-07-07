import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Users, MessageSquare, Search, UserPlus, File, 
  Image as ImageIcon, Mic, Send, X, Paperclip, 
  CheckCheck, Clock, UserCheck, ChevronLeft, MoreVertical, MessagesSquare, UserSquare2
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, onSnapshot, orderBy, serverTimestamp, setDoc, doc, deleteDoc } from 'firebase/firestore';

const removeAccents = (str: string) => {
  if (!str) return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
};

export default function SocialNetwork() {
  const navigate = useNavigate();
  const { currentUser, students, classes, staffs, deleteUser, showToast } = useAppContext();
  const [activeTab, setActiveTab] = useState<'friends' | 'directory' | 'chats'>('directory');
  const [users, setUsers] = useState<any[]>([]);

  // AI Cleanup: Delete invalid accounts globally
  useEffect(() => {
    const allStudents = [...students];
    classes.forEach(cls => {
      cls.students?.forEach((st: any) => {
        if (!allStudents.some(s => s.id === st.id)) {
          allStudents.push({ ...st, classId: cls.id });
        }
      });
    });

    users.forEach(u => {
      if (u.role === 'teacher') {
        const staffExists = staffs.some((s: any) => s.email === u.email);
        if (!staffExists) {
          deleteUser(u.id);
        }
      } else if (u.role === 'student') {
        const studentExists = allStudents.some(s => s.userId === u.id || (s.email && u.email && s.email === u.email) || (s.username && u.username && s.username === u.username));
        if (!studentExists) {
          deleteUser(u.id);
        }
      } else if (u.role === 'parent') {
        const parentExists = allStudents.some(s => s.id === u.linkedStudentId || (s.parentEmail && u.email && s.parentEmail === u.email));
        if (!parentExists) {
          deleteUser(u.id);
        }
      }
    });
  }, [users, staffs, classes, students]);
  const [friends, setFriends] = useState<any[]>([]); // list of user ids
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Real-time online/offline and typing indicator helpers
  const typingTimeoutRef = useRef<any>(null);
  const [isLocalTyping, setIsLocalTyping] = useState(false);

  const currentChatInfo = chats.find(c => c.id === activeChat?.id) || activeChat;

  const isUserOnline = (userId: string) => {
    if (userId === currentUser?.id) return true;
    const u = users.find(x => x.id === userId);
    if (!u) return false;
    if (u.status !== 'online') return false;
    if (!u.lastActive) return false;
    const diff = new Date().getTime() - new Date(u.lastActive).getTime();
    return diff < 90000; // 90 seconds
  };

  const setTypingInFirestore = async (isTyping: boolean) => {
    if (!currentUser || !activeChat) return;
    try {
      await setDoc(doc(db, 'chats', activeChat.id), {
        typing: {
          [currentUser.id]: isTyping
        }
      }, { merge: true });
    } catch (e) {
      console.error("Error setting typing in Firestore:", e);
    }
  };

  const handleUserTyping = () => {
    if (!isLocalTyping) {
      setIsLocalTyping(true);
      setTypingInFirestore(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsLocalTyping(false);
      setTypingInFirestore(false);
    }, 3000);
  };

  useEffect(() => {
    if (isLocalTyping) {
      setIsLocalTyping(false);
      setTypingInFirestore(false);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [activeChat?.id]);

  const getTypingText = () => {
    if (!currentChatInfo || !currentChatInfo.typing) return null;
    const typingIds = Object.entries(currentChatInfo.typing)
      .filter(([id, isTyping]) => id !== currentUser?.id && isTyping === true)
      .map(([id]) => id);

    if (typingIds.length === 0) return null;

    if (currentChatInfo.isGroup) {
      if (typingIds.length === 1) {
        const u = users.find(x => x.id === typingIds[0]);
        return `${u?.fullName || 'Thành viên'} đang nhập tin nhắn...`;
      } else {
        const names = typingIds
          .slice(0, 2)
          .map(id => users.find(x => x.id === id)?.fullName || 'Thành viên')
          .join(', ');
        const extraCount = typingIds.length - 2;
        return extraCount > 0
          ? `${names} và ${extraCount} người khác đang soạn tin...`
          : `${names} đang soạn tin...`;
      }
    } else {
      return "Đang soạn tin...";
    }
  };
  
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupAvatar, setGroupAvatar] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const [newMembersToAdd, setNewMembersToAdd] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!currentUser) return;
    
    // Load all users with real-time updates
    const qUsers = query(collection(db, 'users'));
    const unsubscribeUsers = onSnapshot(qUsers, snap => {
      const allUsers = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.id !== currentUser.id);
      setUsers(allUsers);
    });

    // Load friends
    const qFriends1 = query(collection(db, 'friends'), where('user1', '==', currentUser.id), where('status', '==', 'accepted'));
    const qFriends2 = query(collection(db, 'friends'), where('user2', '==', currentUser.id), where('status', '==', 'accepted'));
    
    const unsubscribeF1 = onSnapshot(qFriends1, (snap) => {
      const f1 = snap.docs.map(d => d.data().user2);
      setFriends(prev => [...new Set([...prev, ...f1])]);
    });
    
    const unsubscribeF2 = onSnapshot(qFriends2, (snap) => {
      const f2 = snap.docs.map(d => d.data().user1);
      setFriends(prev => [...new Set([...prev, ...f2])]);
    });

    // Load chats
    const qChats = query(collection(db, 'chats'), where('participants', 'array-contains', currentUser.id));
    const unsubscribeChats = onSnapshot(qChats, snap => {
      const loadedChats = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setChats(loadedChats.sort((a: any, b: any) => (b.lastMessageAt?.toMillis() || 0) - (a.lastMessageAt?.toMillis() || 0)));
    });

  

  return () => {
      unsubscribeUsers();
      unsubscribeF1();
      unsubscribeF2();
      unsubscribeChats();
    };
  }, [currentUser]);

  useEffect(() => {
    if (!activeChat) return;

    const qMsgs = query(collection(db, `chats/${activeChat.id}/messages`), orderBy('createdAt', 'asc'));
    const unsubscribeMsgs = onSnapshot(qMsgs, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return () => unsubscribeMsgs();
  }, [activeChat]);

  const handleAddFriend = async (userId: string) => {
    if (!currentUser) return;
    const targetUser = validUsers.find(u => u.id === userId);
    if (targetUser?.isUnregistered) {
      alert(`Tài khoản của ${targetUser.fullName} chưa được kích hoạt, không thể kết bạn!`);
      return;
    }
    const friendIdStr = [currentUser.id, userId].sort().join('_');
    await setDoc(doc(db, 'friends', friendIdStr), {
      user1: currentUser.id,
      user2: userId,
      status: 'accepted',
      createdAt: serverTimestamp()
    });
  };

  const handleStartChat = async (userId: string) => {
    if (!currentUser) return;
    
    const targetUser = validUsers.find(u => u.id === userId);
    if (targetUser?.isUnregistered) {
      alert(`Tài khoản của ${targetUser.fullName} chưa được kích hoạt, không thể nhắn tin!`);
      return;
    }

    // Check if chat exists
    const existingChat = chats.find(c => !c.isGroup && c.participants.includes(userId));
    if (existingChat) {
      setActiveChat(existingChat);
      setActiveTab('chats');
      return;
    }

    // Create new chat
    const newChatRef = await addDoc(collection(db, 'chats'), {
      participants: [currentUser.id, userId],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    setActiveChat({ id: newChatRef.id, participants: [currentUser.id, userId] });
    setActiveTab('chats');
  };

  const sendMessage = async (type: 'text' | 'image' | 'audio' | 'file', text: string, fileUrl?: string, fileName?: string) => {
    if (!currentUser || !activeChat || (!text.trim() && !fileUrl)) return;

    // Turn off typing state instantly
    setIsLocalTyping(false);
    setTypingInFirestore(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    await addDoc(collection(db, `chats/${activeChat.id}/messages`), {
      senderId: currentUser.id,
      text,
      type,
      fileUrl: fileUrl || null,
      fileName: fileName || null,
      createdAt: serverTimestamp()
    });

    await setDoc(doc(db, 'chats', activeChat.id), {
      lastMessage: type === 'text' ? text : `Đã gửi 1 ${type === 'image' ? 'ảnh' : type === 'audio' ? 'tin nhắn thoại' : 'tài liệu'}`,
      lastMessageAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      participants: activeChat.participants
    }, { merge: true });

    setNewMessage('');
  };

  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Trình duyệt của bạn không hỗ trợ tính năng ghi âm, hoặc quyền truy cập microphone chưa được cho phép. Vui lòng mở ứng dụng trong tab mới (icon góc trên bên phải) để có thể ghi âm.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
           const base64Audio = reader.result as string;
           sendMessage('audio', '', base64Audio, 'Tin nhắn thoại.webm');
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone', error);
      alert('Không thể truy cập microphone!');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // Only allow files < 1MB for Base64 Firestore demo
         alert('Thư mục lưu trữ tạm thời chỉ hỗ trợ file dưới 1MB. Vui lòng chọn file nhỏ hơn.');
         return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
          const base64Data = reader.result as string;
          sendMessage(type, '', base64Data, file.name);
          showToast('Tải tài liệu thành công', 'success');
      };
      reader.readAsDataURL(file);
    }
  };


  const handleCreateGroup = async () => {
    if (!currentUser || !groupName.trim() || selectedFriends.length === 0) {
       showToast('Vui lòng nhập tên nhóm và chọn ít nhất 1 thành viên', 'error');
       return;
    }
    
    const participants = [currentUser.id, ...selectedFriends];
    
    const newChatRef = await addDoc(collection(db, 'chats'), {
      isGroup: true,
      groupName: groupName.trim(),
      groupAvatar: groupAvatar || null,
      participants,
      adminId: currentUser.id,
      deputyIds: [],
      chatSettings: {
        canChangeGroupInfo: true,
        canPinMessages: true,
        canCreateNotes: true,
        canCreatePolls: true,
        canSendMessages: true,
        requireApproval: true,
        highlightAdminMessages: true,
        newMembersCanReadHistory: true,
        joinViaLink: false
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessage: 'Nhóm đã được tạo',
      lastMessageAt: serverTimestamp()
    });

    setIsCreatingGroup(false);
    setGroupName('');
    setGroupAvatar('');
    setSelectedFriends([]);
    showToast('Tạo nhóm trò chuyện thành công', 'success');
    setActiveChat({ 
      id: newChatRef.id, 
      isGroup: true, 
      groupName: groupName.trim(), 
      groupAvatar: groupAvatar || null, 
      participants,
      adminId: currentUser.id,
      deputyIds: [],
      chatSettings: {
        canChangeGroupInfo: true,
        canPinMessages: true,
        canCreateNotes: true,
        canCreatePolls: true,
        canSendMessages: true,
        requireApproval: true,
        highlightAdminMessages: true,
        newMembersCanReadHistory: true,
        joinViaLink: false
      }
    });
    setActiveTab('chats');
  };

  const getStudentForUser = (u: any) => {
    if (u.role === 'student') {
      // 1. match directly in classes
      for (const cls of classes) {
        if (cls.students?.some((s: any) => 
          s.userId === u.id || 
          (s.email && u.email && s.email === u.email) || 
          (s.username && u.username && s.username === u.username)
        )) {
          return { cls };
        }
      }

      // 2. match global students
      const globalSt = students.find(s => 
        s.userId === u.id || 
        (s.email && u.email && s.email === u.email) || 
        (s.username && u.username && s.username === u.username)
      );
      if (globalSt) {
        const cls = classes.find(c => c.id === globalSt.classId);
        if (cls) return { cls };
      }

      // 3. Fallback to assigned class ID
      if (u.assignedClassId) {
        const cls = classes.find(c => c.id === u.assignedClassId);
        if (cls) return { cls };
      }
    }
    
    if (u.role === 'parent') {
      // 1. Match in classes
      for (const cls of classes) {
        if (cls.students?.some((s: any) => 
          s.id === u.linkedStudentId || 
          (s.parentEmail && u.email && s.parentEmail === u.email)
        )) {
          return { cls };
        }
      }

      // 2. match global students
      const globalSt = students.find(s => 
        s.id === u.linkedStudentId || 
        (s.parentEmail && u.email && s.parentEmail === u.email)
      );
      if (globalSt) {
        const cls = classes.find(c => c.id === globalSt.classId);
        if (cls) return { cls };
      }
    }
    
    return null;
  };

  const getUserClassText = (u: any) => {
    if (u.role === 'admin') return 'Ban Giám Hiệu';
    if (u.role === 'technician') return 'Kỹ thuật viên';
    if (u.role === 'teacher') return 'Giáo viên';
    
    let linkedCls = null;
    if (u.assignedClassId) {
      linkedCls = classes.find(c => c.id === u.assignedClassId);
    }
    
    if (!linkedCls) {
      const linked = getStudentForUser(u);
      if (linked) linkedCls = linked.cls;
    }

    if (u.role === 'student') {
      if (linkedCls) return `Học sinh lớp ${linkedCls.name}`;
      return 'Học sinh';
    }
    
    if (u.role === 'parent') {
      if (linkedCls) return `Phụ huynh (Lớp ${linkedCls.name})`;
      return 'Phụ huynh';
    }
    
    return 'Người dùng';
  };

  const validUsers = React.useMemo(() => {
    // Merge students from global `students` list and `classes`
    const allStudents = [...students];
    classes.forEach(cls => {
      cls.students?.forEach((st: any) => {
        if (!allStudents.some(s => s.id === st.id)) {
          allStudents.push({ ...st, classId: cls.id });
        }
      });
    });

    const list = [...users.filter(u => {
      if (u.role === 'teacher') {
        return staffs.some((s: any) => s.email === u.email);
      }
      if (u.role === 'student') {
        return allStudents.some(s => s.userId === u.id || (s.email && u.email && s.email === u.email) || (s.username && u.username && s.username === u.username));
      }
      if (u.role === 'parent') {
        return allStudents.some(s => s.id === u.linkedStudentId || (s.parentEmail && u.email && s.parentEmail === u.email));
      }
      return true;
    })];

    allStudents.forEach(st => {
      const studentExists = list.some(u => u.role === 'student' && ( (st.userId && u.id === st.userId) || (st.email && u.email === st.email) || (st.username && u.username === st.username) ));
      
      if (!studentExists) {
        list.push({
          id: st.userId || `unregistered_student_${st.id}`,
          fullName: st.fullName,
          role: 'student',
          assignedClassId: st.classId,
          isUnregistered: true // if they didn't exist in `users` list, they are fundamentally unregistered/deleted for social purposes
        });
      }

      if (st.parentName) {
        const parentExists = list.some(u => u.role === 'parent' && u.linkedStudentId === st.id);
        if (!parentExists) {
          list.push({
            id: `unregistered_parent_${st.id}`,
            fullName: st.parentName,
            role: 'parent',
            linkedStudentId: st.id,
            assignedClassId: st.classId,
            isUnregistered: true
          });
        }
      }
    });

    // Add unregistered staffs (Hồ Sơ phi hành đoàn)
    staffs.forEach(staff => {
      const staffExists = list.some(u => (u.role === 'teacher' || u.role === 'admin' || u.role === 'technician') && u.email === staff.email);
      if (!staffExists) {
        let role = 'teacher';
        if (staff.department === 'board') role = 'admin';
        else if (staff.department === 'technician') role = 'technician';
        
        list.push({
          id: `unregistered_staff_${staff.id}`,
          fullName: staff.fullName,
          email: staff.email,
          role: role,
          isUnregistered: true
        });
      }
    });

    return list.filter(u => u.id !== currentUser?.id);
  }, [users, staffs, classes, students, currentUser]);

  const directoryUsers = validUsers;
  const friendUsers = validUsers.filter(u => friends.includes(u.id));

  const safeSearch = removeAccents(searchQuery || '').toLowerCase();
  
  const matchesSearch = (u: any) => {
    if (!searchQuery) return true;
    const safeQuery = removeAccents(searchQuery.trim()).toLowerCase();
    if (!safeQuery) return true;

    const classText = removeAccents(getUserClassText(u)).toLowerCase();
    const fullName = removeAccents(u.fullName || '').toLowerCase();
    const email = removeAccents(u.email || '').toLowerCase();
    const username = removeAccents(u.username || '').toLowerCase();
    const roleText = removeAccents(u.role || '').toLowerCase();

    const queryWords = safeQuery.split(/\s+/).filter(Boolean);

    const checkText = (text: string) => {
      if (text.includes(safeQuery)) return true;
      if (queryWords.length > 0 && queryWords.every(w => text.includes(w))) return true;
      return false;
    };

    return checkText(fullName) || checkText(email) || checkText(username) || checkText(classText) || checkText(roleText);
  };

  const filteredDirectory = directoryUsers.filter(matchesSearch);
  const filteredFriends = friendUsers.filter(matchesSearch);

  const getChatPartner = (chat: any) => {
    if (chat.isGroup) return { fullName: chat.groupName, isGroup: true, groupAvatar: chat.groupAvatar };
    const partnerId = chat.participants.find((id: string) => id !== currentUser?.id);
    return users.find(u => u.id === partnerId) || { fullName: 'Người dùng ẩn' };
  };

  const handleUpdateGroupSettings = async (settings: any) => {
    if (!activeChat || activeChat.adminId !== currentUser?.id) return;
    try {
      await setDoc(doc(db, 'chats', activeChat.id), { chatSettings: settings }, { merge: true });
      showToast('Cập nhật cài đặt thành công', 'success');
      setActiveChat((prev: any) => ({ ...prev, chatSettings: settings }));
    } catch (e) {
      showToast('Có lỗi xảy ra', 'error');
    }
  };

  const handleLeaveGroup = async () => {
    if (!activeChat || !currentUser) return;
    try {
      const newParticipants = activeChat.participants.filter((p: string) => p !== currentUser.id);
      await setDoc(doc(db, 'chats', activeChat.id), { participants: newParticipants }, { merge: true });
      showToast('Đã rời nhóm', 'success');
      setActiveChat(null);
      setShowGroupInfo(false);
    } catch (e) {
      showToast('Có lỗi xảy ra', 'error');
    }
  };

  const handleDeleteGroup = async () => {
    if (!activeChat || activeChat.adminId !== currentUser?.id) return;
    try {
      // In a real app we would delete the doc and all messages, here we just clear participants or delete doc
      await setDoc(doc(db, 'chats', activeChat.id), { participants: [] }, { merge: true });
      showToast('Đã giải tán nhóm', 'success');
      setActiveChat(null);
      setShowGroupInfo(false);
    } catch (e) {
      showToast('Có lỗi xảy ra', 'error');
    }
  };

  const handleKickMember = async (memberId: string) => {
    if (!activeChat || activeChat.adminId !== currentUser?.id) return;
    try {
      const newParticipants = activeChat.participants.filter((p: string) => p !== memberId);
      await setDoc(doc(db, 'chats', activeChat.id), { participants: newParticipants }, { merge: true });
      showToast('Đã xóa thành viên', 'success');
      setActiveChat((prev: any) => ({ ...prev, participants: newParticipants }));
    } catch (e) {
      showToast('Có lỗi xảy ra', 'error');
    }
  };

  const handlePromoteDeputy = async (memberId: string) => {
    if (!activeChat || activeChat.adminId !== currentUser?.id) return;
    try {
      const newDeputies = [...(activeChat.deputyIds || []), memberId];
      await setDoc(doc(db, 'chats', activeChat.id), { deputyIds: newDeputies }, { merge: true });
      showToast('Đã bổ nhiệm phó nhóm', 'success');
      setActiveChat((prev: any) => ({ ...prev, deputyIds: newDeputies }));
    } catch (e) {
      showToast('Có lỗi xảy ra', 'error');
    }
  };

  const handleRevokeDeputy = async (memberId: string) => {
    if (!activeChat || activeChat.adminId !== currentUser?.id) return;
    try {
      const newDeputies = (activeChat.deputyIds || []).filter((id: string) => id !== memberId);
      await setDoc(doc(db, 'chats', activeChat.id), { deputyIds: newDeputies }, { merge: true });
      showToast('Đã bãi nhiệm phó nhóm', 'success');
      setActiveChat((prev: any) => ({ ...prev, deputyIds: newDeputies }));
    } catch (e) {
      showToast('Có lỗi xảy ra', 'error');
    }
  };

  const handleAddMembersToGroup = async () => {
    if (!activeChat || newMembersToAdd.length === 0) return;
    try {
      const updatedParticipants = [...new Set([...activeChat.participants, ...newMembersToAdd])];
      await setDoc(doc(db, 'chats', activeChat.id), { participants: updatedParticipants }, { merge: true });
      showToast('Đã thêm thành viên', 'success');
      setActiveChat((prev: any) => ({ ...prev, participants: updatedParticipants }));
      setNewMembersToAdd([]);
      setShowAddMembersModal(false);
    } catch (e) {
      showToast('Có lỗi xảy ra', 'error');
    }
  };

  const handleChangeGroupBackground = async (url: string) => {
    if (!activeChat) return;
    try {
      await setDoc(doc(db, 'chats', activeChat.id), { chatBackground: url }, { merge: true });
      showToast('Đã đổi nền', 'success');
      setActiveChat((prev: any) => ({ ...prev, chatBackground: url }));
    } catch (e) {
      showToast('Có lỗi xảy ra', 'error');
    }
  };

  const canSendMessage = () => {
    if (!activeChat || !activeChat.isGroup) return true;
    if (activeChat.chatSettings?.canSendMessages !== false) return true;
    return activeChat.adminId === currentUser?.id || (activeChat.deputyIds || []).includes(currentUser?.id);
  };

  return (
    <div className="flex h-[calc(100vh-9rem)] md:h-[calc(100vh-7rem)] w-full bg-white dark:bg-[#1a1a2e] rounded-none md:rounded-2xl shadow-none md:shadow-sm border-0 md:border border-slate-200 dark:border-white/10 overflow-hidden">
      {/* ===== SIDEBAR LEFT (Chat List) ===== */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-white/10 flex flex-col bg-white dark:bg-[#1a1a2e] ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        {/* Sidebar Header */}
        <div className="p-4 pb-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
                {(currentUser?.fullName || 'U').charAt(0)}
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Đoạn chat</h2>
            </div>
            <button
              onClick={() => setIsCreatingGroup(true)}
              className="w-9 h-9 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
              title="Tạo nhóm chat"
            >
              <Users className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-3">
            {[
              { key: 'chats' as const, label: 'Tin nhắn' },
              { key: 'friends' as const, label: 'Bạn bè' },
              { key: 'directory' as const, label: 'Danh bạ' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
                  activeTab === tab.key
                    ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm trên Messenger"
              value={searchQuery || ''}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-white/10 border-none rounded-full py-2.5 pl-10 pr-4 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
            />
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto">
          {searchQuery ? (
            /* Global Search Results */
            <div className="px-2 py-1 space-y-0.5">
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 py-2">Kết quả tìm kiếm</p>
              {validUsers.filter(matchesSearch).map((user, idx) => {
                const isFriend = friends.includes(user.id);
                return (
                  <div key={`${user.id}_${idx}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer transition-colors">
                    <div className="relative shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isFriend ? 'bg-gradient-to-br from-emerald-400 to-green-500 text-white' : 'bg-slate-200 dark:bg-white/15 text-slate-600 dark:text-slate-300'}`}>
                        {(user.fullName || 'U').charAt(0)}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white dark:border-[#1a1a2e] rounded-full ${isUserOnline(user.id) ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-slate-800 dark:text-white text-sm truncate">{user.fullName}</h4>
                        {isFriend && <span className="text-[9px] bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-bold uppercase">Bạn</span>}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{getUserClassText(user)}</p>
                    </div>
                    {isFriend ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleStartChat(user.id); }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0 ${user.isUnregistered ? 'text-slate-300 dark:text-slate-600 bg-slate-100 dark:bg-white/5 cursor-not-allowed' : 'text-white bg-blue-500 hover:bg-blue-600 shadow-sm shadow-blue-500/20'}`}
                        disabled={user.isUnregistered}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAddFriend(user.id); }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0 ${user.isUnregistered ? 'text-slate-300 dark:text-slate-600 bg-slate-100 dark:bg-white/5 cursor-not-allowed' : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20'}`}
                        disabled={user.isUnregistered}
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
              {validUsers.filter(matchesSearch).length === 0 && (
                <p className="text-center text-slate-400 dark:text-slate-500 text-sm py-8">Không tìm thấy "{searchQuery}"</p>
              )}
            </div>
          ) : (
            <>
              {/* CHATS TAB */}
              {activeTab === 'chats' && (
                <div className="px-2 py-1 space-y-0.5">
                  {chats.map(chat => {
                    const partner = getChatPartner(chat);
                    const isSelected = activeChat?.id === chat.id;
                    return (
                      <div
                        key={chat.id}
                        onClick={() => setActiveChat(chat)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-500/15'
                            : 'hover:bg-slate-50 dark:hover:bg-white/5'
                        }`}
                      >
                        <div className="relative shrink-0">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                            {chat.isGroup ? (
                              chat.groupAvatar ? (
                                <img src={chat.groupAvatar} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Users className="w-5 h-5" />
                              )
                            ) : (
                              <span className="text-lg">{(partner.fullName || 'U').charAt(0)}</span>
                            )}
                          </div>
                          {!chat.isGroup && (
                            <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-white dark:border-[#1a1a2e] rounded-full ${isUserOnline(partner.id) ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-semibold truncate text-[14px] ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-800 dark:text-white'}`}>
                            {partner.fullName}
                          </h4>
                          <p className="text-[13px] text-slate-500 dark:text-slate-400 truncate">{chat.lastMessage || 'Chưa có tin nhắn'}</p>
                        </div>
                        {chat.lastMessageAt && (
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 shrink-0 self-start mt-1">
                            {chat.lastMessageAt?.toDate?.()?.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) || ''}
                          </span>
                        )}
                      </div>
                    );
                  })}
                  {chats.length === 0 && (
                    <div className="text-center py-16 px-6">
                      <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-500/20 dark:to-indigo-500/20 rounded-full flex items-center justify-center mb-4">
                        <MessageSquare className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Chưa có cuộc trò chuyện nào</p>
                      <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Tìm bạn bè để bắt đầu nhắn tin</p>
                    </div>
                  )}
                </div>
              )}

              {/* DIRECTORY TAB */}
              {activeTab === 'directory' && (
                <div className="px-2 py-1 space-y-0.5">
                  <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 py-2">Danh bạ toàn trường ({filteredDirectory.length})</p>
                  {filteredDirectory.map((user, idx) => {
                    const isFriend = friends.includes(user.id);
                    return (
                      <div key={`${user.id}_${idx}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <div className="relative shrink-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isFriend ? 'bg-gradient-to-br from-emerald-400 to-green-500 text-white' : 'bg-slate-200 dark:bg-white/15 text-slate-600 dark:text-slate-300'}`}>
                            {(user.fullName || 'U').charAt(0)}
                          </div>
                          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white dark:border-[#1a1a2e] rounded-full ${isUserOnline(user.id) ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-slate-800 dark:text-white text-sm truncate">{user.fullName}</h4>
                            {isFriend && <span className="text-[9px] bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-bold uppercase">Bạn</span>}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{getUserClassText(user)}</p>
                        </div>
                        {isFriend ? (
                          <button
                            onClick={() => handleStartChat(user.id)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0 ${user.isUnregistered ? 'text-slate-300 dark:text-slate-600 bg-slate-100 dark:bg-white/5 cursor-not-allowed' : 'text-white bg-blue-500 hover:bg-blue-600 shadow-sm'}`}
                            disabled={user.isUnregistered}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAddFriend(user.id)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0 ${user.isUnregistered ? 'text-slate-300 dark:text-slate-600 bg-slate-100 dark:bg-white/5 cursor-not-allowed' : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20'}`}
                            disabled={user.isUnregistered}
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {filteredDirectory.length === 0 && (
                    <p className="text-center text-slate-400 dark:text-slate-500 text-sm py-8">Không có dữ liệu</p>
                  )}
                </div>
              )}

              {/* FRIENDS TAB */}
              {activeTab === 'friends' && (
                <div className="px-2 py-1 space-y-0.5">
                  <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 py-2">Bạn bè ({filteredFriends.length})</p>
                  {filteredFriends.map((user, idx) => (
                    <div key={`${user.id}_${idx}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white font-bold text-sm">
                          {(user.fullName || 'U').charAt(0)}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white dark:border-[#1a1a2e] rounded-full ${isUserOnline(user.id) ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-800 dark:text-white text-sm truncate">{user.fullName}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{getUserClassText(user)}</p>
                      </div>
                      <button
                        onClick={() => handleStartChat(user.id)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0 ${user.isUnregistered ? 'text-slate-300 dark:text-slate-600 bg-slate-100 dark:bg-white/5 cursor-not-allowed' : 'text-white bg-blue-500 hover:bg-blue-600 shadow-sm'}`}
                        disabled={user.isUnregistered}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {filteredFriends.length === 0 && (
                    <div className="text-center py-10 px-6">
                      <p className="text-slate-400 dark:text-slate-500 text-sm">Chưa có bạn bè. <span className="text-blue-500 dark:text-blue-400 cursor-pointer font-medium hover:underline" onClick={() => setActiveTab('directory')}>Tìm bạn bè mới</span></p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ===== MAIN CHAT AREA ===== */}
      <div
        className={`flex-1 flex flex-col relative bg-slate-50 dark:bg-[#0f0f23] ${!activeChat ? 'hidden md:flex' : 'flex'}`}
        style={activeChat?.chatBackground ? {
          backgroundImage: `url(${activeChat.chatBackground})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat'
        } : undefined}
      >
        {activeChat?.chatBackground && <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-[2px] z-0"></div>}
        <div className="flex-1 flex flex-col z-10 overflow-hidden">
        {activeChat ? (
          <>
            {/* ---- Chat Header ---- */}
            <div className="h-[64px] border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a2e] flex items-center justify-between px-4 shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveChat(null)}
                  className="p-2 -ml-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full md:hidden transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                    {getChatPartner(activeChat).isGroup ? (
                      getChatPartner(activeChat).groupAvatar ? (
                        <img src={getChatPartner(activeChat).groupAvatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-5 h-5" />
                      )
                    ) : (
                      (getChatPartner(activeChat).fullName || 'U').charAt(0)
                    )}
                  </div>
                  {!getChatPartner(activeChat).isGroup && (
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-white dark:border-[#1a1a2e] rounded-full ${isUserOnline(getChatPartner(activeChat).id) ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-[15px] leading-tight">{getChatPartner(activeChat).fullName}</h3>
                  <p className="text-[12px] leading-tight mt-0.5">
                    {getChatPartner(activeChat).isGroup ? (
                      <span className="text-slate-500 dark:text-slate-400">{activeChat.participants.length} thành viên</span>
                    ) : (
                      isUserOnline(getChatPartner(activeChat).id) ? (
                        <span className="text-emerald-500 dark:text-emerald-400 flex items-center gap-1 font-medium">
                          <span className="w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full inline-block"></span> Đang hoạt động
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-550 flex items-center gap-1 font-medium">
                          <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full inline-block"></span> Ngoại tuyến
                        </span>
                      )
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="w-9 h-9 text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-full flex items-center justify-center transition-colors">
                  <Search className="w-[18px] h-[18px]" />
                </button>
                <button onClick={() => setShowGroupInfo(!showGroupInfo)} className="w-9 h-9 text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-full flex items-center justify-center transition-colors">
                  <MoreVertical className="w-[18px] h-[18px]" />
                </button>
              </div>
            </div>

            {/* ---- Chat Messages ---- */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 relative">
              {messages.map((msg, index) => {
                const isMe = msg.senderId === currentUser?.id;
                const showAvatar = !isMe && (index === 0 || messages[index - 1].senderId !== msg.senderId);
                const isLastInGroup = index === messages.length - 1 || messages[index + 1]?.senderId !== msg.senderId;
                const senderUser = !isMe && activeChat?.isGroup ? (users.find(u => u.id === msg.senderId) || currentUser) : null;

                return (
                  <div key={msg.id} className={`flex gap-2 ${isMe ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-3' : 'mt-0.5'}`}>
                    {/* Avatar (only for received, last in group) */}
                    {!isMe && isLastInGroup ? (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center text-white text-[11px] font-bold shrink-0 self-end mb-5">
                        {(senderUser?.fullName || getChatPartner(activeChat).fullName || 'U').charAt(0)}
                      </div>
                    ) : !isMe ? (
                      <div className="w-7 shrink-0"></div>
                    ) : null}

                    <div className={`max-w-[70%] md:max-w-[55%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      {/* Sender name in group chats */}
                      {!isMe && showAvatar && activeChat?.isGroup && senderUser && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-1 px-3">{senderUser.fullName}</p>
                      )}

                      {/* Image message */}
                      {msg.type === 'image' && msg.fileUrl && (
                        <div className="rounded-2xl overflow-hidden mb-0.5 shadow-sm max-w-[280px]">
                          <img src={msg.fileUrl} alt="" className="w-full h-auto max-h-64 object-cover" />
                        </div>
                      )}

                      {/* Audio message */}
                      {msg.type === 'audio' && msg.fileUrl && (
                        <div className={`px-3 py-2 rounded-full mb-0.5 ${isMe ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' : 'bg-slate-200 dark:bg-white/15 text-slate-800 dark:text-slate-200'}`}>
                          <audio src={msg.fileUrl} controls className="h-8 max-w-[200px]" />
                        </div>
                      )}

                      {/* File message */}
                      {msg.type === 'file' && msg.fileUrl && (
                        <a href={msg.fileUrl} download={msg.fileName} target="_blank" rel="noreferrer"
                          className={`flex items-center gap-3 px-4 py-3 rounded-2xl mb-0.5 hover:opacity-90 transition-opacity ${
                            isMe ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' : 'bg-slate-200 dark:bg-white/15 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${isMe ? 'bg-white/20' : 'bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'}`}>
                            <File className="w-4 h-4" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="font-medium text-sm truncate">{msg.fileName}</p>
                            <p className={`text-[11px] ${isMe ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>Nhấn để tải</p>
                          </div>
                        </a>
                      )}

                      {/* Text message bubble */}
                      {msg.text && (
                        <div className={`px-4 py-2 shadow-sm ${
                          isMe
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-[20px] rounded-br-md'
                            : 'bg-slate-200 dark:bg-white/15 text-slate-800 dark:text-slate-100 rounded-[20px] rounded-bl-md'
                        }`}>
                          <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        </div>
                      )}

                      {/* Timestamp */}
                      {isLastInGroup && (
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 px-2 flex items-center gap-1">
                          {msg.createdAt?.toDate?.()?.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                          {isMe && <CheckCheck className="w-3 h-3 text-blue-400 dark:text-blue-300" />}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {/* Typing Indicator Bubble */}
              {getTypingText() && (
                <div className="flex gap-3 items-end mt-2 mb-2 px-2">
                  {!currentChatInfo.isGroup && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0 mb-1 overflow-hidden">
                      {getChatPartner(activeChat).avatarUrl ? (
                        <img src={getChatPartner(activeChat).avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        (getChatPartner(activeChat).fullName || 'U').charAt(0)
                      )}
                    </div>
                  )}
                  {currentChatInfo.isGroup && <div className="w-8 shrink-0"></div>}
                  
                  <div className="flex flex-col items-start max-w-[70%]">
                    {currentChatInfo.isGroup && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 mb-0.5 ml-1">
                        {getTypingText()}
                      </span>
                    )}
                    <div className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200 rounded-bl-sm shadow-sm flex items-center gap-1.5">
                      {!currentChatInfo.isGroup && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 mr-1">{getTypingText()}</span>
                      )}
                      {/* Bouncing Dots */}
                      <span className="flex gap-1 items-center h-2">
                        <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ---- Chat Input Bar ---- */}
            <div className="px-3 py-3 bg-white dark:bg-[#1a1a2e] border-t border-slate-100 dark:border-white/5 shrink-0">
              {canSendMessage() ? (
                <div className="flex items-end gap-2">
                  {/* Attachment buttons */}
                  <div className="flex gap-0.5 shrink-0 pb-1">
                    <label className="w-9 h-9 text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-full cursor-pointer transition-colors flex items-center justify-center">
                      <ImageIcon className="w-5 h-5" />
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} />
                    </label>
                    <label className="w-9 h-9 text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-full cursor-pointer transition-colors flex items-center justify-center">
                      <Paperclip className="w-5 h-5" />
                      <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'file')} />
                    </label>
                  </div>

                  {/* Text Input */}
                  <div className="flex-1 bg-slate-100 dark:bg-white/10 rounded-full relative focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                    <textarea
                      value={newMessage || ''}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleUserTyping();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage('text', newMessage);
                        }
                      }}
                      placeholder="Aa"
                      className="w-full bg-transparent border-none rounded-full py-2.5 px-4 max-h-24 min-h-[40px] resize-none focus:outline-none text-base md:text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      rows={1}
                    />
                  </div>

                  {/* Send / Mic button */}
                  <div className="shrink-0 pb-1">
                    {newMessage.trim() ? (
                      <button
                        onClick={() => sendMessage('text', newMessage)}
                        className="w-9 h-9 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full flex items-center justify-center transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 active:scale-95"
                      >
                        <Send className="w-4 h-4 ml-0.5" />
                      </button>
                    ) : (
                      <button
                        onClick={toggleRecording}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                          isRecording
                            ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
                            : 'text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10'
                        }`}
                      >
                        <Mic className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-2 text-slate-400 dark:text-slate-500 text-sm italic">
                  Chỉ quản trị viên mới có thể gửi tin nhắn.
                </div>
              )}
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-500/20 dark:to-indigo-500/20 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-blue-500/10">
              <MessagesSquare className="w-10 h-10 text-blue-500 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Chào mừng đến Messenger!</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-xs text-sm leading-relaxed">
              Chọn một cuộc trò chuyện hoặc tìm bạn bè mới để bắt đầu nhắn tin. Gửi ảnh, file và ghi âm dễ dàng.
            </p>
          </div>
        )}
        </div>
      </div>

      {/* ===== GROUP/DM INFO SIDEBAR ===== */}
      {showGroupInfo && activeChat && (
        <div className="w-full md:w-80 lg:w-96 absolute md:relative inset-0 md:inset-auto z-40 bg-white dark:bg-[#1a1a2e] flex flex-col border-l border-slate-200 dark:border-white/10 shrink-0 h-full">
          {/* Sidebar Header with Back Button */}
          <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center gap-3 bg-white dark:bg-[#1a1a2e] shrink-0">
            <button 
              onClick={() => setShowGroupInfo(false)} 
              className="p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-full flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-semibold md:hidden">Quay lại</span>
            </button>
            <h3 className="font-bold text-slate-800 dark:text-white text-base truncate">
              {activeChat.isGroup ? 'Chi tiết nhóm' : 'Thông tin chi tiết'}
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeChat.isGroup ? (
              <>
                {/* Group Header */}
                <div className="p-6 border-b border-slate-100 dark:border-white/5 flex flex-col items-center bg-slate-50/50 dark:bg-white/5">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center mb-3 shadow-lg">
                    {activeChat.groupAvatar ? (
                      <img src={activeChat.groupAvatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white text-center">{activeChat.groupName}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{activeChat.participants?.length || 0} thành viên</p>
                </div>

                {/* Admin Settings */}
                {activeChat.adminId === currentUser?.id && (
                  <div className="p-4 border-b border-slate-100 dark:border-white/5">
                    <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-1">Cài đặt nhóm</h4>
                    <div className="space-y-2">
                      <label className="flex items-center justify-between p-2.5 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl cursor-pointer transition-colors">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Khóa trò chuyện</span>
                        <input type="checkbox" checked={activeChat.chatSettings?.canSendMessages === false} onChange={(e) => handleUpdateGroupSettings({ ...activeChat.chatSettings, canSendMessages: !e.target.checked })} className="w-4 h-4 rounded text-blue-600" />
                      </label>
                      <label className="flex items-center justify-between p-2.5 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl cursor-pointer transition-colors">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Thành viên mới đọc lịch sử</span>
                        <input type="checkbox" checked={activeChat.chatSettings?.newMembersCanReadHistory !== false} onChange={(e) => handleUpdateGroupSettings({ ...activeChat.chatSettings, newMembersCanReadHistory: e.target.checked })} className="w-4 h-4 rounded text-blue-600" />
                      </label>
                      <label className="flex items-center justify-between p-2.5 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl cursor-pointer transition-colors">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Đổi thông tin nhóm</span>
                        <input type="checkbox" checked={activeChat.chatSettings?.canChangeGroupInfo !== false} onChange={(e) => handleUpdateGroupSettings({ ...activeChat.chatSettings, canChangeGroupInfo: e.target.checked })} className="w-4 h-4 rounded text-blue-600" />
                      </label>
                    </div>
                  </div>
                )}

                {/* Members List */}
                <div className="p-4 border-b border-slate-100 dark:border-white/5">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Thành viên ({activeChat.participants?.length})</h4>
                    {(activeChat.adminId === currentUser?.id || (activeChat.deputyIds || []).includes(currentUser?.id)) && (
                      <button onClick={() => setShowAddMembersModal(true)} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 px-2 py-1 rounded-lg transition-colors">
                        + Thêm
                      </button>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    {activeChat.participants?.map((pid: string) => {
                      const u = users.find(x => x.id === pid) || (currentUser?.id === pid ? currentUser : null);
                      if (!u) return null;
                      const isAdmin = activeChat.adminId === pid;
                      const isDeputy = (activeChat.deputyIds || []).includes(pid);
                      const isMe = pid === currentUser?.id;

                      return (
                        <div key={pid} className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl group transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700 flex flex-shrink-0 items-center justify-center text-white font-bold text-xs">
                              {(u.fullName || 'U').charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                                {u.fullName} {isMe && <span className="text-slate-400 dark:text-slate-500 font-normal">(Bạn)</span>}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                {isAdmin && <span className="text-blue-600 dark:text-blue-400 font-semibold">Trưởng nhóm</span>}
                                {isDeputy && <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Phó nhóm</span>}
                                {!isAdmin && !isDeputy && u.role}
                              </p>
                            </div>
                          </div>

                          {activeChat.adminId === currentUser?.id && !isMe && (
                            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                              {!isDeputy ? (
                                <button onClick={() => handlePromoteDeputy(pid)} className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg" title="Phong phó nhóm"><UserCheck className="w-3.5 h-3.5" /></button>
                              ) : (
                                <button onClick={() => handleRevokeDeputy(pid)} className="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg" title="Hủy phó nhóm"><UserCheck className="w-3.5 h-3.5" /></button>
                              )}
                              <button onClick={() => { if(window.confirm('Xóa thành viên này?')) handleKickMember(pid); }} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg" title="Đuổi khỏi nhóm"><X className="w-3.5 h-3.5" /></button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* DM Partner Header */}
                {(() => {
                  const partner = getChatPartner(activeChat);
                  const isPartnerStudent = students.some(s => s.userId === partner.id || s.id === partner.id || (partner.email && s.parentEmail === partner.email));
                  return (
                    <div className="p-6 border-b border-slate-100 dark:border-white/5 flex flex-col items-center bg-slate-50/50 dark:bg-white/5">
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center mb-3 shadow-lg">
                        {partner.avatarUrl ? (
                          <img src={partner.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white font-bold text-2xl">{(partner.fullName || 'U').charAt(0)}</span>
                        )}
                      </div>
                      <h2 className="text-lg font-bold text-slate-800 dark:text-white text-center">{partner.fullName}</h2>
                      <p className="text-xs text-indigo-650 dark:text-indigo-400 mt-1 uppercase font-semibold tracking-wider">{partner.role || 'Thành viên'}</p>
                      {partner.email && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{partner.email}</p>
                      )}
                      
                      {/* Direct Profile Access button */}
                      {isPartnerStudent && (
                        <button
                          onClick={() => {
                            const pStudent = students.find(s => s.userId === partner.id || s.id === partner.id);
                            if (pStudent) {
                              setShowGroupInfo(false);
                              navigate(`/ho-so-hoc-sinh/${pStudent.id}`);
                            }
                          }}
                          className="mt-4 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                        >
                          <UserSquare2 className="w-3.5 h-3.5" /> Xem hồ sơ học sinh
                        </button>
                      )}
                    </div>
                  );
                })()}
              </>
            )}

            {/* Background Settings (DMs and Groups both!) */}
            <div className="p-4 border-b border-slate-100 dark:border-white/5">
              <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-1">Hình nền cuộc trò chuyện</h4>
              <div className="grid grid-cols-4 gap-2">
                {[
                  '',
                  'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=300&auto=format&fit=crop',
                  'https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=300&auto=format&fit=crop',
                  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=300&auto=format&fit=crop'
                ].map((bg, idx) => (
                  <button key={idx} onClick={() => handleChangeGroupBackground(bg)}
                    className="w-full aspect-square rounded-xl border-2 border-transparent hover:border-blue-500 overflow-hidden transition-colors"
                    style={bg ? { backgroundImage: `url(${bg})`, backgroundPosition: 'center', backgroundSize: 'cover' } : { backgroundColor: 'rgb(241,245,249)' }}
                  />
                ))}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="p-4 space-y-2 pb-20">
              {activeChat.isGroup ? (
                <>
                  <button
                    onClick={() => { if(window.confirm('Rời nhóm này?')) handleLeaveGroup(); }}
                    className="w-full py-2.5 text-red-500 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors text-sm"
                  >
                    Rời nhóm
                  </button>
                  {activeChat.adminId === currentUser?.id && (
                    <button
                      onClick={() => { if(window.confirm('Giải tán nhóm? Không thể hoàn tác.')) handleDeleteGroup(); }}
                      className="w-full py-2.5 text-red-500 dark:text-red-400 font-bold bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-xl transition-colors text-sm"
                    >
                      Giải tán nhóm
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={async () => {
                    if(window.confirm('Bạn có chắc chắn muốn xóa cuộc trò chuyện này?')) {
                      try {
                        await deleteDoc(doc(db, 'chats', activeChat.id));
                        showToast('Đã xóa cuộc trò chuyện', 'success');
                        setActiveChat(null);
                        setShowGroupInfo(false);
                      } catch(e) {
                        showToast('Có lỗi xảy ra', 'error');
                      }
                    }
                  }}
                  className="w-full py-2.5 text-red-500 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors text-sm"
                >
                  Xóa cuộc trò chuyện
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== ADD MEMBERS MODAL ===== */}
      <AnimatePresence>
        {showAddMembersModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1a1a2e] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10"
            >
              <div className="p-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 dark:text-white text-lg">Thêm thành viên</h3>
                <button onClick={() => { setShowAddMembersModal(false); setNewMembersToAdd([]); }} className="w-8 h-8 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4">
                <div className="max-h-60 overflow-y-auto space-y-1 border border-slate-200 dark:border-white/10 rounded-xl p-2 bg-slate-50 dark:bg-white/5 mb-4">
                  {friendUsers.filter(f => !activeChat?.participants?.includes(f.id)).length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">Tất cả bạn bè đã ở trong nhóm.</p>
                  ) : (
                    friendUsers.filter(f => !activeChat?.participants?.includes(f.id)).map(f => (
                      <label key={f.id} className="flex items-center gap-3 p-2 hover:bg-white dark:hover:bg-white/10 rounded-xl cursor-pointer transition-colors">
                        <input type="checkbox" className="w-4 h-4 rounded text-blue-500" checked={newMembersToAdd.includes(f.id)} onChange={(e) => { if (e.target.checked) setNewMembersToAdd(prev => [...prev, f.id]); else setNewMembersToAdd(prev => prev.filter(id => id !== f.id)); }} />
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {(f.fullName || 'U').charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-800 dark:text-white text-sm truncate">{f.fullName}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{f.email || f.username}</p>
                        </div>
                      </label>
                    ))
                  )}
                </div>
                <button onClick={handleAddMembersToGroup} disabled={newMembersToAdd.length === 0}
                  className="w-full py-3 bg-blue-500 disabled:bg-slate-300 dark:disabled:bg-white/10 hover:bg-blue-600 text-white rounded-xl font-bold transition-colors">
                  Xác nhận ({newMembersToAdd.length})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===== CREATE GROUP MODAL ===== */}
      <AnimatePresence>
        {isCreatingGroup && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1a1a2e] rounded-2xl p-6 shadow-2xl max-w-md w-full border border-slate-200 dark:border-white/10"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Tạo nhóm mới</h3>
                <button onClick={() => setIsCreatingGroup(false)} className="w-8 h-8 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tên nhóm</label>
                  <input type="text" value={groupName || ''} onChange={e => setGroupName(e.target.value)} placeholder="Nhập tên nhóm..."
                    className="w-full bg-slate-100 dark:bg-white/10 border-none rounded-xl px-4 py-3 text-base md:text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Ảnh đại diện</label>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-white/10 border-2 border-dashed border-slate-300 dark:border-white/20 flex items-center justify-center overflow-hidden">
                      {groupAvatar ? <img src={groupAvatar} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 text-slate-400 dark:text-slate-500" />}
                    </div>
                    <label className="px-4 py-2 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/15 rounded-xl cursor-pointer transition-colors text-sm font-medium">
                      Tải ảnh lên
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => { setGroupAvatar(reader.result as string); showToast('Tải ảnh thành công', 'success'); }; reader.readAsDataURL(file); } }} />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Thêm thành viên ({selectedFriends.length})</label>
                  <div className="max-h-48 overflow-y-auto space-y-1 border border-slate-200 dark:border-white/10 rounded-xl p-2 bg-slate-50 dark:bg-white/5">
                    {friendUsers.length === 0 ? (
                      <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">Chưa có bạn bè.</p>
                    ) : (
                      friendUsers.map(f => (
                        <label key={f.id} className="flex items-center gap-3 p-2 hover:bg-white dark:hover:bg-white/10 rounded-xl cursor-pointer transition-colors">
                          <input type="checkbox" className="w-4 h-4 rounded text-blue-500" checked={selectedFriends.includes(f.id)} onChange={(e) => { if (e.target.checked) setSelectedFriends(prev => [...prev, f.id]); else setSelectedFriends(prev => prev.filter(id => id !== f.id)); }} />
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {(f.fullName || 'U').charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-800 dark:text-white text-sm truncate">{f.fullName}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{f.email || f.username}</p>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                <button onClick={handleCreateGroup} disabled={!groupName.trim() || selectedFriends.length === 0}
                  className="w-full py-3 bg-blue-500 disabled:bg-slate-300 dark:disabled:bg-white/10 hover:bg-blue-600 text-white rounded-xl font-bold transition-colors">
                  Tạo nhóm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
