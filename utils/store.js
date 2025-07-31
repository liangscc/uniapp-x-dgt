// 全局状态管理
class Store {
  constructor() {
    this.state = {
      // 用户信息
      userInfo: null,
      token: null,
      isLogin: false,

      // 网络状态
      networkStatus: true,

      // 应用配置
      appConfig: {
        theme: 'light',
        language: 'zh-CN',
        fontSize: 'normal'
      },

      // 缓存数据
      cache: {
        categories: [],
        provinces: [],
        cities: {}
      },

      // 页面状态
      pageState: {
        currentPage: '',
        loading: false,
        refreshing: false
      }
    }

    this.listeners = []
  }

  // 获取状态
  getState() {
    return this.state
  }

  // 设置状态
  setState(newState) {
    this.state = { ...this.state, ...newState }
    this.notifyListeners()
  }

  // 更新部分状态
  updateState(path, value) {
    const keys = path.split('.')
    let current = this.state

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {}
      }
      current = current[keys[i]]
    }

    current[keys[keys.length - 1]] = value
    this.notifyListeners()
  }

  // 添加监听器
  addListener(listener) {
    this.listeners.push(listener)
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  // 通知监听器
  notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.state)
      } catch (error) {
        console.error('状态监听器错误:', error)
      }
    })
  }

  // 用户相关方法
  setUserInfo(userInfo) {
    this.setState({ userInfo, isLogin: true })
  }

  setToken(token) {
    this.setState({ token })
  }

  clearUserInfo() {
    this.setState({
      userInfo: null,
      token: null,
      isLogin: false
    })
  }

  // 网络状态
  setNetworkStatus(status) {
    this.setState({ networkStatus: status })
  }

  // 应用配置
  setAppConfig(config) {
    this.setState({
      appConfig: { ...this.state.appConfig, ...config }
    })
  }

  // 缓存管理
  setCache(key, value) {
    this.updateState(`cache.${key}`, value)
  }

  getCache(key) {
    const keys = key.split('.')
    let current = this.state.cache

    for (const k of keys) {
      if (current && current[k] !== undefined) {
        current = current[k]
      } else {
        return null
      }
    }

    return current
  }

  clearCache(key) {
    if (key) {
      this.updateState(`cache.${key}`, null)
    } else {
      this.setState({ cache: {} })
    }
  }

  // 页面状态
  setPageState(state) {
    this.setState({
      pageState: { ...this.state.pageState, ...state }
    })
  }

  setLoading(loading) {
    this.setPageState({ loading })
  }

  setRefreshing(refreshing) {
    this.setPageState({ refreshing })
  }

  // 持久化存储
  saveToStorage() {
    try {
      const dataToSave = {
        userInfo: this.state.userInfo,
        token: this.state.token,
        isLogin: this.state.isLogin,
        appConfig: this.state.appConfig
      }

      uni.setStorageSync('appState', JSON.stringify(dataToSave))
    } catch (error) {
      console.error('保存状态失败:', error)
    }
  }

  // 从存储恢复
  loadFromStorage() {
    try {
      const savedData = uni.getStorageSync('appState')
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        this.setState(parsedData)
      }
    } catch (error) {
      console.error('恢复状态失败:', error)
    }
  }

  // 清除存储
  clearStorage() {
    try {
      uni.removeStorageSync('appState')
    } catch (error) {
      console.error('清除存储失败:', error)
    }
  }
}

// 创建全局状态实例
const store = new Store()

// 初始化时从存储恢复状态
store.loadFromStorage()

// 导出实例
export default store 