<template>
  <view class="search-container">
    <!-- 搜索栏 -->
    <view class="search-header">
      <view class="search-bar">
        <text class="search-icon">🔍</text>
        <input
          class="search-input"
          placeholder="搜索订单、商品、客户..."
          v-model="searchKeyword"
          @input="onSearch"
          @confirm="performSearch"
        />
        <text class="search-btn" @click="performSearch">搜索</text>
      </view>
    </view>

    <!-- 搜索类型选择 -->
    <view class="search-types">
      <view class="type-tabs">
        <view
          class="type-tab"
          :class="{ active: currentType === type.value }"
          v-for="type in searchTypes"
          :key="type.value"
          @click="selectType(type.value)"
        >
          {{ type.label }}
        </view>
      </view>
    </view>

    <!-- 高级筛选 -->
    <view class="filter-section">
      <view class="filter-row">
        <view class="filter-item">
          <text class="filter-label">按名字/电话</text>
          <input
            class="filter-input"
            placeholder="输入姓名或电话"
            v-model="filters.namePhone"
          />
        </view>
        <view class="filter-item">
          <text class="filter-label">按类别/价格</text>
          <input
            class="filter-input"
            placeholder="输入类别或价格"
            v-model="filters.categoryPrice"
          />
        </view>
      </view>
      <view class="filter-row">
        <view class="filter-item">
          <text class="filter-label">按时间</text>
          <picker mode="date" :value="filters.date" @change="onDateChange">
            <text class="date-picker">{{ filters.date || '选择日期' }}</text>
          </picker>
        </view>
        <view class="filter-item">
          <text class="filter-label">按状态</text>
          <picker
            :range="statusOptions"
            :value="filters.statusIndex"
            @change="onStatusChange"
          >
            <text class="status-picker">{{
              statusOptions[filters.statusIndex] || '选择状态'
            }}</text>
          </picker>
        </view>
      </view>
      <view class="filter-actions">
        <button class="filter-btn clear" @click="clearFilters">清除筛选</button>
        <button class="filter-btn apply" @click="applyFilters">应用筛选</button>
      </view>
    </view>

    <!-- 搜索结果 -->
    <view class="search-results" v-if="searchResults.length > 0">
      <view class="results-header">
        <text class="results-title">搜索结果</text>
        <text class="results-count"
          >共找到 {{ searchResults.length }} 条结果</text
        >
      </view>

      <!-- 订单结果 -->
      <view class="result-section" v-if="currentType === 'order'">
        <view
          class="result-item"
          v-for="item in searchResults"
          :key="item.id"
          @click="viewOrderDetail(item.id)"
        >
          <view class="result-icon">📦</view>
          <view class="result-content">
            <text class="result-title">{{ item.orderNo }}</text>
            <text class="result-desc"
              >{{ item.customerName }} - ¥{{ item.amount }}</text
            >
            <text class="result-time">{{ item.createTime }}</text>
          </view>
          <text class="result-status" :class="item.status">{{
            item.statusText
          }}</text>
        </view>
      </view>

      <!-- 商品结果 -->
      <view class="result-section" v-if="currentType === 'product'">
        <view
          class="result-item"
          v-for="item in searchResults"
          :key="item.id"
          @click="viewProductDetail(item.id)"
        >
          <view class="result-icon">📦</view>
          <view class="result-content">
            <text class="result-title">{{ item.name }}</text>
            <text class="result-desc"
              >{{ item.category }} - ¥{{ item.price }}</text
            >
            <text class="result-stock">库存: {{ item.stock }}</text>
          </view>
          <text class="result-status" :class="item.stockStatus">{{
            item.stockText
          }}</text>
        </view>
      </view>

      <!-- 客户结果 -->
      <view class="result-section" v-if="currentType === 'customer'">
        <view
          class="result-item"
          v-for="item in searchResults"
          :key="item.id"
          @click="viewCustomerDetail(item.id)"
        >
          <view class="result-icon">👥</view>
          <view class="result-content">
            <text class="result-title">{{ item.name }}</text>
            <text class="result-desc">{{ item.phone }} - {{ item.email }}</text>
            <text class="result-level">{{ item.levelText }}</text>
          </view>
          <text class="result-status" :class="item.level">{{
            item.levelText
          }}</text>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view
      class="empty-state"
      v-if="searchKeyword && searchResults.length === 0"
    >
      <text class="empty-icon">🔍</text>
      <text class="empty-text">未找到相关结果</text>
      <text class="empty-desc">请尝试其他关键词或调整筛选条件</text>
    </view>

    <!-- 搜索历史 -->
    <view
      class="search-history"
      v-if="!searchKeyword && searchHistory.length > 0"
    >
      <view class="history-header">
        <text class="history-title">搜索历史</text>
        <text class="history-clear" @click="clearHistory">清除</text>
      </view>
      <view class="history-list">
        <view
          class="history-item"
          v-for="(item, index) in searchHistory"
          :key="index"
          @click="useHistory(item)"
        >
          <text class="history-text">{{ item }}</text>
          <text class="history-delete" @click.stop="deleteHistory(index)"
            >×</text
          >
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      searchKeyword: '',
      currentType: 'all',
      searchTypes: [
        { label: '全部', value: 'all' },
        { label: '订单', value: 'order' },
        { label: '商品', value: 'product' },
        { label: '客户', value: 'customer' },
      ],
      filters: {
        namePhone: '',
        categoryPrice: '',
        date: '',
        statusIndex: 0,
      },
      statusOptions: ['全部状态', '待确认', '已确认', '已发货', '已完成'],
      searchHistory: ['iPhone 15', '张三', 'ORD20241201001', 'MacBook Air'],
      searchResults: [],
    }
  },
  methods: {
    onSearch() {
      // 实时搜索逻辑
    },

    performSearch() {
      if (!this.searchKeyword.trim()) {
        uni.showToast({
          title: '请输入搜索关键词',
          icon: 'none',
        })
        return
      }

      // 添加到搜索历史
      if (!this.searchHistory.includes(this.searchKeyword)) {
        this.searchHistory.unshift(this.searchKeyword)
        if (this.searchHistory.length > 10) {
          this.searchHistory.pop()
        }
      }

      // 模拟搜索结果
      this.searchResults = this.getMockResults()
    },

    selectType(type) {
      this.currentType = type
      this.performSearch()
    },

    onDateChange(e) {
      this.filters.date = e.detail.value
    },

    onStatusChange(e) {
      this.filters.statusIndex = e.detail.value
    },

    clearFilters() {
      this.filters = {
        namePhone: '',
        categoryPrice: '',
        date: '',
        statusIndex: 0,
      }
    },

    applyFilters() {
      this.performSearch()
    },

    getMockResults() {
      // 模拟搜索结果
      if (this.currentType === 'order' || this.currentType === 'all') {
        return [
          {
            id: 1,
            orderNo: 'ORD20241201001',
            customerName: '张三',
            amount: '2,580.00',
            status: 'pending',
            statusText: '待确认',
            createTime: '2024-12-01 14:30',
          },
          {
            id: 2,
            orderNo: 'ORD20241201002',
            customerName: '李四',
            amount: '1,890.00',
            status: 'confirmed',
            statusText: '已确认',
            createTime: '2024-12-01 13:15',
          },
        ]
      } else if (this.currentType === 'product') {
        return [
          {
            id: 1,
            name: 'iPhone 15 Pro',
            category: '手机数码',
            price: '8,999.00',
            stock: 15,
            stockStatus: 'inStock',
            stockText: '有库存',
          },
          {
            id: 2,
            name: 'MacBook Air M2',
            category: '电脑办公',
            price: '9,999.00',
            stock: 5,
            stockStatus: 'lowStock',
            stockText: '库存不足',
          },
        ]
      } else if (this.currentType === 'customer') {
        return [
          {
            id: 1,
            name: '张三',
            phone: '138****8888',
            email: 'zhangsan@example.com',
            level: 'vip',
            levelText: 'VIP客户',
          },
          {
            id: 2,
            name: '李四',
            phone: '139****9999',
            email: 'lisi@example.com',
            level: 'regular',
            levelText: '普通客户',
          },
        ]
      }
      return []
    },

    viewOrderDetail(orderId) {
      uni.navigateTo({
        url: `/pages/order/detail?id=${orderId}`,
      })
    },

    viewProductDetail(productId) {
      uni.navigateTo({
        url: `/pages/product/detail?id=${productId}`,
      })
    },

    viewCustomerDetail(customerId) {
      uni.navigateTo({
        url: `/pages/customer/detail?id=${customerId}`,
      })
    },

    useHistory(keyword) {
      this.searchKeyword = keyword
      this.performSearch()
    },

    deleteHistory(index) {
      this.searchHistory.splice(index, 1)
    },

    clearHistory() {
      this.searchHistory = []
    },
  },
}
</script>

<style scoped>
.search-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.search-header {
  background: #fff;
  padding: 30rpx 40rpx;
}

.search-bar {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 25rpx;
  padding: 20rpx 30rpx;
}

.search-icon {
  font-size: 28rpx;
  color: #999;
  margin-right: 20rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
}

.search-btn {
  color: #007aff;
  font-size: 28rpx;
  font-weight: bold;
}

.search-types {
  background: #fff;
  padding: 20rpx 40rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.type-tabs {
  display: flex;
  gap: 20rpx;
}

.type-tab {
  padding: 15rpx 30rpx;
  background: #f8f9fa;
  border-radius: 25rpx;
  font-size: 26rpx;
  color: #666;
}

.type-tab.active {
  background: #007aff;
  color: #fff;
}

.filter-section {
  background: #fff;
  padding: 30rpx 40rpx;
  margin-bottom: 20rpx;
}

.filter-row {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.filter-item {
  flex: 1;
}

.filter-label {
  display: block;
  font-size: 26rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.filter-input {
  width: 100%;
  background: #f8f9fa;
  padding: 15rpx 20rpx;
  border-radius: 10rpx;
  font-size: 26rpx;
}

.date-picker,
.status-picker {
  width: 100%;
  background: #f8f9fa;
  padding: 15rpx 20rpx;
  border-radius: 10rpx;
  font-size: 26rpx;
  color: #333;
}

.filter-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 30rpx;
}

.filter-btn {
  flex: 1;
  height: 70rpx;
  border-radius: 35rpx;
  font-size: 28rpx;
}

.filter-btn.clear {
  background: #f8f9fa;
  color: #666;
}

.filter-btn.apply {
  background: #007aff;
  color: #fff;
}

.search-results {
  background: #fff;
  margin: 0 40rpx;
  border-radius: 20rpx;
  padding: 40rpx;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.results-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.results-count {
  font-size: 26rpx;
  color: #666;
}

.result-section {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.result-item {
  display: flex;
  align-items: center;
  padding: 25rpx;
  background: #f8f9fa;
  border-radius: 15rpx;
}

.result-icon {
  width: 60rpx;
  height: 60rpx;
  background: #007aff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  margin-right: 25rpx;
}

.result-content {
  flex: 1;
}

.result-title {
  display: block;
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 5rpx;
}

.result-desc {
  display: block;
  font-size: 26rpx;
  color: #666;
  margin-bottom: 5rpx;
}

.result-time,
.result-stock,
.result-level {
  font-size: 24rpx;
  color: #999;
}

.result-status {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
}

.result-status.pending {
  background: #ff9500;
  color: #fff;
}

.result-status.confirmed {
  background: #34c759;
  color: #fff;
}

.result-status.shipped {
  background: #007aff;
  color: #fff;
}

.result-status.completed {
  background: #8e8e93;
  color: #fff;
}

.result-status.inStock {
  background: #34c759;
  color: #fff;
}

.result-status.lowStock {
  background: #ff9500;
  color: #fff;
}

.result-status.outOfStock {
  background: #ff3b30;
  color: #fff;
}

.result-status.vip {
  background: #ffd700;
  color: #333;
}

.result-status.regular {
  background: #34c759;
  color: #fff;
}

.empty-state {
  text-align: center;
  padding: 100rpx 40rpx;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 30rpx;
  display: block;
}

.empty-text {
  display: block;
  font-size: 32rpx;
  color: #333;
  margin-bottom: 15rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #999;
}

.search-history {
  background: #fff;
  margin: 20rpx 40rpx;
  border-radius: 20rpx;
  padding: 40rpx;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.history-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.history-clear {
  font-size: 28rpx;
  color: #007aff;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 15rpx;
}

.history-text {
  font-size: 28rpx;
  color: #333;
}

.history-delete {
  font-size: 32rpx;
  color: #999;
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
