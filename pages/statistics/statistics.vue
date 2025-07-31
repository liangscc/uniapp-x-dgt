<template>
  <view class="statistics-container">
    <!-- 时间筛选 -->
    <view class="filter-section">
      <view class="time-filter">
        <text class="filter-label">时间范围：</text>
        <picker mode="date" :value="startDate" @change="onStartDateChange">
          <text class="date-picker">{{ startDate }}</text>
        </picker>
        <text class="separator">至</text>
        <picker mode="date" :value="endDate" @change="onEndDateChange">
          <text class="date-picker">{{ endDate }}</text>
        </picker>
      </view>
    </view>

    <!-- 统计概览 -->
    <view class="overview-section">
      <view class="overview-item">
        <text class="overview-number">{{ overview.totalRevenue }}</text>
        <text class="overview-label">总营收(万)</text>
      </view>
      <view class="overview-item">
        <text class="overview-number">{{ overview.totalOrders }}</text>
        <text class="overview-label">总订单数</text>
      </view>
      <view class="overview-item">
        <text class="overview-number">{{ overview.totalProfit }}</text>
        <text class="overview-label">总利润(万)</text>
      </view>
      <view class="overview-item">
        <text class="overview-number">{{ overview.avgOrderValue }}</text>
        <text class="overview-label">平均订单金额</text>
      </view>
    </view>

    <!-- 统计主题 -->
    <view class="theme-section">
      <view class="theme-tabs">
        <view
          class="theme-tab"
          :class="{ active: currentTheme === theme.value }"
          v-for="theme in themeOptions"
          :key="theme.value"
          @click="selectTheme(theme.value)"
        >
          {{ theme.label }}
        </view>
      </view>

      <!-- 订单主题 -->
      <view class="theme-content" v-if="currentTheme === 'order'">
        <view class="chart-section">
          <view class="chart-title">订单统计</view>
          <view class="chart-container">
            <view
              class="chart-item"
              v-for="(item, index) in orderStats"
              :key="index"
            >
              <view
                class="chart-bar"
                :style="{ height: item.percentage + '%' }"
              >
                <text class="bar-value">{{ item.value }}</text>
              </view>
              <text class="chart-label">{{ item.label }}</text>
            </view>
          </view>
        </view>
        <view class="stats-details">
          <view
            class="detail-item"
            v-for="(detail, index) in orderDetails"
            :key="index"
          >
            <text class="detail-label">{{ detail.label }}</text>
            <text class="detail-value">{{ detail.value }}</text>
          </view>
        </view>
      </view>

      <!-- 运单主题 -->
      <view class="theme-content" v-if="currentTheme === 'logistics'">
        <view class="chart-section">
          <view class="chart-title">运单统计</view>
          <view class="logistics-stats">
            <view
              class="logistics-item"
              v-for="(item, index) in logisticsStats"
              :key="index"
            >
              <view class="logistics-icon">{{ item.icon }}</view>
              <view class="logistics-info">
                <text class="logistics-label">{{ item.label }}</text>
                <text class="logistics-value">{{ item.value }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 支付单主题 -->
      <view class="theme-content" v-if="currentTheme === 'payment'">
        <view class="chart-section">
          <view class="chart-title">支付方式统计</view>
          <view class="payment-stats">
            <view
              class="payment-item"
              v-for="(item, index) in paymentStats"
              :key="index"
            >
              <view class="payment-method">{{ item.method }}</view>
              <view class="payment-bar">
                <view
                  class="payment-progress"
                  :style="{ width: item.percentage + '%' }"
                ></view>
              </view>
              <text class="payment-value">{{ item.value }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 商品主题 -->
      <view class="theme-content" v-if="currentTheme === 'product'">
        <view class="chart-section">
          <view class="chart-title">商品销售统计</view>
          <view class="product-stats">
            <view
              class="product-item"
              v-for="(item, index) in productStats"
              :key="index"
            >
              <view class="product-info">
                <text class="product-name">{{ item.name }}</text>
                <text class="product-category">{{ item.category }}</text>
              </view>
              <view class="product-data">
                <text class="product-sales">销量: {{ item.sales }}</text>
                <text class="product-revenue">营收: ¥{{ item.revenue }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 时间主题 -->
      <view class="theme-content" v-if="currentTheme === 'time'">
        <view class="chart-section">
          <view class="chart-title">时间维度统计</view>
          <view class="time-stats">
            <view
              class="time-item"
              v-for="(item, index) in timeStats"
              :key="index"
            >
              <text class="time-period">{{ item.period }}</text>
              <view class="time-data">
                <text class="time-orders">订单: {{ item.orders }}</text>
                <text class="time-revenue">营收: ¥{{ item.revenue }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 导出功能 -->
    <view class="export-section">
      <button class="export-btn" @click="exportReport">导出报告</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      startDate: '2024-12-01',
      endDate: '2024-12-31',
      currentTheme: 'order',
      themeOptions: [
        { label: '订单主题', value: 'order' },
        { label: '运单主题', value: 'logistics' },
        { label: '支付单主题', value: 'payment' },
        { label: '商品主题', value: 'product' },
        { label: '时间主题', value: 'time' },
      ],
      overview: {
        totalRevenue: 89.5,
        totalOrders: 156,
        totalProfit: 23.8,
        avgOrderValue: 5736,
      },
      orderStats: [
        { label: '待确认', value: 12, percentage: 20 },
        { label: '已确认', value: 45, percentage: 75 },
        { label: '已发货', value: 89, percentage: 90 },
        { label: '已完成', value: 10, percentage: 15 },
      ],
      orderDetails: [
        { label: '按时间维度', value: '156个订单' },
        { label: '按金钱', value: '¥895,000' },
        { label: '按利润', value: '¥238,000' },
        { label: '按状态', value: '4种状态' },
      ],
      logisticsStats: [
        { icon: '🚚', label: '按时间维度', value: '89个运单' },
        { icon: '💰', label: '按金钱', value: '¥450,000' },
        { icon: '🏢', label: '按物流商', value: '5家物流商' },
        { icon: '📊', label: '按状态', value: '3种状态' },
      ],
      paymentStats: [
        { method: '微信支付', value: '45%', percentage: 45 },
        { method: '支付宝', value: '35%', percentage: 35 },
        { method: '银行卡', value: '15%', percentage: 15 },
        { method: '现金', value: '5%', percentage: 5 },
      ],
      productStats: [
        {
          name: 'iPhone 15 Pro',
          category: '手机数码',
          sales: 25,
          revenue: '224,975',
        },
        {
          name: 'MacBook Air M2',
          category: '电脑办公',
          sales: 15,
          revenue: '149,985',
        },
        {
          name: 'AirPods Pro',
          category: '手机数码',
          sales: 30,
          revenue: '56,970',
        },
        {
          name: 'iPad Air',
          category: '平板电脑',
          sales: 12,
          revenue: '57,588',
        },
      ],
      timeStats: [
        { period: '本周', orders: 45, revenue: '125,680' },
        { period: '本月', orders: 156, revenue: '895,000' },
        { period: '本季度', orders: 420, revenue: '2,350,000' },
        { period: '本年度', orders: 1680, revenue: '9,500,000' },
      ],
    }
  },
  methods: {
    onStartDateChange(e) {
      this.startDate = e.detail.value
    },

    onEndDateChange(e) {
      this.endDate = e.detail.value
    },

    selectTheme(theme) {
      this.currentTheme = theme
    },

    exportReport() {
      uni.showToast({
        title: '导出报告功能开发中',
        icon: 'none',
      })
    },
  },
}
</script>

<style scoped>
.statistics-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.filter-section {
  background: #fff;
  padding: 30rpx 40rpx;
  margin-bottom: 20rpx;
}

.time-filter {
  display: flex;
  align-items: center;
}

.filter-label {
  font-size: 28rpx;
  color: #333;
  margin-right: 20rpx;
}

.date-picker {
  background: #f8f9fa;
  padding: 15rpx 20rpx;
  border-radius: 10rpx;
  font-size: 26rpx;
  color: #333;
}

.separator {
  margin: 0 20rpx;
  font-size: 26rpx;
  color: #666;
}

.overview-section {
  background: #fff;
  margin: 0 40rpx 20rpx;
  border-radius: 20rpx;
  padding: 40rpx;
  display: flex;
  justify-content: space-between;
}

.overview-item {
  text-align: center;
  flex: 1;
}

.overview-number {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #007aff;
  margin-bottom: 10rpx;
}

.overview-label {
  font-size: 24rpx;
  color: #666;
}

.theme-section {
  background: #fff;
  margin: 0 40rpx;
  border-radius: 20rpx;
  padding: 40rpx;
}

.theme-tabs {
  display: flex;
  gap: 20rpx;
  margin-bottom: 40rpx;
}

.theme-tab {
  padding: 15rpx 30rpx;
  background: #f8f9fa;
  border-radius: 25rpx;
  font-size: 26rpx;
  color: #666;
}

.theme-tab.active {
  background: #007aff;
  color: #fff;
}

.chart-section {
  margin-bottom: 40rpx;
}

.chart-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
}

.chart-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 200rpx;
}

.chart-item {
  text-align: center;
  flex: 1;
}

.chart-bar {
  background: linear-gradient(to top, #007aff, #34c759);
  border-radius: 10rpx 10rpx 0 0;
  position: relative;
  margin-bottom: 15rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bar-value {
  color: #fff;
  font-size: 22rpx;
  font-weight: bold;
}

.chart-label {
  font-size: 24rpx;
  color: #666;
}

.stats-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.detail-item {
  background: #f8f9fa;
  padding: 20rpx;
  border-radius: 15rpx;
}

.detail-label {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 5rpx;
}

.detail-value {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.logistics-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.logistics-item {
  background: #f8f9fa;
  padding: 30rpx;
  border-radius: 15rpx;
  display: flex;
  align-items: center;
}

.logistics-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.logistics-info {
  flex: 1;
}

.logistics-label {
  display: block;
  font-size: 26rpx;
  color: #666;
  margin-bottom: 5rpx;
}

.logistics-value {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.payment-stats {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.payment-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.payment-item:last-child {
  border-bottom: none;
}

.payment-method {
  font-size: 28rpx;
  color: #333;
  width: 150rpx;
}

.payment-bar {
  flex: 1;
  height: 20rpx;
  background: #f0f0f0;
  border-radius: 10rpx;
  margin: 0 20rpx;
  overflow: hidden;
}

.payment-progress {
  height: 100%;
  background: linear-gradient(to right, #007aff, #34c759);
  border-radius: 10rpx;
}

.payment-value {
  font-size: 26rpx;
  color: #333;
  font-weight: bold;
  width: 80rpx;
  text-align: right;
}

.product-stats {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.product-item {
  background: #f8f9fa;
  padding: 25rpx;
  border-radius: 15rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
}

.product-data {
  text-align: right;
}

.product-sales {
  display: block;
  font-size: 26rpx;
  color: #666;
  margin-bottom: 5rpx;
}

.product-revenue {
  font-size: 28rpx;
  color: #ff3b30;
  font-weight: bold;
}

.time-stats {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.time-item {
  background: #f8f9fa;
  padding: 25rpx;
  border-radius: 15rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.time-period {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.time-data {
  text-align: right;
}

.time-orders {
  display: block;
  font-size: 26rpx;
  color: #666;
  margin-bottom: 5rpx;
}

.time-revenue {
  font-size: 28rpx;
  color: #007aff;
  font-weight: bold;
}

.export-section {
  padding: 0 40rpx;
  margin-top: 40rpx;
}

.export-btn {
  width: 100%;
  height: 88rpx;
  background: #007aff;
  color: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;
}
</style>
