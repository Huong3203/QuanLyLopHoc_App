import { Provider as AntdProvider } from '@ant-design/react-native';
import { Slot } from 'expo-router'; // hoặc NavigationContainer nếu bạn không dùng expo-router
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AntdProvider>
        <Slot />
      </AntdProvider>
    </SafeAreaProvider>
  );
}


// hiện thanh header với expo-router và antd-mobile
// import { Provider as AntdProvider } from '@ant-design/react-native';
// import { Stack } from 'expo-router';
// import { SafeAreaProvider } from 'react-native-safe-area-context';

// export default function Layout() {
//   return (
//     <SafeAreaProvider>
//       <AntdProvider>
//         <Stack
//           screenOptions={{
//             headerStyle: { backgroundColor: '#7C3AED' },
//             headerTintColor: '#fff',
//             headerTitleStyle: { fontWeight: 'bold' },
//           }}
//         />
//       </AntdProvider>
//     </SafeAreaProvider>
//   );
// }
