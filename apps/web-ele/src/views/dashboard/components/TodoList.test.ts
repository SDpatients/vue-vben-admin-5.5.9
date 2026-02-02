import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TodoList from './TodoList.vue';

describe('TodoList', () => {
  it('renders correctly', () => {
    const wrapper = mount(TodoList);
    expect(wrapper.exists()).toBe(true);
  });

  it('displays title', () => {
    const wrapper = mount(TodoList);
    const title = wrapper.find('h4');
    expect(title.text()).toBe('待办事项');
  });

  it('renders all todo items', () => {
    const wrapper = mount(TodoList);
    const todoItems = wrapper.findAll('.todo-item');
    expect(todoItems).toHaveLength(3);
  });

  it('displays todo title correctly', () => {
    const wrapper = mount(TodoList);
    const firstTodo = wrapper.findAll('.todo-item')[0];
    expect(firstTodo.text()).toContain('完成案件报告');
  });

  it('displays todo description correctly', () => {
    const wrapper = mount(TodoList);
    const firstTodo = wrapper.findAll('.todo-item')[0];
    expect(firstTodo.text()).toContain('整理Q4案件数据并生成报告');
  });

  it('displays due date correctly', () => {
    const wrapper = mount(TodoList);
    const firstTodo = wrapper.findAll('.todo-item')[0];
    expect(firstTodo.text()).toContain('截止日期: 2025-12-30');
  });

  it('applies correct border color for high priority', () => {
    const wrapper = mount(TodoList);
    const firstTodo = wrapper.findAll('.todo-item')[0];
    expect(firstTodo.classes()).toContain('border-l-4');
    expect(firstTodo.classes()).toContain('border-red-500');
  });

  it('applies correct border color for medium priority', () => {
    const wrapper = mount(TodoList);
    const secondTodo = wrapper.findAll('.todo-item')[1];
    expect(secondTodo.classes()).toContain('border-l-4');
    expect(secondTodo.classes()).toContain('border-yellow-500');
  });

  it('applies correct border color for low priority', () => {
    const wrapper = mount(TodoList);
    const thirdTodo = wrapper.findAll('.todo-item')[2];
    expect(thirdTodo.classes()).toContain('border-l-4');
    expect(thirdTodo.classes()).toContain('border-green-500');
  });

  it('displays correct priority label for high priority', () => {
    const wrapper = mount(TodoList);
    const firstTodo = wrapper.findAll('.todo-item')[0];
    expect(firstTodo.text()).toContain('高');
  });

  it('displays correct priority label for medium priority', () => {
    const wrapper = mount(TodoList);
    const secondTodo = wrapper.findAll('.todo-item')[1];
    expect(secondTodo.text()).toContain('中');
  });

  it('displays correct priority label for low priority', () => {
    const wrapper = mount(TodoList);
    const thirdTodo = wrapper.findAll('.todo-item')[2];
    expect(thirdTodo.text()).toContain('低');
  });

  it('applies correct background color for priority badge', () => {
    const wrapper = mount(TodoList);
    const firstTodo = wrapper.findAll('.todo-item')[0];
    const priorityBadge = firstTodo.find('.rounded-full');
    expect(priorityBadge.classes()).toContain('bg-red-500');
  });

  it('displays correct status for pending', () => {
    const wrapper = mount(TodoList);
    const firstTodo = wrapper.findAll('.todo-item')[0];
    expect(firstTodo.text()).toContain('待处理');
  });

  it('displays correct status for in_progress', () => {
    const wrapper = mount(TodoList);
    const secondTodo = wrapper.findAll('.todo-item')[1];
    expect(secondTodo.text()).toContain('处理中');
  });

  it('applies correct background color for status badge', () => {
    const wrapper = mount(TodoList);
    const firstTodo = wrapper.findAll('.todo-item')[0];
    const statusBadges = firstTodo.findAll('.rounded-full');
    expect(statusBadges[1].classes()).toContain('bg-gray-200');
  });

  it('has hover effect class', () => {
    const wrapper = mount(TodoList);
    const todoItem = wrapper.find('.todo-item');
    expect(todoItem.classes()).toContain('hover:shadow-md');
  });

  it('has transition class', () => {
    const wrapper = mount(TodoList);
    const todoItem = wrapper.find('.todo-item');
    expect(todoItem.classes()).toContain('transition-all');
  });

  it('displays all todo information correctly', () => {
    const wrapper = mount(TodoList);
    const secondTodo = wrapper.findAll('.todo-item')[1];
    expect(secondTodo.text()).toContain('客户回访');
    expect(secondTodo.text()).toContain('联系重要客户确认案件进展');
    expect(secondTodo.text()).toContain('截止日期: 2025-12-25');
    expect(secondTodo.text()).toContain('中');
    expect(secondTodo.text()).toContain('处理中');
  });
});
