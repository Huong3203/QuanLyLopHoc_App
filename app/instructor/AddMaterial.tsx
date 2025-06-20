import { Button, InputItem, Toast, WhiteSpace } from '@ant-design/react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../config/supabaseClient';

export default function AddMaterialScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { courseId } = route.params;

  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newType, setNewType] = useState<'pdf' | 'video' | 'link'>('pdf');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [typeDropdownVisible, setTypeDropdownVisible] = useState(false);

  const [courseTitle, setCourseTitle] = useState('');

  useEffect(() => {
    if (courseId) {
      fetchCourseInfo();
    }
  }, [courseId]);

  const fetchCourseInfo = async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('title')
      .eq('id', courseId)
      .single();

    if (error) {
      Toast.fail('Không thể tải thông tin khóa học');
    } else {
      setCourseTitle(data?.title || '');
    }
  };

  const handleAddMaterial = async () => {
    if (!newTitle.trim() || !newUrl.trim()) {
      Toast.info('Vui lòng nhập đủ thông tin');
      return;
    }

    const { error } = await supabase.from('materials').insert({
      course_id: courseId,
      title: newTitle,
      url: newUrl,
      type: newType,
      description,
      content,
      uploaded_at: new Date().toISOString(),
    });

    if (error) {
      Toast.fail('Lỗi khi thêm tài liệu');
    } else {
      Toast.success('Đã thêm tài liệu');
      navigation.goBack();
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Thêm Tài Liệu</Text>
      {courseTitle ? (
        <Text style={styles.courseInfo}>Khóa học: {courseTitle}</Text>
      ) : (
        <Text style={styles.courseInfo}>Đang tải thông tin khóa học...</Text>
      )}

      <InputItem
        clear
        placeholder="Nhập tiêu đề"
        value={newTitle}
        onChange={setNewTitle}
      >
        Tiêu đề
      </InputItem>

      <InputItem
        clear
        placeholder="Nhập URL"
        value={newUrl}
        onChange={setNewUrl}
      >
        URL
      </InputItem>

      <InputItem
        clear
        placeholder="Mô tả (tùy chọn)"
        value={description}
        onChange={setDescription}
      >
        Mô tả
      </InputItem>

      <InputItem
        clear
        placeholder="Nội dung (tùy chọn)"
        value={content}
        onChange={setContent}
      >
        Nội dung
      </InputItem>

      <Text style={styles.sectionLabel}>Loại tài liệu</Text>
      <TouchableOpacity
        style={styles.dropdownToggle}
        onPress={() => setTypeDropdownVisible(!typeDropdownVisible)}
      >
        <Text style={styles.dropdownText}>
          {newType === 'pdf' ? 'PDF' : newType === 'video' ? 'Video' : 'Link'}
        </Text>
      </TouchableOpacity>

      {typeDropdownVisible && (
        <View style={styles.dropdownOptions}>
          {['pdf', 'video', 'link'].map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => {
                setNewType(type as 'pdf' | 'video' | 'link');
                setTypeDropdownVisible(false);
              }}
              style={[
                styles.dropdownOption,
                newType === type && styles.dropdownOptionSelected,
              ]}
            >
              <Text
                style={[
                  styles.dropdownOptionText,
                  newType === type && styles.dropdownOptionTextSelected,
                ]}
              >
                {type.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <WhiteSpace />
      <Button
        type="primary"
        onPress={handleAddMaterial}
        style={styles.purpleButton}
      >
        Lưu tài liệu
      </Button>
      <WhiteSpace />
      <Button onPress={() => navigation.goBack()}>Hủy</Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  courseInfo: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginTop: 16,
    marginBottom: 6,
  },
  dropdownToggle: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#7C3AED',
    borderRadius: 8,
    backgroundColor: '#F5F3FF',
  },
  dropdownText: {
    color: '#7C3AED',
    fontWeight: 'bold',
  },
  dropdownOptions: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    borderRadius: 8,
    backgroundColor: '#FAF5FF',
    overflow: 'hidden',
  },
  dropdownOption: {
    padding: 10,
  },
  dropdownOptionSelected: {
    backgroundColor: '#E9D5FF',
  },
  dropdownOptionText: {
    color: '#6B21A8',
  },
  dropdownOptionTextSelected: {
    fontWeight: 'bold',
    color: '#4C1D95',
  },
  purpleButton: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
});
