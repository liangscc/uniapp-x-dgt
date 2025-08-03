<template>
  <view class="order-container">
    <!-- 头部导航 -->
    <view class="header">
      <view class="header-left" @click="showSlideMenu">
        <text class="header-icon">👤</text>
      </view>
      <view class="header-center">
        <text class="header-title">订单管理</text>
      </view>
      <view class="header-right" @click="gotoChart">
        <text class="header-icon">📊</text>
      </view>
    </view>

    <!-- 侧滑菜单 -->
    <SlideMenu :visible="slideMenuVisible" @close="hideSlideMenu" />

    <!-- 订单统计 -->
    <view class="stats-section">
      <view class="stat-item">
        <text class="stat-number">{{ orderStats.total }}</text>
        <text class="stat-label">总订单</text>
      </view>
      <view class="stat-item">
        <text class="stat-number">{{ orderStats.pending }}</text>
        <text class="stat-label">待处理</text>
      </view>
      <view class="stat-item">
        <text class="stat-number">{{ orderStats.processing }}</text>
        <text class="stat-label">处理中</text>
      </view>
      <view class="stat-item">
        <text class="stat-number">{{ orderStats.completed }}</text>
        <text class="stat-label">已完成</text>
      </view>
    </view>

    <!-- 筛选栏 -->
    <view class="filter-section">
      <view class="filter-tabs">
        <text
          class="filter-tab"
          :class="{ active: currentFilter === 'all' }"
          @click="setFilter('all')"
          >全部</text
        >
        <text
          class="filter-tab"
          :class="{ active: currentFilter === 'pending' }"
          @click="setFilter('pending')"
          >待处理</text
        >
        <text
          class="filter-tab"
          :class="{ active: currentFilter === 'processing' }"
          @click="setFilter('processing')"
          >处理中</text
        >
        <text
          class="filter-tab"
          :class="{ active: currentFilter === 'completed' }"
          @click="setFilter('completed')"
          >已完成</text
        >
      </view>
      <view class="search-btn" @click="showSearch">
        <text class="search-icon">🔍</text>
      </view>
    </view>

    <!-- 订单列表 -->
    <view class="order-list">
      <view
        class="order-item"
        v-for="(order, index) in filteredOrders"
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
          <view class="customer-info">
            <text class="customer-name">{{ order.customerName }}</text>
            <text class="customer-phone">{{ order.customerPhone }}</text>
          </view>
          <view class="order-amount">
            <text class="amount-label">订单金额</text>
            <text class="amount-value">¥{{ order.amount }}</text>
          </view>
        </view>

        <view class="order-details">
          <view class="product-info">
            <text class="product-count">{{ order.productCount }}件商品</text>
            <text class="order-time">{{ order.createTime }}</text>
          </view>
          <view class="order-actions">
            <text class="action-btn edit" @click.stop="editOrder(order.id)"
              >编辑</text
            >
            <text class="action-btn delete" @click.stop="deleteOrder(order.id)"
              >删除</text
            >
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="filteredOrders.length === 0">
      <text class="empty-icon">📦</text>
      <text class="empty-text">暂无订单数据</text>
      <text class="empty-tip">点击下方按钮添加新订单</text>
    </view>

    <!-- 悬浮添加按钮 -->
    <view class="fab-button" @click="addOrder">
      <text class="fab-icon">+</text>
    </view>

    <!-- 自定义 TabBar -->
    <CustomTabBar />
  </view>
</template>

<script>
import apiService from '../../utils/api.js'
import SlideMenu from '../../components/SlideMenu.vue'
import CustomTabBar from '../../components/CustomTabBar.vue'

export default {
  components: {
    SlideMenu,
    CustomTabBar
  },
  data() {
    return {
      slideMenuVisible: false,
      currentFilter: 'all',
      orderStats: {
        total: 0,
        pending: 0,
        processing: 0,
        completed: 0,
      },
      orderList: [],
    }
  },
  computed: {
    filteredOrders() {
      if (this.currentFilter === 'all') {
        return this.orderList
      }
      return this.orderList.filter(
        (order) => order.status === this.currentFilter
      )
    },
  },
  onLoad() {
    this.loadOrderData()
  },
  onShow() {
    this.loadOrderData()
  },
  methods: {
    async loadOrderData() {
      try {
        // 获取订单列表
        const response = await apiService.getOrder({
          userId: this.getUserId(),
          page: 1,
          size: 50,
        })

        if (response.success) {
          this.orderList = response.data.orders || []
          this.updateOrderStats()
        } else {
          // 使用模拟数据作为备用
          this.loadMockData()
        }
      } catch (error) {
        console.error('加载订单数据失败:', error)
        this.loadMockData()
      }
    },

    loadMockData() {
      // 模拟数据
      this.orderList = [
        {
          id: 1,
          orderNo: 'ORD20241201001',
          customerName: '张三',
          customerPhone: '138****8888',
          amount: '2,580.00',
          productCount: 3,
          status: 'pending',
          statusText: '待处理',
          createTime: '2024-12-01 14:30',
        },
        {
          id: 2,
          orderNo: 'ORD20241201002',
          customerName: '李四',
          customerPhone: '139****9999',
          amount: '1,890.00',
          productCount: 2,
          status: 'processing',
          statusText: '处理中',
          createTime: '2024-12-01 15:20',
        },
        {
          id: 3,
          orderNo: 'ORD20241201003',
          customerName: '王五',
          customerPhone: '137****7777',
          amount: '3,420.00',
          productCount: 4,
          status: 'completed',
          statusText: '已完成',
          createTime: '2024-12-01 16:45',
        },
        {
          id: 4,
          orderNo: 'ORD20241201004',
          customerName: '赵六',
          customerPhone: '136****6666',
          amount: '1,200.00',
          productCount: 1,
          status: 'pending',
          statusText: '待处理',
          createTime: '2024-12-01 17:10',
        },
      ]
      this.updateOrderStats()
    },

    updateOrderStats() {
      const stats = {
        total: this.orderList.length,
        pending: this.orderList.filter((order) => order.status === 'pending')
          .length,
        processing: this.orderList.filter(
          (order) => order.status === 'processing'
        ).length,
        completed: this.orderList.filter(
          (order) => order.status === 'completed'
        ).length,
      }
      this.orderStats = stats
    },

    getUserId() {
      const userInfo = uni.getStorageSync('userInfo')
      return userInfo ? userInfo.id : null
    },

    setFilter(filter) {
      this.currentFilter = filter
    },

    showSearch() {
      uni.navigateTo({
        url: '/pages/search/search',
      })
    },

    viewOrderDetail(orderId) {
      uni.navigateTo({
        url: `/pages/order/detail?id=${orderId}`,
      })
    },

    async addOrder() {
      uni.showToast({
        title: '新增订单功能开发中',
        icon: 'none',
      })
    },

    async editOrder(orderId) {
      uni.showToast({
        title: '编辑订单功能开发中',
        icon: 'none',
      })
    },

    async deleteOrder(orderId) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这个订单吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              const response = await apiService.deleteOrder(orderId)
              if (response.success) {
                // 从列表中移除订单
                const index = this.orderList.findIndex(
                  (order) => order.id === orderId
                )
                if (index > -1) {
                  this.orderList.splice(index, 1)
                  this.updateOrderStats()
                }
                uni.showToast({
                  title: '删除成功',
                  icon: 'success',
                })
              } else {
                uni.showToast({
                  title: response.message || '删除失败',
                  icon: 'none',
                })
              }
            } catch (error) {
              console.error('删除订单失败:', error)
              uni.showToast({
                title: '删除失败，请重试',
                icon: 'none',
              })
            }
          }
        },
      })
    },
    
    // 显示侧滑菜单
    showSlideMenu() {
      this.slideMenuVisible = true
    },
    
    // 隐藏侧滑菜单
    hideSlideMenu() {
      this.slideMenuVisible = false
    },
    
    // 跳转到统计页面
    gotoChart() {
      uni.navigateTo({
        url: '/pages/statistics/statistics'
      })
    },
  },
}
</script>

<style scoped>
.order-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
  /* 为自定义 tabbar 留出空间 */
  padding-bottom: calc(120rpx + 100rpx);
  /* 为固定 header 留出空间 */
  padding-top: calc(120rpx + var(--status-bar-height));
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: #007aff;
  padding: 20rpx 40rpx;
  padding-top: calc(20rpx + var(--status-bar-height));
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.header-left,
.header-right {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

.header-icon {
  font-size: 32rpx;
}

.header-center {
  flex: 1;
  text-align: center;
}

.header-title {
  font-size: 32rpx;
  font-weight: bold;
}

.stats-section {
  background: #fff;
  margin: 20rpx 40rpx;
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

.filter-section {
  background: #fff;
  margin: 0 40rpx 20rpx;
  border-radius: 20rpx;
  padding: 30rpx 40rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-tabs {
  display: flex;
  gap: 40rpx;
}

.filter-tab {
  font-size: 28rpx;
  color: #666;
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
  transition: all 0.3s;
}

.filter-tab.active {
  background: #007aff;
  color: #fff;
}

.search-btn {
  width: 60rpx;
  height: 60rpx;
  background: #f8f9fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-icon {
  font-size: 28rpx;
}

.order-list {
  padding: 0 40rpx;
}

.order-item {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.order-number {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.order-status {
  padding: 8rpx 16rpx;
  border-radius: 15rpx;
  font-size: 22rpx;
}

.order-status.pending {
  background: #ff9500;
  color: #fff;
}

.order-status.processing {
  background: #007aff;
  color: #fff;
}

.order-status.completed {
  background: #34c759;
  color: #fff;
}

.order-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.customer-info {
  flex: 1;
}

.customer-name {
  display: block;
  font-size: 26rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 5rpx;
}

.customer-phone {
  font-size: 24rpx;
  color: #666;
}

.order-amount {
  text-align: right;
}

.amount-label {
  display: block;
  font-size: 22rpx;
  color: #666;
  margin-bottom: 5rpx;
}

.amount-value {
  font-size: 28rpx;
  color: #ff3b30;
  font-weight: bold;
}

.order-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-info {
  display: flex;
  flex-direction: column;
}

.product-count {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 5rpx;
}

.order-time {
  font-size: 22rpx;
  color: #999;
}

.order-actions {
  display: flex;
  gap: 15rpx;
}

.action-btn {
  padding: 8rpx 16rpx;
  border-radius: 15rpx;
  font-size: 22rpx;
}

.action-btn.edit {
  background: #ff9500;
  color: #fff;
}

.action-btn.delete {
  background: #ff3b30;
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
  color: #666;
  margin-bottom: 20rpx;
}

.empty-tip {
  font-size: 26rpx;
  color: #999;
}

.fab-button {
  position: fixed;
  bottom: 40rpx;
  right: 40rpx;
  width: 100rpx;
  height: 100rpx;
  background: #007aff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 122, 255, 0.3);
}

.fab-icon {
  color: #fff;
  font-size: 40rpx;
  font-weight: bold;
}
</style>
