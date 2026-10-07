import { Platform } from 'react-native';

// Native HTML5 drag & drop on React Native Web views (computer only): a ref
// callback turns a view into a drag source or a drop target. On phones and
// native apps these are no-ops — moving goes through the « Déplacer » sheet.
export type DragItem = { kind: 'project' | 'folder'; id: string };
const MIME = 'application/x-cantia-item';
const web = Platform.OS === 'web' && typeof document !== 'undefined';
let dragging: DragItem | null = null;

type Cleanup = () => void;
// one slot per role, so a view can be both a source and a target
const cleanups = { source: new WeakMap<HTMLElement, Cleanup>(), target: new WeakMap<HTMLElement, Cleanup>() };

function bind(role: 'source' | 'target', node: HTMLElement | null, attach: (el: HTMLElement) => Cleanup) {
  if (!web || !node || !(node instanceof HTMLElement)) return;
  cleanups[role].get(node)?.();
  cleanups[role].set(node, attach(node));
}

export function dragSource(item: DragItem) {
  return (node: unknown) =>
    bind('source', node as HTMLElement, (el) => {
      el.draggable = true;
      const start = (e: DragEvent) => {
        dragging = item;
        e.dataTransfer?.setData(MIME, JSON.stringify(item));
        if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
        el.style.opacity = '0.5';
      };
      const end = () => {
        dragging = null;
        el.style.opacity = '';
      };
      el.addEventListener('dragstart', start);
      el.addEventListener('dragend', end);
      return () => {
        el.removeEventListener('dragstart', start);
        el.removeEventListener('dragend', end);
      };
    });
}

// `accept` decides, while hovering, whether this target takes the item
// (a folder never goes into itself or its own sub-folders).
export function dropTarget(opts: { accept: (item: DragItem) => boolean; onDrop: (item: DragItem) => void; onHover?: (over: boolean) => void }) {
  return (node: unknown) =>
    bind('target', node as HTMLElement, (el) => {
      let depth = 0;
      const ok = () => !!dragging && opts.accept(dragging);
      const enter = (e: DragEvent) => {
        if (!ok()) return;
        e.preventDefault();
        if (depth++ === 0) opts.onHover?.(true);
      };
      const over = (e: DragEvent) => {
        if (!ok()) return;
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
      };
      const leave = () => {
        if (depth > 0 && --depth === 0) opts.onHover?.(false);
      };
      const drop = (e: DragEvent) => {
        const item = dragging;
        depth = 0;
        opts.onHover?.(false);
        if (!item || !opts.accept(item)) return;
        e.preventDefault();
        opts.onDrop(item);
      };
      el.addEventListener('dragenter', enter);
      el.addEventListener('dragover', over);
      el.addEventListener('dragleave', leave);
      el.addEventListener('drop', drop);
      return () => {
        el.removeEventListener('dragenter', enter);
        el.removeEventListener('dragover', over);
        el.removeEventListener('dragleave', leave);
        el.removeEventListener('drop', drop);
      };
    });
}
