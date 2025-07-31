<template>
  <view class="welcome-container">
    <!-- 欢迎区域 -->
    <view class="welcome-section">
      <text class="welcome-title">
        欢迎
        <text v-if="!userInfo.nickname">游客</text>
        <text v-else>{{ userInfo.nickname }}</text>
        !
      </text>
    </view>

    <!-- 数据统计卡片 -->
    <view class="stats-section">
      <view class="stat-item">
        <text class="stat-label">当月订单总数</text>
        <text class="stat-value">{{ todoBean.monthOrderCount }}</text>
      </view>

      <view class="stat-item">
        <text class="stat-label">当月总花费(采购商品总额+采购差旅成本)</text>
        <text class="stat-value">{{ todoBean.monthPayMoneySum }}</text>
      </view>

      <view class="stat-item">
        <text class="stat-label">当月总销售额</text>
        <text class="stat-value">{{ todoBean.monthSaleMoneySum }}</text>
      </view>

      <view class="stat-item">
        <text class="stat-label">当月总利润</text>
        <text class="stat-value">{{ todoBean.monthProfit }}</text>
      </view>

      <view class="stat-item">
        <text class="stat-label">待备货数</text>
        <text class="stat-value">{{ todoBean.waitToBuy }}</text>
      </view>

      <view class="stat-item">
        <text class="stat-label">待发货</text>
        <text class="stat-value">{{ todoBean.waitToMail }}</text>
      </view>

      <view class="stat-item">
        <text class="stat-label">待收款</text>
        <text class="stat-value">{{ todoBean.waitToPay }}</text>
      </view>

      <view class="stat-item">
        <text class="stat-label">待回访</text>
        <text class="stat-value">{{ todoBean.waitToVisit }}</text>
      </view>
    </view>

    <!-- 进入按钮 -->
    <view class="enter-section">
      <button class="enter-btn" @click="goInto">进入业务管理系统</button>
    </view>
  </view>
</template>

<script>
import apiService from '../../utils/api.js'

export default {
  data() {
    return {
      userInfo: {},
      todoBean: {
        monthOrderCount: 0,
        monthPayMoneySum: 0,
        monthSaleMoneySum: 0,
        monthProfit: 0,
        waitToBuy: 0,
        waitToMail: 0,
        waitToPay: 0,
        waitToVisit: 0,
      },
    }
  },
  onLoad() {
    this.initData()
  },
  onShow() {
    this.loadHomepageData()
  },
  methods: {
    initData() {
      // 获取用户信息
      const userInfo = uni.getStorageSync('userInfo')
      if (userInfo) {
        this.userInfo = userInfo
      }
    },

    async loadHomepageData() {
      try {
        // 获取首页数据
        const response = await apiService.getHomepage({
          offline_id: this.userInfo.offline_id || 'abc',
        })

        if (response.success) {
          this.todoBean = response.data
        } else {
          console.error('加载首页数据失败:', response.message)
          this.loadMockData()
        }
      } catch (error) {
        console.error('加载首页数据失败:', error)
        this.loadMockData()
      }
    },

    loadMockData() {
      // 模拟数据
      this.todoBean = {
        monthOrderCount: 156,
        monthPayMoneySum: 89.5,
        monthSaleMoneySum: 120.3,
        monthProfit: 23.8,
        waitToBuy: 12,
        waitToMail: 25,
        waitToPay: 15,
        waitToVisit: 8,
      }
    },

    goInto() {
      // 进入主系统，跳转到订单页面作为主页面
      uni.switchTab({
        url: '/pages/order/order',
        success: () => {
          console.log('跳转到订单页面成功')
        },
        fail: (err) => {
          console.error('跳转到订单页面失败:', err)
          uni.showToast({
            title: '跳转失败',
            icon: 'none',
          })
        },
      })
    },
  },
}
</script>

<style scoped>
.welcome-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.welcome-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 40rpx 40rpx;
  color: #fff;
  text-align: center;
}

.welcome-title {
  font-size: 48rpx;
  font-weight: bold;
}

.stats-section {
  padding: 40rpx;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20rpx;
  padding: 20rpx;
  width: 100%;
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.stat-item:first-child {
  margin-top: 0;
}

.stat-label {
  font-size: 28rpx;
  color: #333;
  flex: 1;
  text-align: left;
}

.stat-value {
  font-size: 32rpx;
  color: #007aff;
  font-weight: bold;
  text-align: right;
}

.enter-section {
  padding: 40rpx;
  margin-top: 40rpx;
}

.enter-btn {
  width: 100%;
  height: 90rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 45rpx;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
}
</style>
