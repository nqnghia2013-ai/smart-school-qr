const fs = require('fs');
let code = fs.readFileSync('src/pages/SocialNetwork.tsx', 'utf8');

const functionsCode = `
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
`;

code = code.replace("  return (", functionsCode + "\n  return (");
fs.writeFileSync('src/pages/SocialNetwork.tsx', code);
