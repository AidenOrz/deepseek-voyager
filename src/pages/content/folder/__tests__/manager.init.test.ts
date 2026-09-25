/**
 * FolderManager 初始化 / DOM 锚定回归测试
 *
 * 背景：DeepSeek 页面存在多个 .ds-scroll-area（侧边栏 + 对话区），
 * 且混淆类名随部署变化。曾出现：
 * 1. 锚点解析到对话区导致会话打不上拖拽标签（拖拽失效）；
 * 2. 预置选择器全部失效时无兜底，文件夹 UI 无法挂载/被 React 清除（UI 消失）。
 * 本文件固化这些场景的回归行为。
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// 必须在模块导入前 mock：manager.ts 顶层 import webextension-polyfill，
// jsdom 环境下真实 polyfill 会在导入时抛错
vi.mock('webextension-polyfill', () => ({
  default: {
    storage: {
      sync: {
        get: async () => ({}),
        set: async () => {},
        onChanged: { addListener: () => {}, removeListener: () => {} },
      },
      onChanged: { addListener: () => {}, removeListener: () => {} },
    },
    i18n: { getUILanguage: () => 'en-US', getMessage: () => '' },
    runtime: { id: 'test-ext', getURL: (p: string) => `ext://${p}` },
  },
}));

import { FolderManager } from '../manager';

const UUID_A = '11111111-aaaa-bbbb-cccc-111111111111';
const UUID_B = '22222222-aaaa-bbbb-cccc-222222222222';

const SIDEBAR_HTML = `
  <aside id="sidebar">
    <div class="ds-scroll-area" id="sidebar-scroll">
      <a href="/a/chat/s/${UUID_A}"><div>Chat A</div></a>
      <a href="/a/chat/s/${UUID_B}"><div>Chat B</div></a>
    </div>
  </aside>`;

const CHAT_HTML = `
  <main id="chat">
    <div class="ds-scroll-area" id="chat-scroll">
      <div class="ds-message d29f3d7d">user message</div>
    </div>
  </main>`;

function setupDeepSeekDom(chatAreaFirst: boolean): void {
  document.body.innerHTML = `<div id="root">${
    chatAreaFirst ? CHAT_HTML + SIDEBAR_HTML : SIDEBAR_HTML + CHAT_HTML
  }</div>`;
}

let current: any = null;

async function createInitializedManager(): Promise<any> {
  const manager = new FolderManager();
  await manager.init();
  current = manager;
  return manager;
}

describe('FolderManager init', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    // 断开 observer、停掉定时器，避免异步回调泄漏到其他用例/环境清理阶段
    try {
      current?.destroy?.();
    } catch {
      /* ignore */
    }
    current = null;
  });

  it('对话区在前时仍锚定侧边栏（回归：tryFindElement 取第一个 .ds-scroll-area 的旧行为）', async () => {
    setupDeepSeekDom(true);
    const manager = await createInitializedManager();
    (manager as any).stopDraggableRescan();

    const container = document.querySelector('.gv-folder-container');
    expect(container).not.toBeNull();
    // 容器插在侧边栏滚动区之前（同一父级内），而不是对话区
    expect(container!.parentElement).toBe(document.getElementById('sidebar'));
    expect(container!.nextElementSibling).toBe(document.getElementById('sidebar-scroll'));
    expect(container!.parentElement!.id).not.toBe('chat');

    // 会话已被打上拖拽标签
    const link = document.querySelector(`a[href*="${UUID_A}"]`) as HTMLElement;
    expect(link.dataset.dsvDraggableTag).toBe('1');
    expect(link.draggable).toBe(true);
  });

  it('侧边栏在前时锚定侧边栏', async () => {
    setupDeepSeekDom(false);
    const manager = await createInitializedManager();
    (manager as any).stopDraggableRescan();

    const container = document.querySelector('.gv-folder-container');
    expect(container).not.toBeNull();
    expect(container!.nextElementSibling).toBe(document.getElementById('sidebar-scroll'));
  });

  it('预置选择器全部失效时，动态向上查找对话列表容器兜底', async () => {
    // 无 .ds-scroll-area / nav / aside / [class*=sidebar] —— 全部是普通 div
    document.body.innerHTML = `
      <div id="root">
        <div class="layout">
          <div class="panel-wrapper">
            <div class="chat-list-host">
              <a href="/a/chat/s/${UUID_A}"><div>Chat A</div></a>
              <a href="/a/chat/s/${UUID_B}"><div>Chat B</div></a>
            </div>
          </div>
        </div>`;

    const manager = await createInitializedManager();
    (manager as any).stopDraggableRescan();

    const container = document.querySelector('.gv-folder-container');
    expect(container).not.toBeNull();
    // UI 必须挂在文档中，且位于对话列表宿主之前
    expect(document.contains(container!)).toBe(true);
    const host = document.querySelector('.chat-list-host')!;
    expect(host.parentElement!.contains(container!)).toBe(true);
    expect(container!.nextElementSibling).toBe(host);
  });

  it('UI 被 React 抹除后，guardian 会重新挂载', async () => {
    setupDeepSeekDom(false);
    const manager = await createInitializedManager();
    (manager as any).stopDraggableRescan();
    expect(document.querySelector('.gv-folder-container')).not.toBeNull();

    // 模拟 React 重渲染移除了注入节点
    document.querySelector('.gv-folder-container')!.remove();
    expect(document.querySelector('.gv-folder-container')).toBeNull();

    // guardian 每 2s 由重扫定时器调用；这里直接调用验证行为
    (manager as any).ensureFolderUIMounted();

    expect(document.querySelector('.gv-folder-container')).not.toBeNull();
    expect(document.contains((manager as any).containerElement)).toBe(true);
  });

  it('锚点退化（不含对话链接）时，guardian 会重新锚定', async () => {
    setupDeepSeekDom(false);
    const manager = await createInitializedManager();
    (manager as any).stopDraggableRescan();

    // 模拟早期回退：锚点被错误设置为对话区
    (manager as any).sidebarContainer = document.getElementById('chat-scroll');
    (manager as any).recentSection = document.getElementById('chat-scroll');
    (manager as any).containerElement?.remove();
    (manager as any).containerElement = null;

    (manager as any).ensureFolderUIMounted();

    const container = document.querySelector('.gv-folder-container');
    expect(container).not.toBeNull();
    // 重新锚定到侧边栏
    expect(container!.nextElementSibling).toBe(document.getElementById('sidebar-scroll'));
  });

  it('重复调用 createFolderUI 不会产生重复容器', async () => {
    setupDeepSeekDom(false);
    const manager = await createInitializedManager();
    (manager as any).stopDraggableRescan();
    (manager as any).createFolderUI();
    (manager as any).createFolderUI();
    expect(document.querySelectorAll('.gv-folder-container').length).toBe(1);
  });
});
