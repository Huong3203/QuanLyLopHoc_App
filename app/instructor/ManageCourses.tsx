import { Button, InputItem, Modal, Toast, WhiteSpace} from '@ant-design/react-native';
import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import { supabase } from '../../config/supabaseClient';

type Course = {
  id: string;
  title: string;
  description?: string;
  created_at?: string;
  material_count?: number;
  join_count?: number;
};

export default function CourseManager() {
  const navigation = useNavigation<any>();
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [isEditMode, setEditMode] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from('courses')
      .select(`*, materials(count), course_students:join(count)`)
      .order('created_at', { ascending: false });

    if (error) return Toast.fail('Không thể tải môn học');
    const mapped: Course[] = data.map((c: any) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      created_at: c.created_at,
      material_count: c.materials?.count || 0,
      join_count: c.course_students?.count || 0,
    }));
    setCourses(mapped);
  };

  const handleDeleteCourse = (id: string) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa môn học này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.from('courses').delete().eq('id', id);
            if (error) Toast.fail('Xóa thất bại');
            else {
              Toast.success('Đã xóa');
              fetchCourses();
            }
          },
        },
      ]
    );
  };

  const handleSaveCourse = async () => {
    if (!title.trim()) return Toast.info('Vui lòng nhập tên môn học');

    if (isEditMode && editingCourseId) {
      await supabase.from('courses').update({ title, description }).eq('id', editingCourseId);
      Toast.success('Đã cập nhật');
    } else {
      await supabase.from('courses').insert({
        title,
        description,
        created_at: new Date().toISOString(),
      });
      Toast.success('Đã thêm');
    }

    resetModal();
    fetchCourses();
  };

  const resetModal = () => {
    setTitle('');
    setDescription('');
    setEditMode(false);
    setEditingCourseId(null);
    setModalVisible(false);
  };

  const renderItem = ({ item }: { item: Course }) => (
    <TouchableOpacity
      style={styles.itemBox}
      onPress={() => navigation.navigate('CourseDetail', { courseId: item.id })}
    >
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <View style={styles.iconRow}>
          <TouchableOpacity
            onPress={() => {
              setEditMode(true);
              setTitle(item.title);
              setDescription(item.description || '');
              setEditingCourseId(item.id);
              setModalVisible(true);
            }}
          >
            <Feather name="edit" size={22} color="#4B5563" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteCourse(item.id)}>
            <MaterialIcons name="delete" size={26} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      {item.description ? <Text style={styles.itemDesc}>Mô tả: {item.description}</Text> : null}

      <View style={styles.metaCol}>
        <View style={styles.row}>
          <AntDesign name="filetext1" size={16} color="#6D28D9" />
          <Text style={styles.metaText}>{item.material_count || 0} tài liệu</Text>
        </View>
        <View style={[styles.row, { marginTop: 4 }]}>
          <AntDesign name="addusergroup" size={16} color="#10B981" />
          <Text style={styles.metaText}>{item.join_count || 0} người tham gia</Text>
        </View>
        <Text style={styles.dateText}>
          Ngày tạo: {item.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN') : ''}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.addMaterialButton}
        onPress={() => navigation.navigate('AddMaterial', { courseId: item.id })}
      >
        <Text style={styles.addMaterialText}>+ Tài liệu</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const CourseModal = () => (
    <Modal
      popup
      visible={isModalVisible}
      animationType="slide-up"
      onClose={resetModal}
      maskClosable
    >
      <ScrollView style={styles.modalContainer}>
        <Text style={styles.modalTitle}>{isEditMode ? 'Chỉnh sửa' : 'Thêm'} Môn Học</Text>

        <InputItem clear placeholder="Tên môn học" value={title} onChange={setTitle}>
          Tên
        </InputItem>

        <InputItem clear placeholder="Mô tả (tùy chọn)" value={description} onChange={setDescription}>
          Mô tả
        </InputItem>

        <WhiteSpace />
        <Button type="primary" onPress={handleSaveCourse} style={styles.purpleButton}>
          {isEditMode ? 'Cập nhật' : 'Lưu'}
        </Button>
        <WhiteSpace />
        <Button onPress={resetModal}>Hủy</Button>
      </ScrollView>
    </Modal>
  );

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Danh sách môn học</Text>

      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm môn học..."
          placeholderTextColor="#aaa"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>+ Môn học</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredCourses}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>Chưa có môn học nào.</Text>}
      />

      {CourseModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
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
  addButton: {
    marginLeft: 8,
    backgroundColor: '#7C3AED',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  itemBox: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    flex: 1,
    color: '#111827',
  },
  itemDesc: {
    marginTop: 6,
    color: '#374151',
  },
  iconRow: {
    flexDirection: 'row',
  },
  metaCol: {
    marginTop: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#1F2937',
  },
  dateText: {
    marginTop: 4,
    fontSize: 12,
    color: '#6B7280',
  },
  addMaterialButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addMaterialText: {
    color: 'white',
    fontWeight: '600',
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
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 32,
  },
});
