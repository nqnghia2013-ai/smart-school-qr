const fs = require('fs');

const newCode = `import { collection, doc, writeBatch, getDocs, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export async function seedDatabase() {
  const batch = writeBatch(db);
  let hasChanges = false;

  // 1. Seed admin and teacher if missing
  const adminRef = doc(db, 'users', 'admin1');
  const adminSnap = await getDoc(adminRef);
  if (!adminSnap.exists()) {
    batch.set(adminRef, { id: 'admin1', email: 'admin@school.edu.vn', role: 'admin', fullName: 'Ban Giám Hiệu', username: 'admin' }, { merge: true });
    hasChanges = true;
  }

  const teacherRef = doc(db, 'users', 'teacher1');
  const teacherSnap = await getDoc(teacherRef);
  if (!teacherSnap.exists()) {
    batch.set(teacherRef, { id: 'teacher1', email: 'maiphuong@school.edu.vn', role: 'teacher', fullName: 'Cô Mai Phương', subject: 'Toán học', username: 'maiphuong' }, { merge: true });
    hasChanges = true;
  }

  // 2. Check if classes exist
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
    hasChanges = true;
  }

  // 3. Rooms
  const roomsSnap = await getDocs(collection(db, 'rooms'));
  if (roomsSnap.empty) {
    const rooms = [
      { id: 'room_1', name: 'Phòng Lab Hóa Học', department: 'Khoa Học Tự Nhiên', capacity: 40, status: 'available', equipments: ['Kính hiển vi', 'Bồn rửa hóa chất', 'Tủ sấy'], manager: '1' },
      { id: 'room_2', name: 'Phòng Tin Học Số 1', department: 'Công Nghệ Thông Tin', capacity: 45, status: 'in_use', equipments: ['Máy tính bàn x45', 'Máy chiếu', 'Bảng thông minh'], manager: '2' }
    ];
    rooms.forEach(r => batch.set(doc(db, 'rooms', r.id), r));
    hasChanges = true;
  }

  if (hasChanges) {
    await batch.commit();
  }
}
`;

fs.writeFileSync('src/lib/seed.ts', newCode);
