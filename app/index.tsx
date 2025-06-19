import { router } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Index() {
  const { user } = useAuth();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (user) {
        if (user.role === 'student') {
          router.replace('/student/CourseList');
        } else if (user.role === 'instructor') {
          router.replace('/instructor/ManageCourses');
        }
      } else {
        router.replace('/login');
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [user]);

  return null;
}
