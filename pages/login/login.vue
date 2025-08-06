<template>
  <view class="login-container">
    <!-- 顶部Logo区域 -->
    <view class="logo-section">
      <image class="logo-image" src="/static/logo.png" mode="aspectFit"></image>
      <text class="app-name">业务管理系统</text>
      <text class="app-slogan">高效管理，智能决策</text>
    </view>

    <!-- 登录表单 -->
    <view class="login-form">
      <view class="form-item">
        <text class="form-label">离线ID</text>
        <input
          class="form-input"
          type="text"
          placeholder="请输入离线ID"
          v-model="loginForm.offline_id"
        />
      </view>

      <view class="form-item">
        <text class="form-label">手机号</text>
        <input
          class="form-input"
          type="number"
          placeholder="请输入手机号"
          v-model="loginForm.tel_no"
          maxlength="11"
        />
      </view>

      <view class="form-item">
        <text class="form-label">密码</text>
        <input
          class="form-input"
          type="password"
          placeholder="请输入密码"
          v-model="loginForm.password"
        />
      </view>

      <view class="form-options">
        <text class="remember-pwd" @click="toggleRemember">
          <text class="checkbox" :class="{ checked: rememberPassword }">✓</text>
          记住密码
        </text>
        <text class="forgot-pwd" @click="forgotPassword">忘记密码？</text>
      </view>

      <button class="login-btn" @click="handleLogin">登录</button>

      <!-- 测试跳转按钮 -->
      <button class="test-btn" @click="testJump">测试跳转</button>
      <button class="test-btn" @click="testJumpToOrder">跳转到欢迎页</button>

      <view class="register-link">
        <text>还没有账号？</text>
        <text class="register-text" @click="goToRegister">立即注册</text>
      </view>
    </view>

    <!-- 第三方登录 -->
    <view class="third-party-login">
      <view class="divider">
        <text class="divider-text">其他登录方式</text>
      </view>

      <view class="third-party-buttons">
        <view class="third-party-btn wechat" @click="thirdPartyLogin('wechat')">
          <text class="third-party-icon">微</text>
          <text class="third-party-text">微信</text>
        </view>
        <view class="third-party-btn qq" @click="thirdPartyLogin('qq')">
          <text class="third-party-icon">Q</text>
          <text class="third-party-text">QQ</text>
        </view>
        <view class="third-party-btn weibo" @click="thirdPartyLogin('weibo')">
          <text class="third-party-icon">微</text>
          <text class="third-party-text">微博</text>
        </view>
      </view>
    </view>

    <!-- 底部协议 -->
    <view class="agreement-section">
      <text class="agreement-text">
        登录即表示同意
        <text class="agreement-link" @click="viewUserAgreement"
          >《用户协议》</text
        >
        和
        <text class="agreement-link" @click="viewPrivacyPolicy"
          >《隐私政策》</text
        >
      </text>
    </view>
  </view>
</template>

<script>
import apiService from '../../utils/api.js'

export default {
  data() {
    return {
      loginForm: {
        offline_id: 'abc',
        tel_no: '17709816336',
        password: '1',
      },
      rememberPassword: false,
    }
  },
  
  onLoad() {
    // 检查是否是从登录状态校验失败跳转过来的
    const isFromAuthFail = uni.getStorageSync('authFailRedirect')
    if (isFromAuthFail) {
      uni.removeStorageSync('authFailRedirect')
      // 自动登录
      this.autoLogin()
    }
  },
  methods: {
    // 自动登录方法
    async autoLogin() {
      console.log('开始自动登录')
      try {
        const response = await apiService.login({
          offline_id: this.loginForm.offline_id,
          tel_no: this.loginForm.tel_no,
          password: this.loginForm.password,
        })

        console.log('自动登录响应:', response)

        if (response.success || response.code === 1) {
          // 保存登录状态和用户信息
          const userInfo = response.data || response || {
            offline_id: this.loginForm.offline_id,
            tel_no: this.loginForm.tel_no,
            nickname: '测试用户',
            token: 'mock-token-' + Date.now()
          }

          console.log('保存用户信息:', userInfo)
          
          uni.setStorageSync('isLoggedIn', true)
          uni.setStorageSync('userInfo', userInfo)
          uni.setStorageSync('token', userInfo.token || 'mock-token-' + Date.now())

          uni.showToast({
            title: '自动登录成功',
            icon: 'success',
          })

          // 跳转到welcome欢迎页面
          setTimeout(() => {
            uni.reLaunch({
              url: '/pages/welcome/welcome'
            })
          }, 1500)
        } else {
          console.log('自动登录失败，显示登录表单')
        }
      } catch (error) {
        console.error('自动登录失败:', error)
        console.log('自动登录失败，显示登录表单')
      }
    },

    async handleLogin() {
      // 验证离线ID
      if (!this.loginForm.offline_id) {
        uni.showToast({
          title: '请输入离线ID',
          icon: 'none',
        })
        return
      }

      // 验证手机号
      if (!this.loginForm.tel_no) {
        uni.showToast({
          title: '请输入手机号',
          icon: 'none',
        })
        return
      }

      if (!/^1[3-9]\d{9}$/.test(this.loginForm.tel_no)) {
        uni.showToast({
          title: '请输入正确的手机号',
          icon: 'none',
        })
        return
      }

      // 验证密码
      if (!this.loginForm.password) {
        uni.showToast({
          title: '请输入密码',
          icon: 'none',
        })
        return
      }

      // 显示加载提示
      uni.showLoading({
        title: '登录中...',
      })

      try {
        // 调用登录API
        console.log('发送登录请求:', {
          offline_id: this.loginForm.offline_id,
          tel_no: this.loginForm.tel_no,
          password: this.loginForm.password,
        })

        const response = await apiService.login({
          offline_id: this.loginForm.offline_id,
          tel_no: this.loginForm.tel_no,
          password: this.loginForm.password,
        })

        uni.hideLoading()

        // 处理登录响应
        console.log('登录响应:', response)

        // 模拟成功登录（用于测试）
        const mockSuccess = false // 临时设置为false，使用真实API响应

        if (mockSuccess || response.success || response.code === 1) {
          // 保存登录状态和用户信息
          const userInfo = response.data ||
            response || {
              offline_id: this.loginForm.offline_id,
              tel_no: this.loginForm.tel_no,
              nickname: '测试用户',
              token: 'mock-token-' + Date.now()
            }

          console.log('保存用户信息:', userInfo)
          
          uni.setStorageSync('isLoggedIn', true)
          uni.setStorageSync('userInfo', userInfo)
          uni.setStorageSync('token', userInfo.token || 'mock-token-' + Date.now())

          uni.showToast({
            title: '登录成功',
            icon: 'success',
          })

          // 跳转到welcome欢迎页面
          console.log('准备跳转到welcome欢迎页面')

          // 使用navigateTo跳转到welcome页面
          uni.navigateTo({
            url: '/pages/welcome/welcome',
            success: () => {
              console.log('navigateTo跳转成功')
            },
            fail: (err) => {
              console.error('navigateTo跳转失败:', err)
              // 如果navigateTo失败，使用reLaunch
              uni.reLaunch({
                url: '/pages/welcome/welcome',
                success: () => {
                  console.log('reLaunch跳转成功')
                },
                fail: (err2) => {
                  console.error('reLaunch也失败:', err2)
                  uni.showToast({
                    title: '页面跳转失败',
                    icon: 'none',
                  })
                },
              })
            },
          })
        } else {
          uni.showToast({
            title: response.message || '登录失败',
            icon: 'none',
          })
        }
      } catch (error) {
        uni.hideLoading()
        console.error('登录失败:', error)
        uni.showToast({
          title: '网络错误，请重试',
          icon: 'none',
        })
      }
    },

    toggleRemember() {
      this.rememberPassword = !this.rememberPassword
    },

    async forgotPassword() {
      uni.showToast({
        title: '忘记密码功能开发中',
        icon: 'none',
      })
    },

    async goToRegister() {
      uni.showToast({
        title: '注册功能开发中',
        icon: 'none',
      })
    },

    async thirdPartyLogin(type) {
      uni.showToast({
        title: `${type}登录功能开发中`,
        icon: 'none',
      })
    },

    async viewUserAgreement() {
      uni.showToast({
        title: '用户协议功能开发中',
        icon: 'none',
      })
    },

    async viewPrivacyPolicy() {
      uni.showToast({
        title: '隐私政策功能开发中',
        icon: 'none',
      })
    },

    testJump() {
      console.log('测试跳转')

      // 简单的跳转测试
      uni.showToast({
        title: '开始测试跳转',
        icon: 'none',
      })

      setTimeout(() => {
        uni.navigateTo({
          url: '/pages/welcome/welcome',
          success: () => {
            console.log('跳转成功')
            uni.showToast({
              title: '跳转成功',
              icon: 'success',
            })
          },
          fail: (err) => {
            console.error('跳转失败:', err)
            uni.showToast({
              title: `跳转失败: ${err.errMsg}`,
              icon: 'none',
            })
          },
        })
      }, 1000)
    },

    testJumpToOrder() {
      console.log('测试跳转到welcome页')
      uni.navigateTo({
        url: '/pages/welcome/welcome',
        success: () => {
          console.log('跳转到welcome页成功')
          uni.showToast({
            title: '跳转到welcome页成功',
            icon: 'success',
          })
        },
        fail: (err) => {
          console.error('跳转到welcome页失败:', err)
          uni.showToast({
            title: '跳转到welcome页失败',
            icon: 'none',
          })
        },
      })
    },
  },
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 40rpx;
  display: flex;
  flex-direction: column;
}

.logo-section {
  text-align: center;
  margin-bottom: 80rpx;
  margin-top: 60rpx;
}

.logo-image {
  width: 120rpx;
  height: 120rpx;
  margin-bottom: 30rpx;
}

.app-name {
  display: block;
  font-size: 48rpx;
  color: #fff;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.app-slogan {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.login-form {
  background: #fff;
  border-radius: 30rpx;
  padding: 60rpx 40rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
}

.form-item {
  margin-bottom: 40rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 20rpx;
  font-weight: bold;
}

.form-input {
  width: 100%;
  height: 80rpx;
  background: #f8f9fa;
  border-radius: 15rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
  color: #333;
  border: 2rpx solid transparent;
  transition: all 0.3s;
}

.form-input:focus {
  border-color: #667eea;
  background: #fff;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 50rpx;
}

.remember-pwd {
  display: flex;
  align-items: center;
  font-size: 26rpx;
  color: #666;
}

.checkbox {
  width: 30rpx;
  height: 30rpx;
  border: 2rpx solid #ddd;
  border-radius: 6rpx;
  margin-right: 15rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  color: transparent;
  transition: all 0.3s;
}

.checkbox.checked {
  background: #667eea;
  border-color: #667eea;
  color: #fff;
}

.forgot-pwd {
  font-size: 26rpx;
  color: #667eea;
}

.login-btn {
  width: 100%;
  height: 90rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 45rpx;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
  margin-bottom: 20rpx;
}

.test-btn {
  width: 100%;
  height: 60rpx;
  background: #ff9500;
  color: #fff;
  border-radius: 30rpx;
  font-size: 24rpx;
  font-weight: bold;
  border: none;
  margin-bottom: 40rpx;
}

.register-link {
  text-align: center;
  font-size: 26rpx;
  color: #666;
}

.register-text {
  color: #667eea;
  margin-left: 10rpx;
}

.third-party-login {
  margin-bottom: 40rpx;
}

.divider {
  position: relative;
  text-align: center;
  margin-bottom: 40rpx;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1rpx;
  background: rgba(255, 255, 255, 0.3);
}

.divider-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 0 30rpx;
  font-size: 26rpx;
  position: relative;
  z-index: 1;
}

.third-party-buttons {
  display: flex;
  justify-content: space-around;
}

.third-party-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20rpx;
  backdrop-filter: blur(10rpx);
}

.third-party-icon {
  width: 60rpx;
  height: 60rpx;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: bold;
  margin-bottom: 15rpx;
}

.third-party-btn.wechat .third-party-icon {
  color: #07c160;
}

.third-party-btn.qq .third-party-icon {
  color: #12b7f5;
}

.third-party-btn.weibo .third-party-icon {
  color: #e6162d;
}

.third-party-text {
  font-size: 24rpx;
  color: #fff;
}

.agreement-section {
  text-align: center;
  margin-top: auto;
}

.agreement-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
}

.agreement-link {
  color: #fff;
  text-decoration: underline;
}
</style>
