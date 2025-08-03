<template>
  <view class="slide-menu-container" v-if="visible">
    <!-- 遮罩层 -->
    <view class="mask" @click="closeMenu"></view>
    
    <!-- 侧滑菜单 -->
    <view class="slide-menu" :class="{ 'slide-in': visible }">
      <!-- 菜单内容 -->
      <view class="menu-content">
        <!-- 头部区域 -->
        <view class="margin-top" :style="{ paddingTop: statusBarHeight + 'px' }">
          <view class="close-icon" @click="closeMenu">
            <text class="icon">✕</text>
          </view>
          <view class="user-item" @click="gotoUserPage">
            <view class="user-avatar">
              <image 
                :src="userInfo.avatar || '/static/default-avatar.png'" 
                class="avatar-img"
                mode="aspectFill"
              />
            </view>
            <view class="user-info">
              <text class="username">{{ userInfo.name }}</text>
              <text class="user-desc">查看个人主页或编辑简介</text>
            </view>
          </view>
        </view>

        <!-- 菜单列表 -->
        <view class="list-wrap">
          <view class="menu-list">
            <view class="menu-item" @click="openPage('todoPage')">
              <view class="menu-icon">📋</view>
              <text class="menu-text">待办查看</text>
              <view class="menu-arrow">›</view>
            </view>
            <view class="menu-item" @click="openPage('settingCategoryPage')">
              <view class="menu-icon">📂</view>
              <text class="menu-text">商品分类设置</text>
              <view class="menu-arrow">›</view>
            </view>
            <view class="menu-item" @click="openPage('settingExchangeratePage')">
              <view class="menu-icon">💱</view>
              <text class="menu-text">汇率设置</text>
              <view class="menu-arrow">›</view>
            </view>
            <view class="menu-item" @click="openPage('settingColorPage')">
              <view class="menu-icon">🎨</view>
              <text class="menu-text">颜色设置</text>
              <view class="menu-arrow">›</view>
            </view>
            <view class="menu-item" @click="openPage('settingSharePage')">
              <view class="menu-icon">📤</view>
              <text class="menu-text">分享</text>
              <view class="menu-arrow">›</view>
            </view>
            <view class="menu-item" @click="openPage('settingMemberPage')">
              <view class="menu-icon">👑</view>
              <text class="menu-text">开通会员</text>
              <view class="menu-arrow">›</view>
            </view>
            <view class="menu-item" @click="openPage('settingHelpPage')">
              <view class="menu-icon">❓</view>
              <text class="menu-text">帮助与留言</text>
              <view class="menu-arrow">›</view>
            </view>
            <view class="menu-item" @click="openPage('settingContactusPage')">
              <view class="menu-icon">📞</view>
              <text class="menu-text">联系我们</text>
              <view class="menu-arrow">›</view>
            </view>
          </view>
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
      statusBarHeight: 0,
      userInfo: {
        name: '管理员',
        avatar: '',
        phone: '138****8888',
        level: 'VIP会员',
      },
    }
  },
  mounted() {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight || 0
  },
  methods: {
    closeMenu() {
      this.$emit('close')
    },
    
    gotoUserPage() {
      this.closeMenu()
      uni.showToast({
        title: '个人主页功能开发中',
        icon: 'none',
      })
    },
    
    openPage(pageName) {
      this.closeMenu()
      switch (pageName) {
        case 'todoPage':
          uni.showToast({
            title: '待办查看功能开发中',
            icon: 'none',
          })
          break
        case 'settingCategoryPage':
          uni.showToast({
            title: '商品分类设置功能开发中',
            icon: 'none',
          })
          break
        case 'settingExchangeratePage':
          uni.showToast({
            title: '汇率设置功能开发中',
            icon: 'none',
          })
          break
        case 'settingColorPage':
          uni.showToast({
            title: '颜色设置功能开发中',
            icon: 'none',
          })
          break
        case 'settingSharePage':
          uni.showToast({
            title: '分享功能开发中',
            icon: 'none',
          })
          break
        case 'settingMemberPage':
          uni.showToast({
            title: '开通会员功能开发中',
            icon: 'none',
          })
          break
        case 'settingHelpPage':
          uni.showToast({
            title: '帮助与留言功能开发中',
            icon: 'none',
          })
          break
        case 'settingContactusPage':
          uni.showToast({
            title: '联系我们功能开发中',
            icon: 'none',
          })
          break
      }
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
  background: rgba(0, 0, 0, 0.4);
  animation: fadeIn 0.3s ease;
  z-index: 9998;
  height: 100vh;
  backdrop-filter: blur(4rpx);
}

.slide-menu {
  position: fixed;
  top: 0;
  left: -100%;
  width: 85%;
  height: 100vh;
  background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
  box-shadow: 8rpx 0 40rpx rgba(0, 0, 0, 0.15);
  transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
  z-index: 10000;
  bottom: 0;
  border-radius: 0 24rpx 24rpx 0;
}

.slide-menu.slide-in {
  left: 0;
}

.menu-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.margin-top {
  padding: 30rpx 40rpx;
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 0 24rpx 0 0;
}

.close-icon {
  position: absolute;
  top: 30rpx;
  right: 40rpx;
  width: 70rpx;
  height: 70rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  backdrop-filter: blur(10rpx);
}

.close-icon .icon {
  font-size: 28rpx;
  color: #fff;
  font-weight: 300;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 40rpx 0;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
}

.user-avatar {
  margin-right: 30rpx;
  position: relative;
}

.avatar-img {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: 4rpx solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.username {
  font-size: 40rpx;
  font-weight: 600;
  color: #fff;
  margin-bottom: 12rpx;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.user-desc {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
}

.list-wrap {
  flex: 1;
  padding: 40rpx 0;
}

.menu-list {
  display: flex;
  flex-direction: column;
  padding: 0 40rpx;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 32rpx 24rpx;
  margin-bottom: 8rpx;
  border-radius: 16rpx;
  background: #fff;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.menu-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: -1;
}

.menu-item:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.menu-item:active::before {
  opacity: 0.05;
}

.menu-icon {
  width: 60rpx;
  height: 60rpx;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  margin-right: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.menu-text {
  font-size: 32rpx;
  color: #2c3e50;
  font-weight: 500;
  flex: 1;
}

.menu-arrow {
  font-size: 32rpx;
  color: #bdc3c7;
  font-weight: 300;
  transition: transform 0.2s ease;
}

.menu-item:active .menu-arrow {
  transform: translateX(4rpx);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 滚动条样式 */
.slide-menu::-webkit-scrollbar {
  width: 6rpx;
}

.slide-menu::-webkit-scrollbar-track {
  background: transparent;
}

.slide-menu::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3rpx;
}

.slide-menu::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}
</style> 