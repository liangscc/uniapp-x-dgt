<template>
  <view class="customer-detail-container">
    <!-- 客户基本信息 -->
    <view class="customer-info-section">
      <view class="customer-header">
        <view class="customer-avatar">
          <text class="avatar-text">{{ customerInfo.name.charAt(0) }}</text>
          <view class="vip-badge" v-if="customerInfo.isVip">VIP</view>
        </view>
        <view class="customer-details">
          <text class="customer-name">{{ customerInfo.name }}</text>
          <text class="customer-level">{{ customerInfo.levelText }}</text>
          <text class="customer-phone">{{ customerInfo.phone }}</text>
        </view>
      </view>
    </view>

    <!-- 客户统计 -->
    <view class="stats-section">
      <view class="stat-item">
        <text class="stat-number">{{ customerInfo.stats.orderCount }}</text>
        <text class="stat-label">订单数</text>
      </view>
      <view class="stat-item">
        <text class="stat-number">{{ customerInfo.stats.totalAmount }}</text>
        <text class="stat-label">消费总额(万)</text>
      </view>
      <view class="stat-item">
        <text class="stat-number">{{ customerInfo.stats.avgOrderValue }}</text>
        <text class="stat-label">平均订单金额</text>
      </view>
      <view class="stat-item">
        <text class="stat-number">{{ customerInfo.stats.lastOrderDays }}</text>
        <text class="stat-label">距上次购买(天)</text>
      </view>
    </view>

    <!-- 客户详细信息 -->
    <view class="details-section">
      <view class="section-title">详细信息</view>
      <view class="details-content">
        <view class="detail-item">
          <text class="detail-label">客户姓名</text>
          <text class="detail-value">{{ customerInfo.name }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">联系电话</text>
          <text class="detail-value">{{ customerInfo.phone }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">电子邮箱</text>
          <text class="detail-value">{{ customerInfo.email }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">客户地址</text>
          <text class="detail-value">{{ customerInfo.address }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">客户等级</text>
          <text class="detail-value">{{ customerInfo.levelText }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">注册时间</text>
          <text class="detail-value">{{ customerInfo.registerTime }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">最后购买</text>
          <text class="detail-value">{{ customerInfo.lastOrderTime }}</text>
        </view>
      </view>
    </view>

    <!-- 最近订单 -->
    <view class="recent-orders-section">
      <view class="section-title">最近订单</view>
      <view class="orders-content">
        <view
          class="order-item"
          v-for="(order, index) in customerInfo.recentOrders"
          :key="index"
          @click="viewOrderDetail(order.id)"
        >
          <view class="order-header">
            <text class="order-number">{{ order.orderNo }}</text>
            <text class="order-status" :class="order.status">{{
              order.statusText
            }}</text>
          </view>
          <view class="order-info">
            <text class="order-amount">¥{{ order.amount }}</text>
            <text class="order-time">{{ order.createTime }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 客户回访记录 -->
    <view class="visit-records-section">
      <view class="section-title">回访记录</view>
      <view class="records-content">
        <view
          class="record-item"
          v-for="(record, index) in customerInfo.visitRecords"
          :key="index"
        >
          <view class="record-header">
            <text class="record-type">{{ record.type }}</text>
            <text class="record-time">{{ record.time }}</text>
          </view>
          <view class="record-content">
            <text class="record-desc">{{ record.description }}</text>
          </view>
          <view class="record-result">
            <text class="result-label">结果：</text>
            <text class="result-value" :class="record.result">{{
              record.resultText
            }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-section">
      <view class="action-buttons">
        <button class="action-btn edit" @click="editCustomer">编辑客户</button>
        <button class="action-btn visit" @click="addVisitRecord">
          添加回访
        </button>
        <button class="action-btn contact" @click="contactCustomer">
          联系客户
        </button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      customerInfo: {
        name: '张三',
        phone: '138****8888',
        email: 'zhangsan@example.com',
        address: '北京市朝阳区xxx街道xxx小区',
        level: 'vip',
        levelText: 'VIP客户',
        isVip: true,
        registerTime: '2023-01-15',
        lastOrderTime: '2024-12-01',
        stats: {
          orderCount: 15,
          totalAmount: 25.68,
          avgOrderValue: 1712,
          lastOrderDays: 5,
        },
        recentOrders: [
          {
            id: 1,
            orderNo: 'ORD20241201001',
            amount: '2,580.00',
            status: 'confirmed',
            statusText: '已确认',
            createTime: '2024-12-01 14:30',
          },
          {
            id: 2,
            orderNo: 'ORD20241125001',
            amount: '1,890.00',
            status: 'completed',
            statusText: '已完成',
            createTime: '2024-11-25 10:15',
          },
          {
            id: 3,
            orderNo: 'ORD20241120001',
            amount: '3,420.00',
            status: 'completed',
            statusText: '已完成',
            createTime: '2024-11-20 16:45',
          },
        ],
        visitRecords: [
          {
            type: '电话回访',
            time: '2024-12-01 15:30',
            description: '客户对iPhone 15 Pro非常满意，表示会推荐给朋友',
            result: 'positive',
            resultText: '正面反馈',
          },
          {
            type: '微信回访',
            time: '2024-11-25 14:20',
            description: '询问客户对MacBook Air的使用体验',
            result: 'positive',
            resultText: '正面反馈',
          },
          {
            type: '上门回访',
            time: '2024-11-20 10:00',
            description: '客户反映AirPods Pro音质很好，但希望有更多颜色选择',
            result: 'neutral',
            resultText: '中性反馈',
          },
        ],
      },
    }
  },
  onLoad(options) {
    // 根据传入的客户ID加载客户详情
    if (options.id) {
      this.loadCustomerDetail(options.id)
    }
  },
  methods: {
    loadCustomerDetail(customerId) {
      // 加载客户详情数据
      console.log('加载客户详情:', customerId)
    },

    viewOrderDetail(orderId) {
      uni.navigateTo({
        url: `/pages/order/detail?id=${orderId}`,
      })
    },

    editCustomer() {
      uni.showToast({
        title: '编辑客户功能开发中',
        icon: 'none',
      })
    },

    addVisitRecord() {
      uni.showToast({
        title: '添加回访记录功能开发中',
        icon: 'none',
      })
    },

    contactCustomer() {
      uni.showToast({
        title: '联系客户功能开发中',
        icon: 'none',
      })
    },
  },
}
</script>

<style scoped>
.customer-detail-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.customer-info-section {
  background: #fff;
  padding: 40rpx;
  margin-bottom: 20rpx;
}

.customer-header {
  display: flex;
  align-items: center;
}

.customer-avatar {
  position: relative;
  margin-right: 30rpx;
}

.avatar-text {
  width: 100rpx;
  height: 100rpx;
  background: #007aff;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  font-weight: bold;
}

.vip-badge {
  position: absolute;
  top: -5rpx;
  right: -5rpx;
  background: #ffd700;
  color: #333;
  padding: 4rpx 8rpx;
  border-radius: 10rpx;
  font-size: 20rpx;
  font-weight: bold;
}

.customer-details {
  flex: 1;
}

.customer-name {
  display: block;
  font-size: 36rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.customer-level {
  display: block;
  font-size: 24rpx;
  color: #007aff;
  background: rgba(0, 122, 255, 0.1);
  padding: 4rpx 12rpx;
  border-radius: 10rpx;
  margin-bottom: 10rpx;
  align-self: flex-start;
}

.customer-phone {
  font-size: 28rpx;
  color: #666;
}

.stats-section {
  background: #fff;
  margin: 0 40rpx 20rpx;
  border-radius: 20rpx;
  padding: 40rpx;
  display: flex;
  justify-content: space-between;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-number {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #007aff;
  margin-bottom: 10rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #666;
}

.details-section,
.recent-orders-section,
.visit-records-section {
  background: #fff;
  margin: 0 40rpx 20rpx;
  border-radius: 20rpx;
  padding: 40rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
}

.details-content {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-size: 28rpx;
  color: #666;
}

.detail-value {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.orders-content {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.order-item {
  padding: 25rpx;
  background: #f8f9fa;
  border-radius: 15rpx;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.order-number {
  font-size: 26rpx;
  color: #333;
  font-weight: bold;
}

.order-status {
  padding: 6rpx 12rpx;
  border-radius: 15rpx;
  font-size: 22rpx;
}

.order-status.confirmed {
  background: #34c759;
  color: #fff;
}

.order-status.completed {
  background: #8e8e93;
  color: #fff;
}

.order-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-amount {
  font-size: 28rpx;
  color: #ff3b30;
  font-weight: bold;
}

.order-time {
  font-size: 24rpx;
  color: #999;
}

.records-content {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.record-item {
  padding: 25rpx;
  background: #f8f9fa;
  border-radius: 15rpx;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.record-type {
  font-size: 26rpx;
  color: #333;
  font-weight: bold;
}

.record-time {
  font-size: 24rpx;
  color: #999;
}

.record-content {
  margin-bottom: 15rpx;
}

.record-desc {
  font-size: 26rpx;
  color: #333;
  line-height: 1.5;
}

.record-result {
  display: flex;
  align-items: center;
}

.result-label {
  font-size: 24rpx;
  color: #666;
}

.result-value {
  font-size: 24rpx;
  font-weight: bold;
}

.result-value.positive {
  color: #34c759;
}

.result-value.neutral {
  color: #ff9500;
}

.result-value.negative {
  color: #ff3b30;
}

.action-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 20rpx 40rpx;
  border-top: 1rpx solid #f0f0f0;
}

.action-buttons {
  display: flex;
  gap: 20rpx;
}

.action-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
}

.action-btn.edit {
  background: #f8f9fa;
  color: #333;
}

.action-btn.visit {
  background: #007aff;
  color: #fff;
}

.action-btn.contact {
  background: #34c759;
  color: #fff;
}
</style>
