<template>
  <view id="app">
    <!-- 页面内容会在这里显示 -->
  </view>
</template>

<script>
export default {
  globalData: {
    userInfo: null,
    token: null,
    isLogin: false,
    networkStatus: true,
  },

  onLaunch: function () {
    console.log('App Launch')

    // 简化初始化，避免方法调用错误
    try {
      // 直接初始化存储
      this.initStorage()
      
      // 检查网络状态
      this.checkNetworkStatus()
      
      // 检查登录状态
      this.checkLoginStatus()
    } catch (error) {
      console.error('应用初始化失败:', error)
    }
  },

  onShow: function () {
    console.log('App Show')
    // 暂时注释掉网络监听，避免错误
    // this.startNetworkListener()
  },

  onHide: function () {
    console.log('App Hide')
    // 暂时注释掉网络监听，避免错误
    // this.stopNetworkListener()
  },

  // 初始化应用（简化版）
  initApp() {
    try {
      // 设置全局错误处理
      this.setupGlobalErrorHandler()

      // 初始化存储
      this.initStorage()
    } catch (error) {
      console.error('初始化应用失败:', error)
    }
  },

  // 设置全局错误处理
  setupGlobalErrorHandler() {
    try {
      // 捕获未处理的Promise错误
      uni.onUnhandledRejection(({ reason, promise }) => {
        console.error('未处理的Promise错误:', reason)
        uni.showToast({
          title: '操作失败，请重试',
          icon: 'none',
        })
      })

      // 捕获全局错误
      uni.onError((error) => {
        console.error('全局错误:', error)
        uni.showToast({
          title: '系统异常，请重启应用',
          icon: 'none',
        })
      })
    } catch (error) {
      console.error('设置全局错误处理失败:', error)
    }
  },

  // 初始化存储
  initStorage() {
    try {
      // 获取存储的用户信息
      const userInfo = uni.getStorageSync('userInfo')
      const token = uni.getStorageSync('token')

      if (userInfo && token) {
        this.globalData.userInfo = userInfo
        this.globalData.token = token
        this.globalData.isLogin = true
      }
    } catch (error) {
      console.error('初始化存储失败:', error)
    }
  },

  // 检查网络状态
  checkNetworkStatus() {
    try {
      uni.getNetworkType({
        success: (res) => {
          this.globalData.networkStatus = res.networkType !== 'none'
          if (!this.globalData.networkStatus) {
            uni.showToast({
              title: '网络连接异常',
              icon: 'none',
            })
          }
        },
        fail: (error) => {
          console.error('获取网络状态失败:', error)
          this.globalData.networkStatus = true // 默认认为有网络
        }
      })
    } catch (error) {
      console.error('检查网络状态失败:', error)
      this.globalData.networkStatus = true // 默认认为有网络
    }
  },

  // 开始网络监听（简化版）
  startNetworkListener() {
    console.log('网络监听功能已禁用')
    // 暂时禁用网络监听功能，避免错误
  },

  // 停止网络监听（简化版）
  stopNetworkListener() {
    console.log('网络监听功能已禁用')
    // 暂时禁用网络监听功能，避免错误
  },

  // 检查登录状态
  checkLoginStatus() {
    try {
      if (this.globalData.isLogin) {
        // 验证token有效性
        this.validateToken()
      }
    } catch (error) {
      console.error('检查登录状态失败:', error)
    }
  },

  // 验证token
  validateToken() {
    try {
      // 这里可以调用API验证token有效性
      // 如果token无效，清除登录状态
      setTimeout(() => {
        try {
          // 模拟token验证
          if (Math.random() > 0.8) {
            // 20%概率token失效
            this.clearLoginStatus()
            uni.showToast({
              title: '登录已过期，请重新登录',
              icon: 'none',
            })
          }
        } catch (error) {
          console.error('验证token失败:', error)
        }
      }, 1000)
    } catch (error) {
      console.error('验证token失败:', error)
    }
  },

  // 清除登录状态
  clearLoginStatus() {
    try {
      this.globalData.userInfo = null
      this.globalData.token = null
      this.globalData.isLogin = false

      // 清除存储
      uni.removeStorageSync('userInfo')
      uni.removeStorageSync('token')
    } catch (error) {
      console.error('清除登录状态失败:', error)
    }
  },

  // 保存登录状态
  saveLoginStatus(userInfo, token) {
    this.globalData.userInfo = userInfo
    this.globalData.token = token
    this.globalData.isLogin = true

    // 保存到存储
    uni.setStorageSync('userInfo', userInfo)
    uni.setStorageSync('token', token)
  },
}
</script>

<style>
/*每个页面公共css */
/* 官方 css 库 */
@import './common/uni.css';
/* UI设计规范样式 */
@import './common/ui-design.css';
/* iconfont */
@import './common/iconfont/iconfont.css';
/* 动画库 */
@import './common/animate.min.css';

/* 全局样式 */
*,
*:before,
*:after {
  box-sizing: border-box;
}

/* 应用容器 */
#app {
  min-height: 100vh;
}

/* 通用容器样式 */
.container {
  padding: var(--spacing-md);
}

/* 加载状态 */
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  color: var(--text-tertiary);
}
</style>
