declare global {
  interface MouseEvent {
    /**自定义属性：使用MouseEvent触发时区分不是自己触发的 */
    isMe?: boolean;
  }
}

export {};