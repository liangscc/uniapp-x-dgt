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

    // 初始化应用
    this.initApp()

    // 检测网络状态
    this.checkNetworkStatus()

    // 检查登录状态
    this.checkLoginStatus()
  },

  onShow: function () {
    console.log('App Show')

    // 恢复网络监听
    this.startNetworkListener()
  },

  onHide: function () {
    console.log('App Hide')

    // 停止网络监听
    this.stopNetworkListener()
  },

  // 初始化应用
  initApp() {
    // 设置全局错误处理
    this.setupGlobalErrorHandler()

    // 初始化存储
    this.initStorage()
  },

  // 设置全局错误处理
  setupGlobalErrorHandler() {
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
    })
  },

  // 开始网络监听
  startNetworkListener() {
    uni.onNetworkStatusChange((res) => {
      this.globalData.networkStatus = res.isConnected
      if (!res.isConnected) {
        uni.showToast({
          title: '网络连接已断开',
          icon: 'none',
        })
      } else {
        uni.showToast({
          title: '网络已连接',
          icon: 'success',
        })
      }
    })
  },

  // 停止网络监听
  stopNetworkListener() {
    // 在UniApp中，网络监听会自动管理，这里只是标记
    console.log('停止网络监听')
  },

  // 检查登录状态
  checkLoginStatus() {
    if (this.globalData.isLogin) {
      // 验证token有效性
      this.validateToken()
    }
  },

  // 验证token
  validateToken() {
    // 这里可以调用API验证token有效性
    // 如果token无效，清除登录状态
    setTimeout(() => {
      // 模拟token验证
      if (Math.random() > 0.8) {
        // 20%概率token失效
        this.clearLoginStatus()
        uni.showToast({
          title: '登录已过期，请重新登录',
          icon: 'none',
        })
      }
    }, 1000)
  },

  // 清除登录状态
  clearLoginStatus() {
    this.globalData.userInfo = null
    this.globalData.token = null
    this.globalData.isLogin = false

    // 清除存储
    uni.removeStorageSync('userInfo')
    uni.removeStorageSync('token')
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
page {
  background-color: #f8f8f8;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial,
    sans-serif;
}

/* 通用容器样式 */
.container {
  padding: 20rpx;
}

/* 卡片样式 */
.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
}

/* 按钮样式 */
.btn-primary {
  background: linear-gradient(135deg, #007aff 0%, #0056cc 100%);
  color: #fff;
  border: none;
  border-radius: 12rpx;
  padding: 20rpx 40rpx;
  font-size: 28rpx;
  font-weight: 500;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
  border: 1rpx solid #ddd;
  border-radius: 12rpx;
  padding: 20rpx 40rpx;
  font-size: 28rpx;
}

/* 输入框样式 */
.input-field {
  background: #fff;
  border: 1rpx solid #e0e0e0;
  border-radius: 12rpx;
  padding: 24rpx;
  font-size: 28rpx;
  margin-bottom: 20rpx;
}

/* 状态标签样式 */
.status-tag {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: 500;
}

.status-success {
  background: #e8f5e8;
  color: #52c41a;
}

.status-warning {
  background: #fff7e6;
  color: #fa8c16;
}

.status-error {
  background: #fff2f0;
  color: #ff4d4f;
}

.status-info {
  background: #e6f7ff;
  color: #1890ff;
}

/* 加载状态 */
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  color: #999;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80rpx 40rpx;
  color: #999;
}

.empty-state image {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 20rpx;
}
</style>
