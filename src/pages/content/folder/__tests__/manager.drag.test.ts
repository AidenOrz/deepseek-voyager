/**
 * FolderManager 自定义指针拖拽回归测试
 *
 * 背景：DeepSeek 页面可能阻止原生 HTML5 拖拽（dragstart 被 preventDefault /
 * 捕获阶段吞掉 dragover/drop），导致会话无法拖入文件夹。
 * 自定义指针拖拽完全绕开原生 DnD 事件链，本文件固化其行为。
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

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

function setupDeepSeekDom(): void {
  document.body.innerHTML = `
    <div id="root">
      <aside id="sidebar">
        <div class="ds-scroll-area" id="sidebar-scroll">
          <a href="/a/chat/s/${UUID_A}"><div>Chat A</div></a>
          <a href="/a/chat/s/${UUID_B}"><div>Chat B</div></a>
        </div>
      </aside>
      <main id="chat"></main>
    </div>`;
}

/** jsdom 没有 PointerEvent 构造器：用 MouseEvent + defineProperty 模拟 */
function firePointer(el: Element | Document, type: string, x: number, y: number, pointerId = 1): void {
  const evt = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
    button: 0,
  });
  Object.defineProperty(evt, 'pointerId', { value: pointerId });
  el.dispatchEvent(evt);
}

function addFolderViaManager(manager: any, id: string, name: string): void {
  manager.data.folders.push({
    id,
    name,
    parentId: null,
    isExpanded: true,
    createdAt: 1,
    updatedAt: 1,
  });
  manager.data.folderContents[id] = [];
  manager.refresh();
}

describe('FolderManager 自定义指针拖拽', () => {
  let current: any = null;

  beforeEach(() => {
    localStorage.clear();
    setupDeepSeekDom();
  });

  afterEach(() => {
    try {
      current?.destroy?.();
    } catch {
      /* ignore */
    }
    current = null;
  });

  it('侧边栏会话可拖入文件夹（pointerdown → 移动超阈值 → 投放）', async () => {
    const manager: any = new FolderManager();
    await manager.init();
    (manager as any).stopDraggableRescan();
    current = manager;

    addFolderViaManager(manager, 'f1', '测试夹');
    const header = document.querySelector('.gv-folder-item-header') as HTMLElement;
    expect(header).not.toBeNull();

    // jsdom 无布局引擎，elementFromPoint 恒为 null → stub 命中测试
    (manager as any).resolveDropTarget = () => ({ folderId: 'f1', highlightEl: header });

    const link = document.querySelector(`a[href*="${UUID_A}"]`) as HTMLElement;
    firePointer(link, 'pointerdown', 10, 10, 1);
    firePointer(document, 'pointermove', 60, 60, 1); // 超过阈值，开始拖拽
    expect((manager as any).customDrag).not.toBeNull();
    expect(document.querySelector('.gv-drag-ghost')).not.toBeNull();

    firePointer(document, 'pointerup', 70, 65, 1);

    const contents = (manager as any).data.folderContents['f1'];
    expect(contents.some((c: any) => c.conversationId === UUID_A)).toBe(true);
    // 已持久化
    const stored = JSON.parse(localStorage.getItem('dsFolderData') || '{}');
    expect(stored.folderContents?.f1?.some((c: any) => c.conversationId === UUID_A)).toBe(true);
    // 拖拽结束：幽灵与状态清理
    expect((manager as any).customDrag).toBeNull();
    expect(document.querySelector('.gv-drag-ghost')).toBeNull();
  });

  it('文件夹内会话移动到另一文件夹（从源文件夹移除）', async () => {
    const manager: any = new FolderManager();
    await manager.init();
    (manager as any).stopDraggableRescan();
    current = manager;

    addFolderViaManager(manager, 'f1', '源夹');
    addFolderViaManager(manager, 'f2', '目标夹');
    manager.data.folderContents['f1'].push({
      conversationId: UUID_A,
      title: 'Chat A',
      url: `https://chat.deepseek.com/a/chat/s/${UUID_A}`,
      addedAt: 1,
    });
    manager.refresh();

    const f2Header = document.querySelector('[data-folder-id="f2"]') as HTMLElement;
    (manager as any).resolveDropTarget = () => ({ folderId: 'f2', highlightEl: f2Header });

    // 文件夹内会话行（dataset.conversationId + dataset.folderId）
    const row = document.querySelector(
      `.gv-folder-conversation[data-conversation-id="${UUID_A}"]`
    ) as HTMLElement;
    expect(row).not.toBeNull();

    firePointer(row, 'pointerdown', 10, 10, 1);
    firePointer(document, 'pointermove', 80, 80, 1);
    firePointer(document, 'pointerup', 85, 85, 1);

    const f1 = (manager as any).data.folderContents['f1'];
    const f2 = (manager as any).data.folderContents['f2'];
    expect(f1.some((c: any) => c.conversationId === UUID_A)).toBe(false);
    expect(f2.some((c: any) => c.conversationId === UUID_A)).toBe(true);
  });

  it('移动未超阈值时不进入拖拽（普通点击不受影响）', async () => {
    const manager: any = new FolderManager();
    await manager.init();
    (manager as any).stopDraggableRescan();
    current = manager;

    addFolderViaManager(manager, 'f1', '测试夹');
    const header = document.querySelector('.gv-folder-item-header') as HTMLElement;
    (manager as any).resolveDropTarget = () => ({ folderId: 'f1', highlightEl: header });

    const link = document.querySelector(`a[href*="${UUID_A}"]`) as HTMLElement;
    firePointer(link, 'pointerdown', 10, 10, 1);
    firePointer(document, 'pointermove', 12, 11, 1); // 仅 2px，低于阈值
    firePointer(document, 'pointerup', 12, 11, 1);

    expect((manager as any).customDrag).toBeNull();
    expect((manager as any).pendingPointerDrag).toBeNull();
    expect((manager as any).data.folderContents['f1'].length).toBe(0);
  });

  it('投放目标为空时不添加（拖到文件夹区域之外）', async () => {
    const manager: any = new FolderManager();
    await manager.init();
    (manager as any).stopDraggableRescan();
    current = manager;

    addFolderViaManager(manager, 'f1', '测试夹');
    (manager as any).resolveDropTarget = () => ({ folderId: null, highlightEl: null });

    const link = document.querySelector(`a[href*="${UUID_A}"]`) as HTMLElement;
    firePointer(link, 'pointerdown', 10, 10, 1);
    firePointer(document, 'pointermove', 60, 60, 1);
    firePointer(document, 'pointerup', 70, 70, 1);

    expect((manager as any).data.folderContents['f1'].length).toBe(0);
    expect((manager as any).customDrag).toBeNull();
  });
});
