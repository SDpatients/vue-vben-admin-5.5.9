import { computed, ref } from 'vue';

import { defineStore } from 'pinia';

import { getContactGroupsApi, getContactsApi } from '#/api/core/chat';

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

interface ContactGroup {
  color?: string;
  id: number;
  name: string;
  sortOrder: number;
  userId: number;
  createdAt: string;
}

export const useContactStore = defineStore('contact', () => {
  const contacts = ref<Contact[]>([]);
  const groups = ref<ContactGroup[]>([]);
  const searchKeyword = ref('');
  const selectedGroup = ref<null | number>(null);
  const currentContact = ref<Contact | null>(null);
  const loading = ref(false);
  const error = ref<null | string>(null);

  const filteredContacts = computed(() => {
    let result = [...contacts.value];

    if (selectedGroup.value !== null) {
      result = result.filter(
        (contact) => contact.groupId === selectedGroup.value,
      );
    }

    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase();
      result = result.filter(
        (contact) =>
          contact.name.toLowerCase().includes(keyword) ||
          contact.phone.includes(keyword) ||
          contact.email.toLowerCase().includes(keyword),
      );
    }

    result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;
      return a.name.localeCompare(b.name);
    });

    return result;
  });

  function setContacts(data: Contact[]) {
    contacts.value = data;
  }

  function addContact(contact: Contact) {
    contacts.value.push(contact);
  }

  function updateContact(contact: Contact) {
    const index = contacts.value.findIndex((c) => c.id === contact.id);
    if (index !== -1) {
      contacts.value[index] = contact;
    }
  }

  function deleteContact(id: number) {
    const index = contacts.value.findIndex((c) => c.id === id);
    if (index !== -1) {
      contacts.value.splice(index, 1);
    }
  }

  function setGroups(data: ContactGroup[]) {
    groups.value = data;
  }

  function addGroup(group: ContactGroup) {
    groups.value.push(group);
  }

  function updateGroup(group: ContactGroup) {
    const index = groups.value.findIndex((g) => g.id === group.id);
    if (index !== -1) {
      groups.value[index] = group;
    }
  }

  function deleteGroup(id: number) {
    const index = groups.value.findIndex((g) => g.id === id);
    if (index !== -1) {
      groups.value.splice(index, 1);
    }
    contacts.value.forEach((contact) => {
      if (contact.groupId === id) {
        contact.groupId = 1;
      }
    });
  }

  function setSearchKeyword(keyword: string) {
    searchKeyword.value = keyword;
  }

  function setSelectedGroup(groupId: null | number) {
    selectedGroup.value = groupId;
  }

  function setCurrentContact(contact: Contact | null) {
    currentContact.value = contact;
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

  function toggleContactPin(id: number) {
    const contact = contacts.value.find((c) => c.id === id);
    if (contact) {
      contact.isPinned = !contact.isPinned;
    }
  }

  async function fetchContacts() {
    loading.value = true;
    error.value = null;
    try {
      const data = await getContactsApi();
      const currentUserId = localStorage.getItem('chat_user_id');

      if (currentUserId) {
        const userId = Number.parseInt(currentUserId);
        const filteredContacts = data.filter(
          (contact) => contact.userId === userId,
        );
        setContacts(filteredContacts);
      } else {
        setContacts(data);
      }
    } catch (error_) {
      error.value =
        error_ instanceof Error ? error_.message : '获取联系人列表失败';
      console.error('获取联系人列表失败:', error_);
    } finally {
      loading.value = false;
    }
  }

  async function fetchContactGroups() {
    loading.value = true;
    error.value = null;
    try {
      const data = await getContactGroupsApi();
      const currentUserId = localStorage.getItem('chat_user_id');

      if (currentUserId) {
        const userId = Number.parseInt(currentUserId);
        const filteredGroups = data.filter((group) => group.userId === userId);
        setGroups(filteredGroups);
      } else {
        setGroups(data);
      }
    } catch (error_) {
      error.value =
        error_ instanceof Error ? error_.message : '获取联系人分组列表失败';
      console.error('获取联系人分组列表失败:', error_);
    } finally {
      loading.value = false;
    }
  }

  async function initializeData() {
    await Promise.all([fetchContacts(), fetchContactGroups()]);
  }

  function $reset() {
    contacts.value = [];
    groups.value = [];
    searchKeyword.value = '';
    selectedGroup.value = null;
    currentContact.value = null;
    loading.value = false;
    error.value = null;
  }

  return {
    contacts,
    groups,
    searchKeyword,
    selectedGroup,
    currentContact,
    loading,
    error,
    filteredContacts,
    setContacts,
    addContact,
    updateContact,
    deleteContact,
    setGroups,
    addGroup,
    updateGroup,
    deleteGroup,
    setSearchKeyword,
    setSelectedGroup,
    setCurrentContact,
    updateContactOnlineStatus,
    toggleContactPin,
    fetchContacts,
    fetchContactGroups,
    initializeData,
    $reset,
  };
});
