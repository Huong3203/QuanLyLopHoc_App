import { Button, InputItem, Modal, Toast, WhiteSpace } from '@ant-design/react-native';
import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { FlatList, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../config/supabaseClient';

type Course = {
  id: string;
  title: string;
  description?: string;
  created_at?: string;
  join_count?: number;
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

  // Modal sửa tài liệu
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    fetchCourseDetail();
    fetchMaterials();
  }, [courseId]);

  const fetchCourseDetail = async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (error || !data) return;

    const { count } = await supabase
      .from('join')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId);

    setCourse({
      id: data.id,
      title: data.title,
      description: data.description,
      created_at: data.created_at,
      join_count: count || 0,
    });
  };

  const fetchMaterials = async () => {
    const { data } = await supabase
      .from('materials')
      .select('*')
      .eq('course_id', courseId)
      .order('uploaded_at', { ascending: false });

    if (data) setMaterials(data as Material[]);
  };

  const handleOpenURL = (url?: string) => {
    if (url) Linking.openURL(url).catch(() => Toast.fail('Không mở được liên kết'));
  };

  const handleDeleteMaterial = async (id: string) => {
    Modal.alert('Xác nhận xóa', 'Bạn có chắc muốn xóa tài liệu này?', [
      { text: 'Hủy' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('materials').delete().eq('id', id);
          if (!error) {
            Toast.success('Đã xóa');
            fetchMaterials();
          } else Toast.fail('Lỗi khi xóa');
        },
      },
    ]);
  };

  const openEditModal = (material: Material) => {
    setEditingMaterialId(material.id);
    setEditTitle(material.title);
    setEditDescription(material.description || '');
    setEditModalVisible(true);
  };

  const handleSaveEditMaterial = async () => {
    if (!editTitle.trim() || !editingMaterialId) {
      Toast.info('Vui lòng nhập tiêu đề');
      return;
    }

    const { error } = await supabase
      .from('materials')
      .update({
        title: editTitle,
        description: editDescription,
      })
      .eq('id', editingMaterialId);

    if (!error) {
      Toast.success('Đã cập nhật');
      setEditModalVisible(false);
      fetchMaterials();
    } else {
      Toast.fail('Cập nhật thất bại');
    }
  };

  const filteredMaterials =
    filter === 'all' ? materials : materials.filter((m) => m.type === filter);

  const renderItem = ({ item }: { item: Material }) => (
    <View style={styles.materialCard}>
      <View style={styles.materialTopRow}>
        <Text style={styles.materialTitle}>{item.title}</Text>
        <View style={styles.actionIcons}>
          {item.url && (
            <TouchableOpacity onPress={() => handleOpenURL(item.url)}>
              <AntDesign name="eye" size={18} color="#2563EB" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => openEditModal(item)}>
            <Feather name="edit" size={18} color="#6B7280" style={styles.iconSpacing} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteMaterial(item.id)}>
            <MaterialIcons name="delete" size={20} color="#EF4444" style={styles.iconSpacing} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.materialType}>Loại: {item.type.toUpperCase()}</Text>
      {item.description && <Text style={styles.materialDesc}>Mô tả: {item.description}</Text>}
      <Text style={styles.materialDate}>
        Ngày tải: {new Date(item.uploaded_at).toLocaleDateString('vi-VN')}
      </Text>
    </View>
  );

  const EditMaterialModal = () => (
    <Modal
      popup
      visible={isEditModalVisible}
      animationType="slide-up"
      onClose={() => setEditModalVisible(false)}
      maskClosable
    >
      <ScrollView style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Chỉnh sửa Tài Liệu</Text>

        <InputItem clear placeholder="Tiêu đề" value={editTitle} onChange={setEditTitle}>
          Tiêu đề
        </InputItem>

        <InputItem
          clear
          placeholder="Mô tả (tùy chọn)"
          value={editDescription}
          onChange={setEditDescription}
        >
          Mô tả
        </InputItem>

        <WhiteSpace />
        <Button type="primary" onPress={handleSaveEditMaterial} style={styles.purpleButton}>
          Cập nhật
        </Button>
        <WhiteSpace />
        <Button onPress={() => setEditModalVisible(false)}>Hủy</Button>
      </ScrollView>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name="arrowleft" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết môn học</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddMaterial', { courseId })}
          style={styles.addButton}
        >
          <AntDesign name="pluscircleo" size={22} color="#7C3AED" />
        </TouchableOpacity>
      </View>

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

      <View style={styles.filterRow}>
        {['all', 'pdf', 'video', 'link'].map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.filterButton, filter === t && styles.filterButtonActive]}
            onPress={() => setFilter(t as any)}
          >
            <Text style={[styles.filterButtonText, filter === t && styles.filterButtonTextActive]}>
              {t === 'all' ? 'Tất cả' : t.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredMaterials}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>Chưa có tài liệu nào.</Text>}
        contentContainerStyle={{ paddingBottom: 40 }}
      />

      {EditMaterialModal()}
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
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  addButton: {
    padding: 4,
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
  },
  materialTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  materialTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  actionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconSpacing: {
    marginLeft: 12,
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
  modalContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
    color: '#111827',
  },
  purpleButton: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
});
