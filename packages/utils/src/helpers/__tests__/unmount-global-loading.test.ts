import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { unmountGlobalLoading } from '../unmount-global-loading';

describe('unmountGlobalLoading', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('does nothing when loading element does not exist', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => unmountGlobalLoading()).not.toThrow();
    expect(document.querySelector('#__app-loading__')).toBeNull();

    consoleSpy.mockRestore();
  });

  it('adds hidden class to loading element', () => {
    const loadingElement = document.createElement('div');
    loadingElement.id = '__app-loading__';
    document.body.appendChild(loadingElement);

    unmountGlobalLoading();

    expect(loadingElement.classList.contains('hidden')).toBe(true);
  });

  it('removes loading element after transition', async () => {
    const loadingElement = document.createElement('div');
    loadingElement.id = '__app-loading__';
    document.body.appendChild(loadingElement);

    unmountGlobalLoading();

    // 等待 transitionend 事件
    await new Promise(resolve => setTimeout(resolve, 150));

    expect(document.querySelector('#__app-loading__')).toBeNull();
  });

  it('removes injected loading elements', async () => {
    const loadingElement = document.createElement('div');
    loadingElement.id = '__app-loading__';
    document.body.appendChild(loadingElement);

    const injectElement1 = document.createElement('div');
    injectElement1.setAttribute('data-app-loading', 'inject-1');
    document.body.appendChild(injectElement1);

    const injectElement2 = document.createElement('div');
    injectElement2.setAttribute('data-app-loading', 'inject-2');
    document.body.appendChild(injectElement2);

    unmountGlobalLoading();

    // 等待 transitionend 事件
    await new Promise(resolve => setTimeout(resolve, 150));

    expect(document.querySelector('[data-app-loading^="inject"]')).toBeNull();
  });

  it('removes only loading-related elements', async () => {
    const loadingElement = document.createElement('div');
    loadingElement.id = '__app-loading__';
    document.body.appendChild(loadingElement);

    const otherElement = document.createElement('div');
    otherElement.id = 'other-element';
    document.body.appendChild(otherElement);

    unmountGlobalLoading();

    // 等待 transitionend 事件
    await new Promise(resolve => setTimeout(resolve, 150));

    expect(document.querySelector('#__app-loading__')).toBeNull();
    expect(document.querySelector('#other-element')).not.toBeNull();
  });
});
