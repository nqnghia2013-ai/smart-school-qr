const fs = require('fs');
let code = fs.readFileSync('src/lib/seed.ts', 'utf8');

const oldCheck = `  const usersRef = collection(db, 'users');
  const snap = await getDocs(usersRef);
  
  if (!snap.empty) {
    return; // Database is already seeded
  }

  const batch = writeBatch(db);

  // 1. Seed Users
  const users = [`;

const newCheck = `  const batch = writeBatch(db);

  // 1. Seed Users
  const usersSnap = await getDocs(collection(db, 'users'));
  if (usersSnap.empty) {
    const users = [
      { id: 'admin1', email: 'admin@school.edu.vn', role: 'admin', fullName: 'Ban Giám Hiệu', username: 'admin' },
      { id: 'teacher1', email: 'maiphuong@school.edu.vn', role: 'teacher', fullName: 'Cô Mai Phương', subject: 'Toán học', username: 'maiphuong' },
      { id: 'student1', email: 'nguyenvanA@school.edu.vn', role: 'student', fullName: 'Nguyễn Văn A', classId: 'cls_1', username: 'nva01' },
      { id: 'student2', email: 'lethib@school.edu.vn', role: 'student', fullName: 'Lê Thị B', classId: 'cls_1', username: 'ltb02' },
    ];
    users.forEach(u => {
      const ref = doc(db, 'users', u.id);
      batch.set(ref, u);
    });
  } else {
    // Ensure admin and teacher exist even if students were imported
    const adminRef = doc(db, 'users', 'admin1');
    batch.set(adminRef, { email: 'admin@school.edu.vn', role: 'admin', fullName: 'Ban Giám Hiệu', username: 'admin' }, { merge: true });
    const teacherRef = doc(db, 'users', 'teacher1');
    batch.set(teacherRef, { email: 'maiphuong@school.edu.vn', role: 'teacher', fullName: 'Cô Mai Phương', subject: 'Toán học', username: 'maiphuong' }, { merge: true });
  }

  // 2. Seed Classes
  const classesSnap = await getDocs(collection(db, 'classes'));
  if (classesSnap.empty) {
    const classes = [
      {
        id: 'cls_1',
        name: 'Lớp 9A',
        grade: 'Khối 9',
        academicYear: '2025-2026',
        teacher: 'Cô Mai Phương',
        room: 'Phòng 201',
        students: [
          { id: 'student1', code: 'HS001', fullName: 'Nguyễn Văn A', points: 95, achievements: ['Học sinh giỏi'], gender: 'Nam', dob: '15/05/2011' },
          { id: 'student2', code: 'HS002', fullName: 'Lê Thị B', points: 88, achievements: ['Sao đỏ'], gender: 'Nữ', dob: '22/07/2011' }
        ]
      },
      {
        id: 'cls_2',
        name: 'Lớp 8B',
        grade: 'Khối 8',
        academicYear: '2025-2026',
        teacher: 'Thầy Hữu Phước',
        room: 'Phòng 105',
        students: [
          { id: 'student3', code: 'HS003', fullName: 'Trần Văn C', points: 70, achievements: [], gender: 'Nam', dob: '03/09/2012' }
        ]
      }
    ];
    classes.forEach(c => {
      const ref = doc(db, 'classes', c.id);
      batch.set(ref, c);
    });
  }

  // 3. Seed Rooms
  const roomsSnap = await getDocs(collection(db, 'rooms'));
  if (roomsSnap.empty) {
    const rooms = [`;

code = code.replace(oldCheck, newCheck);

const search2 = `  // 2. Seed Classes
  const classes = [`;
// Since we already replaced this block as part of oldCheck above, wait!
// The previous replace might not match everything. Let's be careful.`;
