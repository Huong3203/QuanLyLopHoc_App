import { AntDesign } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { FlatList, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../config/supabaseClient';
 
type Course = {
  id: string;
  title: string;
  description?: string;
  created_at?: string;
  join_count?: number; // Số người tham gia
};

type Material = {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'link';
  uploaded_at: string;
  description?: string;
  url?: string;
};

export default function CourseDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { courseId } = route.params;

  const [course, setCourse] = useState<Course | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filter, setFilter] = useState<'all' | 'pdf' | 'video' | 'link'>('all');

  useEffect(() => {
    fetchCourseDetail();
    fetchMaterials();
  }, [courseId]);

  // Lấy chi tiết khóa học và đếm số người tham gia 
  const fetchCourseDetail = async () => {
    // Lấy thông tin khóa học
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (error || !data) return;

    // Đếm số bản ghi trong bảng 'join' có course_id tương ứng
    const { count, error: countError } = await supabase
      .from('join')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId);

    // Lưu vào state
    setCourse({
      id: data.id,
      title: data.title,
      description: data.description,
      created_at: data.created_at,
      join_count: count || 0,
    });
  };

  // Lấy danh sách tài liệu
  const fetchMaterials = async () => {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('course_id', courseId)
      .order('uploaded_at', { ascending: false });

    if (!error) setMaterials(data as Material[]);
  };

  // Xử lý khi mở liên kết
  const handleOpenURL = (url?: string) => {
    if (url) Linking.openURL(url).catch(() => alert('Không mở được liên kết'));
  };

  // Render mỗi tài liệu
  const renderItem = ({ item }: { item: Material }) => (
    <View style={styles.materialCard}>
      {/* Nút "Xem" ở góc phải */}
      {item.url && (
        <TouchableOpacity
          onPress={() => handleOpenURL(item.url)}
          style={styles.viewButton}
        >
          <Text style={styles.viewButtonText}>Xem</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.materialTitle}>{item.title}</Text>
      <Text style={styles.materialType}>Loại: {item.type.toUpperCase()}</Text>
      {item.description && (
        <Text style={styles.materialDesc}>Mô tả: {item.description}</Text>
      )}
      <Text style={styles.materialDate}>
        Ngày tải: {new Date(item.uploaded_at).toLocaleDateString('vi-VN')}
      </Text>
    </View>
  );

  //Lọc tài liệu theo loại 
  const filteredMaterials =
    filter === 'all'
      ? materials
      : materials.filter((m) => m.type === filter);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name="arrowleft" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết môn học</Text>
      </View>

      {/* Thông tin môn học */}
      {course && (
        <View style={styles.courseInfo}>
          <Text style={styles.courseTitle}>{course.title}</Text>
          {course.description && <Text style={styles.courseDesc}>{course.description}</Text>}
          <Text style={styles.courseMeta}>
            Ngày tạo: {new Date(course.created_at || '').toLocaleDateString('vi-VN')}
          </Text>
          <View style={styles.joinRow}>
            <AntDesign name="addusergroup" size={16} color="#7C3AED" />
            <Text style={styles.joinText}>{course.join_count || 0} người tham gia</Text>
          </View>
          <View style={styles.joinRow}>
            <AntDesign name="filetext1" size={16} color="#6366F1" />
            <Text style={styles.joinText}>{materials.length} tài liệu đã tải</Text>
          </View>
        </View>
      )}

      {/* Bộ lọc loại tài liệu */}
      <View style={styles.filterRow}>
        {['all', 'pdf', 'video', 'link'].map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.filterButton, filter === t && styles.filterButtonActive]}
            onPress={() => setFilter(t as any)}
          >
            <Text
              style={[styles.filterButtonText, filter === t && styles.filterButtonTextActive]}
            >
              {t === 'all' ? 'Tất cả' : t.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Danh sách tài liệu */}
      <FlatList
        data={filteredMaterials}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>Chưa có tài liệu nào.</Text>}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  courseInfo: {
    marginBottom: 16,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    borderColor: '#E5E7EB',
    borderWidth: 1,
  },
  courseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  courseDesc: {
    marginTop: 6,
    color: '#374151',
  },
  courseMeta: {
    marginTop: 6,
    fontSize: 13,
    color: '#6B7280',
  },
  joinRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  joinText: {
    marginLeft: 6,
    color: '#7C3AED',
    fontWeight: '500',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  filterButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  filterButtonActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  filterButtonText: {
    color: '#111827',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  materialCard: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  viewButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 1,
  },
  viewButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  materialTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#111827',
    paddingRight: 60,
  },
  materialType: {
    color: '#6B7280',
    marginTop: 4,
  },
  materialDesc: {
    marginTop: 4,
    color: '#4B5563',
  },
  materialDate: {
    marginTop: 4,
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#9CA3AF',
  },
});
