import { ref } from 'vue';

import { defineStore } from 'pinia';

import {
  getContactsApi,
  getUserListApi,
} from '#/api/core/chat';

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
  status: 'ACTIVE' | 'LOCKED' | 'INACTIVE' | 'DELETED';
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
      console.log('开始获取联系人列表...');
      // 调用真实的用户列表API，获取所有用户作为联系人
      const userData = await getUserListApi();
      
      console.log('API返回数据:', userData);
      
      const currentUserId = localStorage.getItem('chat_user_id') || '1';
      const userId = Number.parseInt(currentUserId);
      
      // 检查返回数据格式是否正确
      if (!userData || !Array.isArray(userData.users)) {
        throw new Error('获取的联系人数据格式不正确');
      }
      
      // 将用户列表转换为联系人列表，使用realName作为联系人名称
      const contactsFromUsers = userData.users.map((user, index) => ({
        id: index + 1,
        userId: userId,
        contactUserId: user.id,
        name: user.realName || user.username || `用户${user.id}`, // 使用realName作为联系人名称，兼容空值
        phone: user.mobile || '',
        email: user.email || '',
        avatar: null,
        description: '',
        groupId: 1,
        idCard: null,
        isOnline: Math.random() > 0.5, // 随机生成在线状态
        isPinned: false,
        isSystemUser: false,
        lastOnlineTime: user.lastLoginTime || new Date().toISOString(),
        createdAt: user.createTime || new Date().toISOString(),
        updatedAt: user.updateTime || new Date().toISOString()
      }));
      
      console.log('转换后的联系人列表:', contactsFromUsers);
      
      setContacts(contactsFromUsers);
      users.value = userData.users;
      console.log('联系人列表更新完成');
    } catch (error_) {
      const errorMessage = error_ instanceof Error ? error_.message : '获取联系人列表失败';
      error.value = errorMessage;
      console.error('获取联系人列表失败:', error_);
      
      // 添加兜底逻辑，避免界面完全空白
      if (contacts.value.length === 0) {
        console.log('使用兜底联系人数据');
        // 使用一些默认联系人数据作为兜底
        const defaultContacts = [
          {
            id: 1,
            userId: 1,
            contactUserId: 2,
            name: '默认联系人1',
            phone: '13800138001',
            email: 'contact1@example.com',
            avatar: null,
            description: '',
            groupId: 1,
            idCard: null,
            isOnline: true,
            isPinned: false,
            isSystemUser: false,
            lastOnlineTime: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 2,
            userId: 1,
            contactUserId: 3,
            name: '默认联系人2',
            phone: '13800138002',
            email: 'contact2@example.com',
            avatar: null,
            description: '',
            groupId: 1,
            idCard: null,
            isOnline: false,
            isPinned: false,
            isSystemUser: false,
            lastOnlineTime: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        setContacts(defaultContacts);
      }
    } finally {
      loading.value = false;
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
      console.log('🌐 开始调用 getUserListApi，参数:', params);
      const data = await getUserListApi(params);
      console.log('✅ getUserListApi 调用成功，返回数据:', data);
      
      users.value = data.users;
      console.log('💾 更新 users 列表，共', data.users.length, '个用户');
      
      return data;
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
