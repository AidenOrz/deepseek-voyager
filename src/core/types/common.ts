/**
 * Common types used throughout the application
 * Following strict type safety principles
 */

export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export interface IDisposable {
  dispose(): void;
}

export interface ILogger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

/**
 * Brand type for type-safe IDs
 */
export type Brand<K, T> = K & { __brand: T };

export type ConversationId = Brand<string, 'ConversationId'>;
export type FolderId = Brand<string, 'FolderId'>;
export type TurnId = Brand<string, 'TurnId'>;

/**
 * Storage keys - centralized for type safety
 */
export const StorageKeys = {
  FOLDER_DATA: 'dsFolderData',
  TIMELINE_SCROLL_MODE: 'deepseekTimelineScrollMode',
  TIMELINE_HIDE_CONTAINER: 'deepseekTimelineHideContainer',
  TIMELINE_DRAGGABLE: 'deepseekTimelineDraggable',
  TIMELINE_POSITION: 'deepseekTimelinePosition',
  CHAT_WIDTH: 'geminiChatWidth',
  LANGUAGE: 'language',
} as const;

export type StorageKey = typeof StorageKeys[keyof typeof StorageKeys];
