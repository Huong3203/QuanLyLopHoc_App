import { Provider as AntdProvider } from '@ant-design/react-native';
import { Slot } from 'expo-router'; 
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
