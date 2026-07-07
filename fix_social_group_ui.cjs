const fs = require('fs');
let code = fs.readFileSync('src/pages/SocialNetwork.tsx', 'utf8');

const groupInfoUI = `
      {/* Group Info Sidebar */}
      {showGroupInfo && activeChat && activeChat.isGroup && (
        <div className="w-full md:w-80 lg:w-96 border-l border-slate-200 bg-white flex flex-col z-20 shrink-0 shadow-[-10px_0_15px_-10px_rgba(0,0,0,0.05)]">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
            <h3 className="font-bold text-slate-800">Thông tin nhóm</h3>
            <button onClick={() => setShowGroupInfo(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {/* Group Header */}
            <div className="p-6 border-b border-slate-100 flex flex-col items-center">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center overflow-hidden mb-4 shadow-sm border-4 border-white">
                {activeChat.groupAvatar ? (
                  <img src={activeChat.groupAvatar} alt="Group" className="w-full h-full object-cover" />
                ) : (
                  <Users className="w-10 h-10 text-indigo-500" />
                )}
              </div>
              <h2 className="text-xl font-black text-slate-800 text-center">{activeChat.groupName}</h2>
              <p className="text-sm text-slate-500 mt-1">{activeChat.participants?.length || 0} thành viên</p>
            </div>

            {/* Admin Settings (Only for Admin) */}
            {activeChat.adminId === currentUser?.id && (
              <div className="p-4 border-b border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Cài đặt trưởng nhóm</h4>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                    <span className="text-sm font-medium text-slate-700">Khóa trò chuyện (chỉ quản trị viên gửi tin)</span>
                    <input
                      type="checkbox"
                      checked={activeChat.chatSettings?.canSendMessages === false}
                      onChange={(e) => handleUpdateGroupSettings({ ...activeChat.chatSettings, canSendMessages: !e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                  </label>
                  <label className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                    <span className="text-sm font-medium text-slate-700">Thành viên mới đọc lịch sử</span>
                    <input
                      type="checkbox"
                      checked={activeChat.chatSettings?.newMembersCanReadHistory !== false}
                      onChange={(e) => handleUpdateGroupSettings({ ...activeChat.chatSettings, newMembersCanReadHistory: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                  </label>
                  <label className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                    <span className="text-sm font-medium text-slate-700">Đổi thông tin nhóm</span>
                    <input
                      type="checkbox"
                      checked={activeChat.chatSettings?.canChangeGroupInfo !== false}
                      onChange={(e) => handleUpdateGroupSettings({ ...activeChat.chatSettings, canChangeGroupInfo: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Members List */}
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center justify-between mb-4 px-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thành viên ({activeChat.participants?.length})</h4>
                {(activeChat.adminId === currentUser?.id || (activeChat.deputyIds || []).includes(currentUser?.id)) && (
                  <button onClick={() => setShowAddMembersModal(true)} className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded-md transition-colors">
                    + Thêm
                  </button>
                )}
              </div>
              <div className="space-y-1">
                {activeChat.participants?.map((pid: string) => {
                  const u = users.find(x => x.id === pid) || (currentUser?.id === pid ? currentUser : null);
                  if (!u) return null;
                  const isAdmin = activeChat.adminId === pid;
                  const isDeputy = (activeChat.deputyIds || []).includes(pid);
                  const isMe = pid === currentUser?.id;
                  
                  return (
                    <div key={pid} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl group transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex flex-shrink-0 items-center justify-center text-slate-600 font-bold text-sm">
                          {(u.fullName || 'U').charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">
                            {u.fullName} {isMe && '(Bạn)'}
                          </p>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            {isAdmin && <span className="text-blue-600 font-semibold">Trưởng nhóm</span>}
                            {isDeputy && <span className="text-emerald-600 font-semibold">Phó nhóm</span>}
                            {!isAdmin && !isDeputy && u.role}
                          </p>
                        </div>
                      </div>
                      
                      {activeChat.adminId === currentUser?.id && !isMe && (
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                          {!isDeputy ? (
                            <button onClick={() => handlePromoteDeputy(pid)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Phong phó nhóm">
                              <UserCheck className="w-4 h-4" />
                            </button>
                          ) : (
                            <button onClick={() => handleRevokeDeputy(pid)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg" title="Hủy phó nhóm">
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => {
                            if(window.confirm('Bạn có chắc chắn muốn xóa thành viên này?')) handleKickMember(pid);
                          }} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="Đuổi khỏi nhóm">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="p-4 space-y-2">
              <button
                onClick={() => {
                  if(window.confirm('Bạn có chắc chắn muốn rời nhóm này?')) handleLeaveGroup();
                }}
                className="w-full py-3 text-red-600 font-bold hover:bg-red-50 rounded-xl transition-colors text-sm text-left px-4"
              >
                Rời nhóm
              </button>
              
              {activeChat.adminId === currentUser?.id && (
                <button
                  onClick={() => {
                    if(window.confirm('Bạn có chắc chắn muốn giải tán nhóm này? Hành động này không thể hoàn tác.')) handleDeleteGroup();
                  }}
                  className="w-full py-3 text-red-600 font-bold bg-red-50 hover:bg-red-100 rounded-xl transition-colors text-sm text-center"
                >
                  Giải tán nhóm
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Members Modal */}
      <AnimatePresence>
        {showAddMembersModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-lg">Thêm thành viên</h3>
                <button onClick={() => { setShowAddMembersModal(false); setNewMembersToAdd([]); }} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-2 bg-slate-50 mb-4">
                  {friendUsers.filter(f => !activeChat?.participants?.includes(f.id)).length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">Tất cả bạn bè đã ở trong nhóm.</p>
                  ) : (
                    friendUsers.filter(f => !activeChat?.participants?.includes(f.id)).map(f => (
                      <label key={f.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-200">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded text-blue-500 border-slate-300"
                          checked={newMembersToAdd.includes(f.id)}
                          onChange={(e) => {
                            if (e.target.checked) setNewMembersToAdd(prev => [...prev, f.id]);
                            else setNewMembersToAdd(prev => prev.filter(id => id !== f.id));
                          }}
                        />
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
                          {(f.fullName || 'U').charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-800 text-sm truncate">{f.fullName}</h4>
                          <p className="text-xs text-slate-500">{f.email || f.username}</p>
                        </div>
                      </label>
                    ))
                  )}
                </div>
                <button
                  onClick={handleAddMembersToGroup}
                  disabled={newMembersToAdd.length === 0}
                  className="w-full py-3 bg-blue-600 disabled:bg-slate-300 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors"
                >
                  Xác nhận thêm ({newMembersToAdd.length})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
`;

code = code.replace("      </div>\n        \n      {/* Create Group Modal */}", groupInfoUI + "\n      </div>\n        \n      {/* Create Group Modal */}");

fs.writeFileSync('src/pages/SocialNetwork.tsx', code);
