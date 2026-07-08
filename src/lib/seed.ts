import { collection, doc, writeBatch, getDocs, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export async function seedDatabase() {
  const batch = writeBatch(db);
  let hasChanges = false;

  // 1. Seed admin, teacher, technician, and default school if missing
  const adminRef = doc(db, 'users', 'admin1');
  const adminSnap = await getDoc(adminRef);
  if (!adminSnap.exists() || !adminSnap.data().schoolId) {
    batch.set(adminRef, { 
      id: 'admin1', 
      email: 'admin@school.edu.vn', 
      role: 'admin', 
      fullName: 'Ban Giám Hiệu', 
      username: 'admin', 
      schoolId: 'school_default' 
    }, { merge: true });
    hasChanges = true;
  }

  const teacherRef = doc(db, 'users', 'teacher1');
  const teacherSnap = await getDoc(teacherRef);
  if (!teacherSnap.exists() || !teacherSnap.data().schoolId) {
    batch.set(teacherRef, { 
      id: 'teacher1', 
      email: 'maiphuong@school.edu.vn', 
      role: 'teacher', 
      fullName: 'Cô Mai Phương', 
      subject: 'Toán học', 
      username: 'maiphuong', 
      schoolId: 'school_default' 
    }, { merge: true });
    hasChanges = true;
  }

  const techRef = doc(db, 'users', 'technician');
  const techSnap = await getDoc(techRef);
  if (!techSnap.exists()) {
    batch.set(techRef, { 
      id: 'technician', 
      username: 'technician', 
      password: 'techpassword', 
      role: 'technician', 
      fullName: 'Kỹ thuật viên Hệ thống' 
    }, { merge: true });
    hasChanges = true;
  }

  const tech2Ref = doc(db, 'users', 'technician2');
  const tech2Snap = await getDoc(tech2Ref);
  if (!tech2Snap.exists()) {
    batch.set(tech2Ref, { 
      id: 'technician2', 
      username: 'kythuatvien@school.edu.vn', 
      email: 'kythuatvien@school.edu.vn',
      password: '123456', 
      role: 'technician', 
      fullName: 'Kỹ thuật viên' 
    }, { merge: true });
    hasChanges = true;
  }

  const schoolRef = doc(db, 'users', 'school_default');
  const schoolSnap = await getDoc(schoolRef);
  if (!schoolSnap.exists()) {
    batch.set(schoolRef, { 
      id: 'school_default', 
      username: 'demo_school', 
      password: 'school123', 
      role: 'school', 
      fullName: 'Trường THCS Quảng Phú Cầu', 
      region: 'Xã Ứng Thiên, Huyện Ứng Hòa, TP. Hà Nội', 
      schoolId: 'school_default' 
    }, { merge: true });
    hasChanges = true;
  }

  // 2. Seed student users for testing
  const stdUserRef = doc(db, 'users', 'user_student1');
  const stdUserSnap = await getDoc(stdUserRef);
  if (!stdUserSnap.exists()) {
    batch.set(stdUserRef, {
      id: 'user_student1',
      username: 'hs001',
      password: 'password123',
      role: 'student',
      fullName: 'Nguyễn Văn A',
      assignedClassId: 'cls_1',
      schoolId: 'school_default',
      coins: 100
    }, { merge: true });
    hasChanges = true;
  }

  const stdProfileRef = doc(db, 'students', 'student1');
  const stdProfileSnap = await getDoc(stdProfileRef);
  if (!stdProfileSnap.exists()) {
    batch.set(stdProfileRef, {
      id: 'student1',
      fullName: 'Nguyễn Văn A',
      dob: '15/05/2011',
      classId: 'cls_1',
      achievements: ['Học sinh giỏi'],
      trainingScore: 95,
      certificates: [],
      userId: 'user_student1',
      schoolId: 'school_default'
    }, { merge: true });
    hasChanges = true;
  }

  // 3. Check if classes exist
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
        schoolId: 'school_default',
        students: [
          { id: 'student1', code: 'HS001', fullName: 'Nguyễn Văn A', points: 95, achievements: ['Học sinh giỏi'], gender: 'Nam', dob: '15/05/2011', schoolId: 'school_default' },
          { id: 'student2', code: 'HS002', fullName: 'Lê Thị B', points: 88, achievements: ['Sao đỏ'], gender: 'Nữ', dob: '22/07/2011', schoolId: 'school_default' }
        ]
      },
      {
        id: 'cls_2',
        name: 'Lớp 8B',
        grade: 'Khối 8',
        academicYear: '2025-2026',
        teacher: 'Thầy Hữu Phước',
        room: 'Phòng 105',
        schoolId: 'school_default',
        students: [
          { id: 'student3', code: 'HS003', fullName: 'Trần Văn C', points: 70, achievements: [], gender: 'Nam', dob: '03/09/2012', schoolId: 'school_default' }
        ]
      }
    ];
    classes.forEach(c => {
      const ref = doc(db, 'classes', c.id);
      batch.set(ref, c);
    });
    hasChanges = true;
  }

  // 4. Rooms
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
