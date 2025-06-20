import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs 
    screenOptions={{
        headerShown: false, 
      }}>
      
      <Tabs.Screen
        name="ManageCourses"
        options={{
          title: 'Khóa học',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
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
        name="AddMaterial"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="CourseDetail"
        options={{
          href: null, 
        }}
      />

    </Tabs>
  );
}
