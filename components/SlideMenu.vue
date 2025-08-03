<template>
  <view class="slide-menu-container" v-if="visible">
    <!-- 遮罩层 -->
    <view class="mask" @click="closeMenu"></view>
    
    <!-- 侧滑菜单 -->
    <view class="slide-menu" :class="{ 'slide-in': visible }">
      <!-- 个人中心内容 -->
      <view class="profile-content">
        <!-- 用户信息头部 -->
        <view class="user-header">
          <view class="user-info">
            <view class="user-avatar">
              <text class="avatar-text">{{ userInfo.name.charAt(0) }}</text>
            </view>
            <view class="user-details">
              <text class="user-name">{{ userInfo.name }}</text>
              <text class="user-phone">{{ userInfo.phone }}</text>
              <text class="user-level">{{ userInfo.level }}</text>
            </view>
          </view>
        </view>

        <!-- 基本功能 -->
        <view class="section">
          <view class="section-title">基本功能</view>
          <view class="menu-list">
            <view class="menu-item" @click="handleMenuClick('editProfile')">
              <view class="menu-icon">👤</view>
              <text class="menu-text">编辑资料</text>
              <text class="menu-arrow">></text>
            </view>
            <view class="menu-item" @click="handleMenuClick('changePassword')">
              <view class="menu-icon">🔑</view>
              <text class="menu-text">改密码</text>
              <text class="menu-arrow">></text>
            </view>
            <view class="menu-item" @click="handleMenuClick('upgradeMember')">
              <view class="menu-icon">👑</view>
              <text class="menu-text">开通会员</text>
              <text class="menu-arrow">></text>
            </view>
          </view>
        </view>

        <!-- 设置 -->
        <view class="section">
          <view class="section-title">设置</view>
          <view class="menu-list">
            <view class="menu-item" @click="handleMenuClick('customColors')">
              <view class="menu-icon">🎨</view>
              <text class="menu-text">自定义颜色</text>
              <text class="menu-arrow">></text>
            </view>
            <view class="menu-item" @click="handleMenuClick('customCategories')">
              <view class="menu-icon">📂</view>
              <text class="menu-text">自定义分类</text>
              <text class="menu-arrow">></text>
            </view>
            <view class="menu-item">
              <view class="menu-icon">🔔</view>
              <text class="menu-text">消息通知</text>
              <switch
                :checked="settings.notifications"
                @change="toggleNotifications"
              />
            </view>
            <view class="menu-item">
              <view class="menu-icon">👁️</view>
              <text class="menu-text">隐藏金额</text>
              <switch :checked="settings.hideAmount" @change="toggleHideAmount" />
            </view>
          </view>
        </view>

        <!-- 退出登录 -->
        <view class="logout-section">
          <button class="logout-btn" @click="handleLogout">退出登录</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'SlideMenu',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      userInfo: {
        name: '管理员',
        phone: '138****8888',
        level: 'VIP会员',
      },
      settings: {
        notifications: true,
        hideAmount: false,
      },
    }
  },
  methods: {
    closeMenu() {
      this.$emit('close')
    },
    
    handleMenuClick(action) {
      this.closeMenu()
      switch (action) {
        case 'editProfile':
          uni.showToast({
            title: '编辑资料功能开发中',
            icon: 'none',
          })
          break
        case 'changePassword':
          uni.showToast({
            title: '改密码功能开发中',
            icon: 'none',
          })
          break
        case 'upgradeMember':
          uni.showToast({
            title: '开通会员功能开发中',
            icon: 'none',
          })
          break
        case 'customColors':
          uni.showToast({
            title: '自定义颜色功能开发中',
            icon: 'none',
          })
          break
        case 'customCategories':
          uni.showToast({
            title: '自定义分类功能开发中',
            icon: 'none',
          })
          break
      }
    },
    
    toggleNotifications(e) {
      this.settings.notifications = e.detail.value
      uni.showToast({
        title: this.settings.notifications ? '已开启通知' : '已关闭通知',
        icon: 'none',
      })
    },
    
    toggleHideAmount(e) {
      this.settings.hideAmount = e.detail.value
      uni.showToast({
        title: this.settings.hideAmount ? '已隐藏金额' : '已显示金额',
        icon: 'none',
      })
    },
    
    handleLogout() {
      uni.showModal({
        title: '确认退出',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            this.closeMenu()
            uni.reLaunch({
              url: '/pages/login/login',
            })
          }
        },
      })
    }
  }
}
</script>

<style scoped>
.slide-menu-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  pointer-events: auto;
}

.mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  animation: fadeIn 0.3s ease;
  z-index: 9998;
  /* 确保覆盖tabBar */
  height: 100vh;
}

.slide-menu {
  position: fixed;
  top: 0;
  left: -100%;
  width: 80%;
  height: 100vh;
  background: #fff;
  box-shadow: 2rpx 0 20rpx rgba(0, 0, 0, 0.1);
  transition: left 0.3s ease;
  overflow-y: auto;
  z-index: 10000;
  /* 确保覆盖tabBar */
  bottom: 0;
}

.slide-menu.slide-in {
  left: 0;
}

.profile-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.user-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 40rpx 40rpx;
  color: #fff;
  padding-top: calc(60rpx + var(--status-bar-height));
}

.user-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  margin-right: 30rpx;
}

.avatar-text {
  width: 100rpx;
  height: 100rpx;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  font-weight: bold;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.user-phone {
  font-size: 28rpx;
  opacity: 0.8;
  margin-bottom: 5rpx;
}

.user-level {
  font-size: 24rpx;
  background: rgba(255, 255, 255, 0.2);
  padding: 4rpx 12rpx;
  border-radius: 15rpx;
  align-self: flex-start;
}

.section {
  padding: 40rpx;
  flex: 1;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 25rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  width: 60rpx;
  height: 60rpx;
  background: #f8f9fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  margin-right: 25rpx;
}

.menu-text {
  font-size: 30rpx;
  color: #333;
  font-weight: bold;
  flex: 1;
}

.menu-arrow {
  font-size: 28rpx;
  color: #ccc;
}

.logout-section {
  padding: 40rpx;
}

.logout-btn {
  width: 100%;
  height: 88rpx;
  background: #ff3b30;
  color: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;
  border: none;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style> 