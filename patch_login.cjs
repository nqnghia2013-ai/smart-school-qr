const fs = require('fs');
let code = fs.readFileSync('src/pages/Login.tsx', 'utf8');

const oldGoogleLogin = `  const handleGoogleLogin = async () => {
    try {
      setError('');
      setIsLoading(true);
      const user = await signInWithGoogle();
      if (user && user.email) {
        let foundUser = users.find(u => u.email === user.email);
            
        if (!foundUser) {
          const role = (user.email === 'workspacegamer1@gmail.com' || user.email === 'nqnghia2013@gmail.com') ? 'admin' : 'student';
          const newUser = {
            email: user.email,
            fullName: user.displayName || user.email.split('@')[0],
            role: role as any
          };
          const id = addUser(newUser);
          login({ ...newUser, id });
        } else {
          login(foundUser);
        }
        navigate('/');
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Không thể đăng nhập bằng Google.');
    } finally {
      setIsLoading(false);
    }
  };`;

const newGoogleLogin = `  const handleGoogleLogin = async () => {
    try {
      setError('');
      setIsLoading(true);
      const user = await signInWithGoogle();
      if (user && user.email) {
        // Query Firestore directly to avoid race conditions with context state
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        const { db } = await import('../lib/firebase');
        const q = query(collection(db, 'users'), where('email', '==', user.email));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          const role = (user.email === 'workspacegamer1@gmail.com' || user.email === 'nqnghia2013@gmail.com') ? 'admin' : 'student';
          const newUser = {
            email: user.email,
            fullName: user.displayName || user.email.split('@')[0],
            role: role as any
          };
          const id = addUser(newUser);
          login({ ...newUser, id });
        } else {
          const doc = querySnapshot.docs[0];
          login({ id: doc.id, ...doc.data() } as any);
        }
        navigate('/');
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Không thể đăng nhập bằng Google.');
    } finally {
      setIsLoading(false);
    }
  };`;

code = code.replace(oldGoogleLogin, newGoogleLogin);

fs.writeFileSync('src/pages/Login.tsx', code);
