import { Button, Input, WhiteSpace, WingBlank } from '@ant-design/react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Fontisto from '@expo/vector-icons/Fontisto';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Platform, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from 'react-native';
import { supabase } from '../config/supabaseClient';

type FormData = {
  email: string;
  password: string;
};

const PRIMARY_COLOR = '#7C3AED'; 



export default function LoginScreen() {
  const { control, handleSubmit } = useForm<FormData>();
  const router = useRouter();

  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('Thông báo', message);
    }
  };

  const onSubmit = async ({ email, password }: FormData) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        showToast('Email hoặc mật khẩu không đúng.');
      } else {
        showToast('Đăng nhập thất bại: ' + error.message);
      }
      return;
    }

    const { data: userData, error: roleError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (roleError || !userData) {
      showToast('Không tìm thấy vai trò người dùng.');
      return;
    }

    showToast('Đăng nhập thành công!');
    const role = userData.role;

    setTimeout(() => {
      if (role === 'student') {
        router.replace('/student/CourseList');
      } else if (role === 'instructor') {
        router.replace('/instructor/ManageCourses');
      } else {
        showToast('Không xác định được vai trò người dùng.');
      }
    }, 300);
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconRow}>
        <View style={styles.line} />
        <AntDesign name="user" size={60} color={PRIMARY_COLOR} />
        <View style={styles.line} />
      </View>

      <Text style={styles.title}>Đăng Nhập</Text>
      <Text style={styles.subtitle}>Lớp Học Trực Tuyến</Text>

      <View style={styles.card}>
        <WingBlank>
          {/* Email */}
          <View style={styles.inputWrapper}>
            <Fontisto name="email" size={18} color="#9CA3AF" style={styles.inputIcon} />
            <Controller
              name="email"
              control={control}
              defaultValue=""
              rules={{ required: 'Vui lòng nhập email' }}
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="Email"
                  value={value}
                  onChangeText={onChange}
                  style={styles.input}
                  inputStyle={{ backgroundColor: 'transparent' }}
                />
              )}
            />
          </View>

          <WhiteSpace size="lg" />

          {/* Password */}
          <View style={styles.inputWrapper}>
            <FontAwesome5 name="lock" size={18} color="#9CA3AF" style={styles.inputIcon} />
            <Controller
              name="password"
              control={control}
              defaultValue=""
              rules={{ required: 'Vui lòng nhập mật khẩu' }}
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="Mật khẩu"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                  style={styles.input}
                  inputStyle={{ backgroundColor: 'transparent' }}
                />
              )}
            />
          </View>

          <WhiteSpace size="lg" />

          <Button style={styles.button} onPress={handleSubmit(onSubmit)}>
            Đăng Nhập
          </Button>

          <WhiteSpace size="lg" />

          <Text style={styles.orText}>hoặc</Text>

          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={styles.registerText}>Chưa có tài khoản? Đăng ký ngay</Text>
          </TouchableOpacity>
        </WingBlank>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    justifyContent: 'flex-start',
    paddingTop: 130,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  line: {
    height: 1,
    backgroundColor: '#D1D5DB',
    flex: 1,
    marginHorizontal: 10,
  },
  title: {
    fontSize: 26,
    textAlign: 'center',
    fontWeight: '700',
    color: PRIMARY_COLOR,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 18, //giảm margin một chút cho tự nhiên hơn
  },
  card: {
    marginHorizontal: 24,
    marginTop: 40, //tạo khoảng cách giữa subtitle và khung
    paddingVertical: 32, //tăng padding
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6, // 👈 tăng chiều cao input
    backgroundColor: '#fff',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  button: {
    borderRadius: 10,
    height: 48,
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
  },
  orText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginVertical: 14,
    fontSize: 13,
  },
  registerText: {
    textAlign: 'center',
    color: PRIMARY_COLOR,
    fontWeight: '600',
    fontSize: 15,
  },
});

