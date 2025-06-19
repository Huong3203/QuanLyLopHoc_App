import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../config/supabaseClient';

type Course = {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  created_at: string;
  instructor_name: string;
  joined: boolean;
};

export default function CourseList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'joined'>('all');
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data?.user?.id || null);
    };
    fetchUser();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);

    const { data: courseData, error } = await supabase
      .from('courses')
      .select('id, title, description, instructor_id, created_at, profiles(full_name)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Lỗi lấy courses:', error.message);
      setLoading(false);
      return;
    }

    let joinedIds: string[] = [];
    if (userId) {
      const { data: joinedData } = await supabase
        .from('join')
        .select('course_id')
        .eq('student_id', userId);

      joinedIds = joinedData?.map((j) => j.course_id) || [];
    }

    const formatted: Course[] = (courseData || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      instructor_id: item.instructor_id,
      created_at: item.created_at,
      instructor_name: item.profiles?.full_name || 'Chưa rõ',
      joined: joinedIds.includes(item.id),
    }));

    const filtered =
      filterType === 'joined'
        ? formatted.filter((c) => c.joined)
        : formatted;

    setCourses(filtered);
    setLoading(false);
  };

  useEffect(() => {
    if (userId) fetchCourses();
  }, [userId, filterType]);

  const handleJoin = async (courseId: string) => {
    if (!userId) {
      Alert.alert('Lỗi', 'Không xác định được người dùng.');
      return;
    }

    const { data: existing } = await supabase
      .from('join')
      .select('*')
      .eq('student_id', userId)
      .eq('course_id', courseId)
      .limit(1);

    if (existing && existing.length > 0) {
      Alert.alert('Thông báo', 'Bạn đã tham gia khóa học này.');
      return;
    }

    const { error } = await supabase.from('join').insert({
      student_id: userId,
      course_id: courseId,
      joined_at: new Date().toISOString(),
    });

    if (error) {
      Alert.alert('Lỗi', 'Không thể tham gia khóa học.');
    } else {
      Alert.alert('Thành công', 'Bạn đã tham gia khóa học.');
      fetchCourses();
    }
  };

  const renderCourse = ({ item }: { item: Course }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('CourseDetails', { courseId: item.id })}
      style={styles.courseBox}
      activeOpacity={0.9}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.courseTitle}>{item.title}</Text>
        {item.joined ? (
          <Text style={styles.joinedText}>Đã tham gia</Text>
        ) : (
          <TouchableOpacity
            onPress={() => handleJoin(item.id)}
            style={styles.joinButton}
          >
            <Text style={styles.joinButtonText}>Tham gia</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text numberOfLines={2} style={styles.courseDescription}>
        {item.description}
      </Text>
      <Text style={styles.instructorText}>Giảng viên: {item.instructor_name}</Text>
      <Text style={styles.dateText}>
        Ngày tạo: {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Danh Sách Khóa Học</Text>

      {/* Ô tìm kiếm */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm môn học..."
          placeholderTextColor="#aaa"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {/* Nút lọc */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterType === 'all' && styles.activeButton,
          ]}
          onPress={() => setFilterType('all')}
        >
          <Text
            style={[
              styles.buttonText,
              filterType === 'all' ? styles.activeText : styles.inactiveText,
            ]}
          >
            Tất cả
          </Text>
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity
          style={[
            styles.filterButton,
            filterType === 'joined' && styles.activeButton,
          ]}
          onPress={() => setFilterType('joined')}
        >
          <Text
            style={[
              styles.buttonText,
              filterType === 'joined' ? styles.activeText : styles.inactiveText,
            ]}
          >
            Đã tham gia
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={{ marginTop: 10 }}>Đang tải...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCourses}
          renderItem={renderCourse}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    color: '#111827',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  buttonRow: {
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginBottom: 12,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeButton: {
    backgroundColor: '#7C3AED',
  },
  separator: {
    width: 1,
    backgroundColor: '#D1D5DB',
  },
  buttonText: {
    fontWeight: 'bold',
  },
  activeText: {
    color: '#fff',
  },
  inactiveText: {
    color: '#1F2937',
  },
  courseBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#7C3AED',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  courseDescription: {
    color: '#4B5563',
    marginTop: 6,
    marginBottom: 6,
  },
  instructorText: {
    color: '#374151',
    fontSize: 14,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  joinButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  joinedText: {
    color: '#7C3AED',
    fontStyle: 'italic',
    fontSize: 13,
    fontWeight: '500',
  },
});
