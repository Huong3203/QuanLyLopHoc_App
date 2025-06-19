import { Card, Text, WhiteSpace, WingBlank } from '@ant-design/react-native';
import { AntDesign, Feather, Fontisto, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { supabase } from '../../config/supabaseClient';

type Profile = {
  id: string;
  full_name: string;
  role: 'student' | 'instructor';
  created_at: string;
  birth_year?: string | number | null;
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Không thể lấy user:', userError?.message);
        return;
      }

      setEmail(user.email || null);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Lỗi khi lấy profile:', error.message);
      } else {
        setProfile(data);
      }

      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Lỗi đăng xuất', error.message);
    } else {
      router.replace('/login');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.emptyContainer}>
        <Text>Không tìm thấy thông tin tài khoản.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WingBlank size="lg">
        <WhiteSpace size="lg" />
        <Card full style={styles.card}>
          <Card.Header
            title={<Text style={styles.headerTitle}>Thông Tin Cá Nhân</Text>}
          />
          <Card.Body>
            <WhiteSpace size="lg" />

            <View style={styles.infoRow}>
              <AntDesign name="user" size={18} color="#6B7280" style={styles.icon} />
              <Text style={styles.label}>Họ tên:</Text>
              <Text style={styles.value}>{profile.full_name || 'Chưa cập nhật'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Fontisto name="email" size={18} color="#6B7280" style={styles.icon} />
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{email}</Text>
            </View>

            <View style={styles.infoRow}>
              <Feather name="shield" size={18} color="#6B7280" style={styles.icon} />
              <Text style={styles.label}>Vai trò:</Text>
              <Text style={styles.value}>
                {profile.role === 'instructor' ? 'Giảng viên' : 'Sinh viên'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Fontisto name="date" size={18} color="#6B7280" style={styles.icon} />
              <Text style={styles.label}>Ngày tạo:</Text>
              <Text style={styles.value}>
                {new Date(profile.created_at).toLocaleString('vi-VN')}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="calendar"
                size={18}
                color="#6B7280"
                style={styles.icon}
              />
              <Text style={styles.label}>Năm sinh:</Text>
              <Text style={styles.value}>
                {profile.birth_year || 'Chưa cập nhật'}
              </Text>
            </View>

            <WhiteSpace size="lg" />
          </Card.Body>
        </Card>

        <WhiteSpace size="xl" />

        <View style={styles.logoutButton}>
          <MaterialCommunityIcons name="logout" size={20} color="#fff" />
          <Text style={styles.logoutText} onPress={handleLogout}>
            Đăng xuất
          </Text>
        </View>

        <WhiteSpace size="lg" />
      </WingBlank>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  emptyContainer: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderColor: '#E5E7EB',
    borderWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937'
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontSize: 18,
    color: '#6B7280',
    marginRight: 4,
    minWidth: 80,
  },
  value: {
    fontSize: 17,
    color: '#111827',
    fontWeight: '500',
    flexShrink: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#7C3AED',
    borderRadius: 8,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
    paddingLeft: 6,
  },
});
