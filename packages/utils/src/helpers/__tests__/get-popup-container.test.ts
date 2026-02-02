import { describe, expect, it, vi, beforeEach } from 'vitest';

import { getPopupContainer } from '../get-popup-container';

describe('getPopupContainer', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('returns document body when no node is provided', () => {
    const result = getPopupContainer();
    expect(result).toStrictEqual(document.body);
  });

  it('returns parent node when node is provided and not in a form', () => {
    const child = document.createElement('div');
    container.appendChild(child);

    const result = getPopupContainer(child);
    expect(result).toStrictEqual(container);
  });

  it('returns form element when node is inside a form', () => {
    const form = document.createElement('form');
    const input = document.createElement('input');
    form.appendChild(input);
    container.appendChild(form);

    const result = getPopupContainer(input);
    expect(result).toStrictEqual(form);
  });

  it('returns parent node when node has no form ancestor', () => {
    const div = document.createElement('div');
    const span = document.createElement('span');
    div.appendChild(span);
    container.appendChild(div);

    const result = getPopupContainer(span);
    expect(result).toStrictEqual(div);
  });

  it('handles nested forms correctly', () => {
    const outerForm = document.createElement('form');
    const innerForm = document.createElement('form');
    const input = document.createElement('input');
    innerForm.appendChild(input);
    outerForm.appendChild(innerForm);
    container.appendChild(outerForm);

    const result = getPopupContainer(input);
    expect(result).toStrictEqual(innerForm);
  });

  it('returns document body when node has no parent', () => {
    const detachedNode = document.createElement('div');

    const result = getPopupContainer(detachedNode);
    expect(result).toStrictEqual(document.body);
  });
});
