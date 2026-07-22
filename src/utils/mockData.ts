import { useAuthStore } from '../store/authStore';
import { useClassStore } from '../store/classStore';
import { useLessonStore } from '../store/lessonStore';
import { useNotificationStore } from '../store/notificationStore';

export const seedMockData = () => {
  const authStore = useAuthStore.getState();
  const classStore = useClassStore.getState();
  const lessonStore = useLessonStore.getState();
  const notificationStore = useNotificationStore.getState();

  // Only seed if empty
  if (classStore.classes.length === 0) {
    const classNames = ['10A1', '10A2', '11A1', '12A1'];
    
    classNames.forEach((name, idx) => {
      classStore.addClass({
        id: `class-${idx}`,
        name,
        students: Array.from({ length: 5 }).map((_, i) => ({
          id: `student-${idx}-${i}`,
          name: `Học sinh ${idx * 5 + i + 1}`,
          xp: Math.floor(Math.random() * 1000),
          level: Math.floor(Math.random() * 5) + 1,
          badges: ['Tân binh'],
        })),
        assignments: [],
      });
    });
  }

  if (lessonStore.lessons.length === 0) {
    lessonStore.addLesson({
      id: 'lesson-1',
      title: 'Khí quyển và Hoàn lưu khí quyển',
      grade: '10',
      topic: 'Địa lí tự nhiên',
      authorId: 'teacher-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      blocks: [
        {
          id: 'b1',
          type: 'title',
          content: { title: 'Hoàn lưu khí quyển', grade: '10', topic: 'Khí quyển' },
        },
        {
          id: 'b2',
          type: '3d-sim',
          content: { simId: 'wind-pressure' },
        }
      ],
    });
  }

  if (!authStore.user) {
    authStore.login({
      id: 'teacher-1',
      name: 'Nguyễn Thị Hoài Thu',
      email: 'hoaithu@geohub.edu.vn',
      role: 'teacher',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Thu',
      xp: 360,
      level: 3,
    });
  }

  if (notificationStore.notifications.length === 0) {
    notificationStore.addNotification({
      title: 'Chào mừng đến với GeoHub',
      message: 'Hệ thống đã cập nhật các tính năng mới cho năm học 2026-2027.',
      type: 'info',
    });
  }
};
