class EventBus {
  private eventMap: Record<string, Record<string, Function>>;

  constructor() {
    if (!EventBus.Instance) {
      // 内存中存储所有事件的处理函数
      this.eventMap = {};
      EventBus.Instance = this;
    }
    return EventBus.Instance;
  }

  /**
   * 注册事件
   * @param key 事件名
   * @param page 组件(页面)名
   * @param callback 注册的事件
   */
  public on(key: string, page: string, callback: Function): void {
    // 将函数通过事件名 key，页面(组件)名的形式进行注册
    this.eventMap[key] = this.eventMap[key] || {};
    this.eventMap[key][page] = callback;
  }

  /**
   * 事件通知
   * @param key 事件名
   * @param data 通知的数据
   * @param page 组件(页面)名
   */
  public emit(key: string, data: any, page: string | null = null): void {
    if (key && this.eventMap[key]) {
      if (page) {
        // 如果参数中有页面名(组件名)，则将 data 通知单个页面(组件)注册的函数进行处理
        this.eventMap[key][page] && this.eventMap[key][page](data);
      } else {
        // 通知该事件名下的所有页面(组件)注册的函数进行处理
        for (const sub in this.eventMap[key]) {
          this.eventMap[key][sub](data);
        }
      }
    } else {
      // 该事件名下没有注册任何函数
    }
  }

  /**
   * 事件销毁，一般在页面(组件销毁时同步销毁)
   * @param key 事件名
   * @param page 组件(页面)名
   */
  public destroy(key: string, page: string): void {
    if (this.eventMap[key] && this.eventMap[key][page]) {
      // 删除单个页面事件
      delete this.eventMap[key][page];
    }
    if (this.eventMap[key] == {}) {
      delete this.eventMap[key];
    }
  }

  /**
   * 事件销毁，销毁全部
   * @param key 事件名
   */
  public destroyAll(key: string): void {
    if (this.eventMap[key] == {}) {
      // 删除所有
      delete this.eventMap[key];
    }
  }
}

export default new EventBus();
