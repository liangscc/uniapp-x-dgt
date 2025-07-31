<template>
  <view class="order-detail-container">
    <!-- 订单状态 -->
    <view class="status-section">
      <view class="status-header">
        <text class="order-number">{{ orderInfo.orderNo }}</text>
        <text class="order-status" :class="orderInfo.status">{{
          orderInfo.statusText
        }}</text>
      </view>
      <view class="status-timeline">
        <view
          class="timeline-item"
          v-for="(item, index) in timeline"
          :key="index"
          :class="{ active: item.active }"
        >
          <view class="timeline-icon">{{ item.icon }}</view>
          <view class="timeline-content">
            <text class="timeline-title">{{ item.title }}</text>
            <text class="timeline-time">{{ item.time }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 客户信息 -->
    <view class="info-section">
      <view class="section-title">客户信息</view>
      <view class="info-content">
        <view class="info-item">
          <text class="info-label">客户姓名</text>
          <text class="info-value">{{ orderInfo.customerName }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">联系电话</text>
          <text class="info-value">{{ orderInfo.customerPhone }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">客户地址</text>
          <text class="info-value">{{ orderInfo.customerAddress }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">客户等级</text>
          <text class="info-value">{{ orderInfo.customerLevel }}</text>
        </view>
      </view>
    </view>

    <!-- 订单商品 -->
    <view class="products-section">
      <view class="section-title">订单商品</view>
      <view class="product-list">
        <view
          class="product-item"
          v-for="(product, index) in orderInfo.products"
          :key="index"
        >
          <view class="product-image">
            <image
              :src="product.image"
              mode="aspectFill"
              class="product-img"
            ></image>
          </view>
          <view class="product-info">
            <text class="product-name">{{ product.name }}</text>
            <text class="product-category">{{ product.category }}</text>
            <view class="product-price-info">
              <text class="product-price">¥{{ product.price }}</text>
              <text class="product-quantity">×{{ product.quantity }}</text>
            </view>
          </view>
          <view class="product-total">
            <text class="total-amount">¥{{ product.total }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 订单金额 -->
    <view class="amount-section">
      <view class="section-title">订单金额</view>
      <view class="amount-content">
        <view class="amount-item">
          <text class="amount-label">商品总额</text>
          <text class="amount-value">¥{{ orderInfo.subtotal }}</text>
        </view>
        <view class="amount-item">
          <text class="amount-label">运费</text>
          <text class="amount-value">¥{{ orderInfo.shipping }}</text>
        </view>
        <view class="amount-item">
          <text class="amount-label">优惠金额</text>
          <text class="amount-value discount">-¥{{ orderInfo.discount }}</text>
        </view>
        <view class="amount-item total">
          <text class="amount-label">订单总额</text>
          <text class="amount-value">¥{{ orderInfo.total }}</text>
        </view>
      </view>
    </view>

    <!-- 物流信息 -->
    <view class="logistics-section">
      <view class="section-title">物流信息</view>
      <view class="logistics-content">
        <view class="logistics-item">
          <text class="logistics-label">物流公司</text>
          <text class="logistics-value">{{ orderInfo.logistics.company }}</text>
        </view>
        <view class="logistics-item">
          <text class="logistics-label">运单号</text>
          <text class="logistics-value">{{
            orderInfo.logistics.trackingNo
          }}</text>
        </view>
        <view class="logistics-item">
          <text class="logistics-label">物流状态</text>
          <text class="logistics-value">{{ orderInfo.logistics.status }}</text>
        </view>
      </view>
    </view>

    <!-- 备注信息 -->
    <view class="remark-section" v-if="orderInfo.remark">
      <view class="section-title">备注信息</view>
      <view class="remark-content">
        <text class="remark-text">{{ orderInfo.remark }}</text>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-section">
      <view class="action-buttons">
        <button class="action-btn primary" @click="generateReceipt">
          生成小票
        </button>
        <button class="action-btn secondary" @click="forwardReceipt">
          转发小票
        </button>
        <button class="action-btn secondary" @click="trackLogistics">
          跟踪物流
        </button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      orderInfo: {
        orderNo: 'ORD20241201001',
        status: 'confirmed',
        statusText: '已确认',
        customerName: '张三',
        customerPhone: '138****8888',
        customerAddress: '北京市朝阳区xxx街道xxx小区',
        customerLevel: 'VIP客户',
        products: [
          {
            name: 'iPhone 15 Pro',
            category: '手机数码',
            price: '8,999.00',
            quantity: 1,
            total: '8,999.00',
            image: '/static/logo.png',
          },
          {
            name: 'AirPods Pro',
            category: '手机数码',
            price: '1,899.00',
            quantity: 1,
            total: '1,899.00',
            image: '/static/logo.png',
          },
        ],
        subtotal: '10,898.00',
        shipping: '0.00',
        discount: '500.00',
        total: '10,398.00',
        logistics: {
          company: '顺丰速运',
          trackingNo: 'SF1234567890',
          status: '运输中',
        },
        remark: '请尽快发货，客户急需',
      },
      timeline: [
        {
          icon: '📝',
          title: '订单创建',
          time: '2024-12-01 14:30',
          active: true,
        },
        {
          icon: '💰',
          title: '支付完成',
          time: '2024-12-01 14:35',
          active: true,
        },
        {
          icon: '✅',
          title: '订单确认',
          time: '2024-12-01 15:00',
          active: true,
        },
        {
          icon: '📦',
          title: '商品出库',
          time: '2024-12-01 16:00',
          active: true,
        },
        {
          icon: '🚚',
          title: '物流发货',
          time: '2024-12-01 17:00',
          active: true,
        },
        {
          icon: '📮',
          title: '签收完成',
          time: '待签收',
          active: false,
        },
      ],
    }
  },
  onLoad(options) {
    // 根据传入的订单ID加载订单详情
    if (options.id) {
      this.loadOrderDetail(options.id)
    }
  },
  methods: {
    loadOrderDetail(orderId) {
      // 加载订单详情数据
      console.log('加载订单详情:', orderId)
    },

    generateReceipt() {
      uni.showToast({
        title: '生成小票功能开发中',
        icon: 'none',
      })
    },

    forwardReceipt() {
      uni.showToast({
        title: '转发小票功能开发中',
        icon: 'none',
      })
    },

    trackLogistics() {
      uni.showToast({
        title: '跟踪物流功能开发中',
        icon: 'none',
      })
    },
  },
}
</script>

<style scoped>
.order-detail-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.status-section {
  background: #fff;
  padding: 40rpx;
  margin-bottom: 20rpx;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.order-number {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.order-status {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
}

.order-status.pending {
  background: #ff9500;
  color: #fff;
}

.order-status.confirmed {
  background: #34c759;
  color: #fff;
}

.order-status.shipped {
  background: #007aff;
  color: #fff;
}

.order-status.completed {
  background: #8e8e93;
  color: #fff;
}

.status-timeline {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.timeline-item {
  display: flex;
  align-items: center;
  opacity: 0.5;
}

.timeline-item.active {
  opacity: 1;
}

.timeline-icon {
  width: 40rpx;
  height: 40rpx;
  background: #007aff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  margin-right: 20rpx;
}

.timeline-content {
  flex: 1;
}

.timeline-title {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 5rpx;
}

.timeline-time {
  font-size: 24rpx;
  color: #666;
}

.info-section,
.products-section,
.amount-section,
.logistics-section,
.remark-section {
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

.info-content {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 28rpx;
  color: #666;
}

.info-value {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.product-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 15rpx;
}

.product-image {
  margin-right: 20rpx;
}

.product-img {
  width: 80rpx;
  height: 80rpx;
  border-radius: 10rpx;
}

.product-info {
  flex: 1;
}

.product-name {
  display: block;
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 5rpx;
}

.product-category {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.product-price-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.product-price {
  font-size: 26rpx;
  color: #ff3b30;
  font-weight: bold;
}

.product-quantity {
  font-size: 24rpx;
  color: #666;
}

.product-total {
  text-align: right;
}

.total-amount {
  font-size: 28rpx;
  color: #ff3b30;
  font-weight: bold;
}

.amount-content {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.amount-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.amount-label {
  font-size: 28rpx;
  color: #666;
}

.amount-value {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.amount-value.discount {
  color: #ff3b30;
}

.amount-item.total {
  border-top: 1rpx solid #f0f0f0;
  padding-top: 15rpx;
  margin-top: 15rpx;
}

.amount-item.total .amount-label,
.amount-item.total .amount-value {
  font-size: 32rpx;
  font-weight: bold;
}

.logistics-content {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.logistics-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logistics-label {
  font-size: 28rpx;
  color: #666;
}

.logistics-value {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.remark-content {
  background: #f8f9fa;
  padding: 20rpx;
  border-radius: 15rpx;
}

.remark-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
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

.action-btn.primary {
  background: #007aff;
  color: #fff;
}

.action-btn.secondary {
  background: #f8f9fa;
  color: #333;
}
</style>
