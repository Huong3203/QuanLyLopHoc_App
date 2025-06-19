import { MaterialIcons } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
        headerShown: false, // ✅ Ẩn header trên toàn bộ tabs
      }}
      >
      
      <Tabs.Screen
        name="CourseList"
        options={{
          title: 'Khóa học',
          tabBarIcon: ({ color, size }) => (
            <Feather name="list" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Tài khoản',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="CourseDetails"
        options={{
          href: null, // ✅ Không hiển thị tab này trong thanh điều hướng
        }}
/>

    </Tabs>
    
  );
}
