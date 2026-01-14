import { ref } from 'vue';

import { defineStore } from 'pinia';

import { userApi } from '../../../api/user';



interface Contact {
  avatar: null | string;
  contactUserId: number;
  createdAt: string;
  description: null | string;
  email: string;
  groupId: number;
  id: number;
  idCard: null | string;
  isOnline: boolean;
  isPinned: boolean;
  isSystemUser: boolean | null;
  lastOnlineTime: null | string;
  name: string;
  phone: string;
  updatedAt: string;
  userId: number;
}

interface User {
  id: number;
  username: string;
  realName: string;
  mobile: string;
  email: string;
  phone: string;
  isValid: string;
  status: string;
  loginType: string;
  lastLoginTime: string;
  lastLoginIp: string;
  loginCount: number;
  createTime: string;
  updateTime: string;
}

export const useContactStore = defineStore('contact', () => {
  const contacts = ref<Contact[]>([]);
  const users = ref<User[]>([]);
  const loading = ref(false);
  const error = ref<null | string>(null);

  function setContacts(data: Contact[]) {
    contacts.value = data;
  }

  function updateContactOnlineStatus(contactUserId: number, isOnline: boolean) {
    const contact = contacts.value.find(
      (c) => c.contactUserId === contactUserId,
    );
    if (contact) {
      contact.isOnline = isOnline;
      contact.lastOnlineTime = new Date().toISOString();
    }
  }

  async function fetchContacts() {
    loading.value = true;
    error.value = null;
    try {
      console.log('开始获取联系人列表，通过 /users 接口...');
      
      const response = await userApi.getAllUsers({
        page: 1,
        size: 100,
        sortField: 'createTime',
        sortOrder: 'DESC',
      });
      
      console.log('/users API响应:', response);
      
      if (response.code === 200) {
        console.log('API返回成功，code:', response.code);
        console.log('API返回数据:', response.data);
        
        if (response.data?.users) {
          console.log('API返回用户列表，共', response.data.users.length, '个用户');
          
          const currentUserId = Number.parseInt(localStorage.getItem('chat_user_id') || '1');
          console.log('当前用户ID:', currentUserId);
          
          // 输出原始用户列表
          console.log('原始用户列表:', response.data.users);
          
          // 过滤掉当前用户
          const filteredUsers = response.data.users.filter((user: User) => user.id !== currentUserId);
          console.log('过滤后用户列表，共', filteredUsers.length, '个用户');
          
          // 转换为联系人数据
          const contactsData: Contact[] = filteredUsers.map((user: User, index: number) => ({
            id: index + 1,
            userId: currentUserId,
            contactUserId: user.id,
            name: user.realName || user.username,
            phone: user.mobile || '',
            email: user.email || '',
            avatar: null,
            description: '',
            groupId: 1,
            idCard: null,
            isOnline: false,
            isPinned: false,
            isSystemUser: true,
            lastOnlineTime: null,
            createdAt: user.createTime,
            updatedAt: user.updateTime,
          }));
          
          console.log('转换后联系人列表，共', contactsData.length, '个联系人');
          
          setContacts(contactsData);
          console.log('联系人列表更新完成，共', contactsData.length, '个联系人');
          console.log('contacts.value现在有', contacts.value.length, '个联系人');
        } else {
          console.warn('API返回数据中没有users字段');
          setContacts([]);
        }
      } else {
        console.warn('获取用户列表失败，code:', response.code, 'message:', response.message);
        setContacts([]);
      }
    } catch (error_) {
      const errorMessage = error_ instanceof Error ? error_.message : '获取联系人列表失败';
      error.value = errorMessage;
      console.error('获取联系人列表失败:', error_);
      console.error('错误详情:', errorMessage);
      setContacts([]);
    } finally {
      loading.value = false;
      console.log('fetchContacts函数执行完成');
    }
  }

  async function fetchUsers(params?: {
    page?: number;
    size?: number;
    sortField?: string;
    sortOrder?: 'ASC' | 'DESC';
    keyword?: string;
    status?: 'ACTIVE' | 'LOCKED' | 'INACTIVE' | 'DELETED';
  }) {
    console.log('📞 contactStore.fetchUsers 被调用');
    console.log('📋 传入参数:', params);
    
    loading.value = true;
    error.value = null;
    try {
      console.log('开始调用 /users API...');
      
      // 使用真实API调用，设置size为100以获取尽量多的用户
      const response = await userApi.getAllUsers({
        ...params,
        size: params?.size || 100,
        sortField: params?.sortField || 'createTime',
        sortOrder: params?.sortOrder || 'DESC',
      });
      
      console.log('✅ API调用成功，返回数据:', response);
      
      if (response.code === 200 && response.data?.users) {
        users.value = response.data.users;
        console.log('💾 更新 users 列表，共', response.data.users.length, '个用户');
      } else {
        console.warn('⚠️ API返回异常，使用空数据');
        users.value = [];
      }
      
      return response.data;
    } catch (error_) {
      const errorMessage = error_ instanceof Error ? error_.message : '获取用户列表失败';
      error.value = errorMessage;
      console.error('❌ 获取用户列表失败:', error_);
      console.error('❌ 错误详情:', errorMessage);
      throw error_;
    } finally {
      loading.value = false;
      console.log('🔚 fetchUsers 调用结束');
    }
  }

  function getUserById(userId: number) {
    return users.value.find((user) => user.id === userId);
  }

  function getUserName(userId: number) {
    const user = getUserById(userId);
    return user?.username || `用户${userId}`;
  }

  function getUserRealName(userId: number) {
    const user = getUserById(userId);
    return user?.realName || `用户${userId}`;
  }

  function initMockData() {
    const currentUserId = 1;

    const mockContacts: Contact[] = [
      {
        id: 1,
        userId: currentUserId,
        contactUserId: 2,
        name: '张三',
        phone: '13800138001',
        email: 'zhangsan@example.com',
        idCard: null,
        avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
        description: '同事',
        isSystemUser: false,
        groupId: 1,
        isOnline: true,
        lastOnlineTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        isPinned: true,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 2,
        userId: currentUserId,
        contactUserId: 3,
        name: '李四',
        phone: '13800138002',
        email: 'lisi@example.com',
        idCard: null,
        avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
        description: '朋友',
        isSystemUser: false,
        groupId: 2,
        isOnline: false,
        lastOnlineTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isPinned: false,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 3,
        userId: currentUserId,
        contactUserId: 4,
        name: '王五',
        phone: '13800138003',
        email: 'wangwu@example.com',
        idCard: null,
        avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
        description: '同事',
        isSystemUser: false,
        groupId: 1,
        isOnline: true,
        lastOnlineTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        isPinned: false,
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 4,
        userId: currentUserId,
        contactUserId: 5,
        name: '赵六',
        phone: '13800138004',
        email: 'zhaoliu@example.com',
        idCard: null,
        avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
        description: '家人',
        isSystemUser: false,
        groupId: 3,
        isOnline: true,
        lastOnlineTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        isPinned: false,
        createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 5,
        userId: currentUserId,
        contactUserId: 6,
        name: '孙七',
        phone: '13800138005',
        email: 'sunqi@example.com',
        idCard: null,
        avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
        description: '同事',
        isSystemUser: false,
        groupId: 1,
        isOnline: false,
        lastOnlineTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        isPinned: false,
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    const mockUsers: User[] = [
      {
        id: 2,
        username: 'zhangsan',
        realName: '张三',
        mobile: '13800138001',
        email: 'zhangsan@example.com',
        phone: '010-12345678',
        isValid: '1',
        status: 'ACTIVE',
        loginType: '1',
        lastLoginTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        lastLoginIp: '192.168.1.1',
        loginCount: 15,
        createTime: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        updateTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 3,
        username: 'lisi',
        realName: '李四',
        mobile: '13800138002',
        email: 'lisi@example.com',
        phone: '010-87654321',
        isValid: '1',
        status: 'ACTIVE',
        loginType: '1',
        lastLoginTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        lastLoginIp: '192.168.1.2',
        loginCount: 8,
        createTime: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
        updateTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 4,
        username: 'wangwu',
        realName: '王五',
        mobile: '13800138003',
        email: 'wangwu@example.com',
        phone: '010-11112222',
        isValid: '1',
        status: 'ACTIVE',
        loginType: '1',
        lastLoginTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        lastLoginIp: '192.168.1.3',
        loginCount: 22,
        createTime: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        updateTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 5,
        username: 'zhaoliu',
        realName: '赵六',
        mobile: '13800138004',
        email: 'zhaoliu@example.com',
        phone: '010-33334444',
        isValid: '1',
        status: 'ACTIVE',
        loginType: '1',
        lastLoginTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        lastLoginIp: '192.168.1.4',
        loginCount: 12,
        createTime: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
        updateTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 6,
        username: 'sunqi',
        realName: '孙七',
        mobile: '13800138005',
        email: 'sunqi@example.com',
        phone: '010-55556666',
        isValid: '1',
        status: 'ACTIVE',
        loginType: '1',
        lastLoginTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        lastLoginIp: '192.168.1.5',
        loginCount: 5,
        createTime: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updateTime: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    contacts.value = mockContacts;
    users.value = mockUsers;
  }

  function $reset() {
    contacts.value = [];
    users.value = [];
    loading.value = false;
    error.value = null;
  }

  return {
    contacts,
    users,
    loading,
    error,
    setContacts,
    updateContactOnlineStatus,
    fetchContacts,
    fetchUsers,
    getUserById,
    getUserName,
    getUserRealName,
    initMockData,
    $reset,
  };
});
