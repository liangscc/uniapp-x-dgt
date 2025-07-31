<template>
  <view class="profile-container">
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
      <view class="user-actions">
        <text class="action-btn" @click="editProfile">编辑资料</text>
      </view>
    </view>

    <!-- 基本功能 -->
    <view class="section">
      <view class="section-title">基本功能</view>
      <view class="menu-list">
        <view class="menu-item" @click="otherLogin">
          <view class="menu-icon">🔐</view>
          <text class="menu-text">其他登录</text>
          <text class="menu-desc">微信、微博、QQ登录</text>
          <text class="menu-arrow">></text>
        </view>
        <view class="menu-item" @click="backup">
          <view class="menu-icon">💾</view>
          <text class="menu-text">备份</text>
          <text class="menu-desc">数据全备份</text>
          <text class="menu-arrow">></text>
        </view>
        <view class="menu-item" @click="restore">
          <view class="menu-icon">🔄</view>
          <text class="menu-text">还原</text>
          <text class="menu-desc">按备份编号还原</text>
          <text class="menu-arrow">></text>
        </view>
        <view class="menu-item" @click="changePassword">
          <view class="menu-icon">🔑</view>
          <text class="menu-text">改密码</text>
          <text class="menu-desc">修改登录密码</text>
          <text class="menu-arrow">></text>
        </view>
        <view class="menu-item" @click="upgradeMember">
          <view class="menu-icon">👑</view>
          <text class="menu-text">开通会员</text>
          <text class="menu-desc">认证会员等级</text>
          <text class="menu-arrow">></text>
        </view>
      </view>
    </view>

    <!-- 高级功能 -->
    <view class="section">
      <view class="section-title">高级功能</view>
      <view class="menu-list">
        <view class="menu-item" @click="dailyReport">
          <view class="menu-icon">📊</view>
          <text class="menu-text">每日简报</text>
          <text class="menu-desc">查看每日情况汇总</text>
          <text class="menu-arrow">></text>
        </view>
        <view class="menu-item" @click="reminderMonitor">
          <view class="menu-icon">🔔</view>
          <text class="menu-text">提醒监控</text>
          <text class="menu-desc">设置催账、到货提醒</text>
          <text class="menu-arrow">></text>
        </view>
      </view>
    </view>

    <!-- 设置 -->
    <view class="section">
      <view class="section-title">设置</view>
      <view class="menu-list">
        <view class="menu-item" @click="shareApp">
          <view class="menu-icon">📤</view>
          <text class="menu-text">分享APP</text>
          <text class="menu-desc">分享到微信、QQ、微博</text>
          <text class="menu-arrow">></text>
        </view>
        <view class="menu-item" @click="passwordlessLogin">
          <view class="menu-icon">🔓</view>
          <text class="menu-text">免密登录</text>
          <text class="menu-desc">设置时间内免密码登录</text>
          <text class="menu-arrow">></text>
        </view>
        <view class="menu-item" @click="customExchangeRate">
          <view class="menu-icon">💱</view>
          <text class="menu-text">自定义汇率</text>
          <text class="menu-desc">设置货币对人民币汇率</text>
          <text class="menu-arrow">></text>
        </view>
        <view class="menu-item" @click="customColors">
          <view class="menu-icon">🎨</view>
          <text class="menu-text">自定义颜色</text>
          <text class="menu-desc">用不同颜色代表状态</text>
          <text class="menu-arrow">></text>
        </view>
        <view class="menu-item" @click="customCategories">
          <view class="menu-icon">📂</view>
          <text class="menu-text">自定义商品分类</text>
          <text class="menu-desc">设置商品多级分类</text>
          <text class="menu-arrow">></text>
        </view>
        <view class="menu-item">
          <view class="menu-icon">🔔</view>
          <text class="menu-text">消息通知开关</text>
          <text class="menu-desc">控制消息推送</text>
          <switch
            :checked="settings.notifications"
            @change="toggleNotifications"
          />
        </view>
        <view class="menu-item">
          <view class="menu-icon">👁️</view>
          <text class="menu-text">隐藏金额开关</text>
          <text class="menu-desc">隐藏敏感金额信息</text>
          <switch :checked="settings.hideAmount" @change="toggleHideAmount" />
        </view>
        <view class="menu-item" @click="contactUs">
          <view class="menu-icon">📞</view>
          <text class="menu-text">联系我们</text>
          <text class="menu-desc">客服联系方式</text>
          <text class="menu-arrow">></text>
        </view>
        <view class="menu-item" @click="aboutSoftware">
          <view class="menu-icon">ℹ️</view>
          <text class="menu-text">关于软件</text>
          <text class="menu-desc">版本信息和版权</text>
          <text class="menu-arrow">></text>
        </view>
        <view class="menu-item" @click="helpAndFeedback">
          <view class="menu-icon">❓</view>
          <text class="menu-text">帮助与留言</text>
          <text class="menu-desc">使用帮助和反馈</text>
          <text class="menu-arrow">></text>
        </view>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-section">
      <button class="logout-btn" @click="logout">退出登录</button>
    </view>
  </view>
</template>

<script>
export default {
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
    editProfile() {
      uni.showToast({
        title: '编辑资料功能开发中',
        icon: 'none',
      })
    },

    otherLogin() {
      uni.showToast({
        title: '其他登录功能开发中',
        icon: 'none',
      })
    },

    backup() {
      uni.showToast({
        title: '备份功能开发中',
        icon: 'none',
      })
    },

    restore() {
      uni.showToast({
        title: '还原功能开发中',
        icon: 'none',
      })
    },

    changePassword() {
      uni.showToast({
        title: '改密码功能开发中',
        icon: 'none',
      })
    },

    upgradeMember() {
      uni.showToast({
        title: '开通会员功能开发中',
        icon: 'none',
      })
    },

    dailyReport() {
      uni.showToast({
        title: '每日简报功能开发中',
        icon: 'none',
      })
    },

    reminderMonitor() {
      uni.showToast({
        title: '提醒监控功能开发中',
        icon: 'none',
      })
    },

    shareApp() {
      uni.showToast({
        title: '分享APP功能开发中',
        icon: 'none',
      })
    },

    passwordlessLogin() {
      uni.showToast({
        title: '免密登录功能开发中',
        icon: 'none',
      })
    },

    customExchangeRate() {
      uni.showToast({
        title: '自定义汇率功能开发中',
        icon: 'none',
      })
    },

    customColors() {
      uni.showToast({
        title: '自定义颜色功能开发中',
        icon: 'none',
      })
    },

    customCategories() {
      uni.showToast({
        title: '自定义商品分类功能开发中',
        icon: 'none',
      })
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

    contactUs() {
      uni.showToast({
        title: '联系我们功能开发中',
        icon: 'none',
      })
    },

    aboutSoftware() {
      uni.showToast({
        title: '关于软件功能开发中',
        icon: 'none',
      })
    },

    helpAndFeedback() {
      uni.showToast({
        title: '帮助与留言功能开发中',
        icon: 'none',
      })
    },

    logout() {
      uni.showModal({
        title: '确认退出',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            uni.reLaunch({
              url: '/pages/login/login',
            })
          }
        },
      })
    },
  },
}
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.user-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 40rpx 40rpx;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.action-btn {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 15rpx 30rpx;
  border-radius: 25rpx;
  font-size: 26rpx;
}

.section {
  background: #fff;
  margin: 20rpx 40rpx;
  border-radius: 20rpx;
  padding: 40rpx;
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
  margin-bottom: 5rpx;
}

.menu-desc {
  font-size: 24rpx;
  color: #999;
}

.menu-arrow {
  font-size: 28rpx;
  color: #ccc;
  margin-left: auto;
}

.logout-section {
  padding: 0 40rpx;
  margin-top: 40rpx;
}

.logout-btn {
  width: 100%;
  height: 88rpx;
  background: #ff3b30;
  color: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;
}
</style>
