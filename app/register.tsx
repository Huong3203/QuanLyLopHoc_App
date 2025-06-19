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
  confirmPassword: string;
  full_name: string;
  birth_year: string;
};

const PRIMARY_COLOR = '#7C3AED';

export default function RegisterScreen() {
  const { control, handleSubmit, watch } = useForm<FormData>();
  const router = useRouter();
  const password = watch('password');

  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('Thông báo', message);
    }
  };

const onSubmit = async ({ email, password, confirmPassword, full_name, birth_year }: FormData) => {
  if (password !== confirmPassword) {
    showToast('Mật khẩu xác nhận không khớp.');
    return;
  }

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });

  if (signUpError) {
    showToast('Đăng ký thất bại: ' + signUpError.message);
    return;
  }

  let userId = signUpData.user?.id;
  if (!userId) {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      showToast('Không thể lấy thông tin người dùng.');
      return;
    }
    userId = userData.user.id;
  }

  // 👉 Kiểm tra user đã có trong profiles chưa
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single();

  if (!existingProfile) {
    // Chỉ insert nếu chưa tồn tại
    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      full_name,
      birth_year: parseInt(birth_year),
      role: 'student',
    });

    if (profileError) {
      showToast('Lỗi lưu thông tin cá nhân: ' + profileError.message);
      return;
    }
  }

  showToast('Đăng ký thành công!');
  setTimeout(() => {
    router.replace('/login');
  }, 500);
};


  return (
    <View style={styles.container}>
      <View style={styles.iconRow}>
        <View style={styles.line} />
        <AntDesign name="user" size={60} color={PRIMARY_COLOR} />
        <View style={styles.line} />
      </View>

      <Text style={styles.title}>Đăng Ký</Text>
      <Text style={styles.subtitle}>Lớp Học Trực Tuyến</Text>

      <View style={styles.card}>
        <WingBlank>

          {/* Họ tên */}
          <View style={styles.inputWrapper}>
            <FontAwesome5 name="user" size={18} color="#9CA3AF" style={styles.inputIcon} />
            <Controller
              name="full_name"
              control={control}
              defaultValue=""
              rules={{ required: 'Vui lòng nhập họ tên' }}
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="Họ và tên"
                  value={value}
                  onChangeText={onChange}
                  style={styles.input}
                  inputStyle={{ backgroundColor: 'transparent' }}
                />
              )}
            />
          </View>

          {/* Năm sinh */}
          <View style={styles.inputWrapper}>
            <FontAwesome5 name="calendar" size={18} color="#9CA3AF" style={styles.inputIcon} />
            <Controller
              name="birth_year"
              control={control}
              defaultValue=""
              rules={{ required: 'Vui lòng nhập năm sinh' }}
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="Năm sinh (VD: 2000)"
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                  style={styles.input}
                  inputStyle={{ backgroundColor: 'transparent' }}
                />
              )}
            />
          </View>

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

          {/* Mật khẩu */}
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
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  style={styles.input}
                  inputStyle={{ backgroundColor: 'transparent' }}
                />
              )}
            />
          </View>

          {/* Xác nhận mật khẩu */}
          <View style={styles.inputWrapper}>
            <FontAwesome5 name="lock" size={18} color="#9CA3AF" style={styles.inputIcon} />
            <Controller
              name="confirmPassword"
              control={control}
              defaultValue=""
              rules={{ required: 'Vui lòng xác nhận mật khẩu' }}
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="Xác nhận mật khẩu"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  style={styles.input}
                  inputStyle={{ backgroundColor: 'transparent' }}
                />
              )}
            />
          </View>

          <WhiteSpace size="lg" />

          <Button style={styles.button} onPress={handleSubmit(onSubmit)}>
            <Text style={styles.buttonText}>Đăng Ký</Text>
          </Button>

          <WhiteSpace size="lg" />

          <Text style={styles.orText}>hoặc</Text>

          <TouchableOpacity onPress={() => router.replace('/login')}>
            <Text style={styles.registerText}>Đã có tài khoản? Đăng nhập</Text>
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
    justifyContent: 'center',
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 20,
  },
  card: {
    marginHorizontal: 24,
    marginTop: 10,
    paddingVertical: 30,
    paddingHorizontal: 22,
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
    paddingVertical: 8,
    backgroundColor: '#fff',
    marginBottom: 14,
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
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  orText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginVertical: 12,
    fontSize: 13,
  },
  registerText: {
    textAlign: 'center',
    color: PRIMARY_COLOR,
    fontWeight: '600',
    fontSize: 15,
  },
});
