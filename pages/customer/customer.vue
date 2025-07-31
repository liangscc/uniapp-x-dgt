<template>
  <view class="customer-container">
    <!-- 客户统计 -->
    <view class="stats-section">
      <view class="stat-item">
        <text class="stat-number">{{ customerStats.total }}</text>
        <text class="stat-label">总客户</text>
      </view>
      <view class="stat-item">
        <text class="stat-number">{{ customerStats.vip }}</text>
        <text class="stat-label">VIP客户</text>
      </view>
      <view class="stat-item">
        <text class="stat-number">{{ customerStats.new }}</text>
        <text class="stat-label">新增客户</text>
      </view>
      <view class="stat-item">
        <text class="stat-number">{{ customerStats.active }}</text>
        <text class="stat-label">活跃客户</text>
      </view>
    </view>

    <!-- 客户等级筛选 -->
    <view class="level-section">
      <scroll-view class="level-scroll" scroll-x="true">
        <view class="level-list">
          <text
            class="level-item"
            :class="{ active: currentLevel === 'all' }"
            @click="setLevel('all')"
            >全部</text
          >
          <text
            class="level-item"
            :class="{ active: currentLevel === 'vip' }"
            @click="setLevel('vip')"
            >VIP</text
          >
          <text
            class="level-item"
            :class="{ active: currentLevel === 'regular' }"
            @click="setLevel('regular')"
            >普通</text
          >
          <text
            class="level-item"
            :class="{ active: currentLevel === 'new' }"
            @click="setLevel('new')"
            >新客户</text
          >
        </view>
      </scroll-view>
    </view>

    <!-- 客户列表 -->
    <view class="customer-list">
      <view
        class="customer-item"
        v-for="(customer, index) in filteredCustomers"
        :key="index"
        @click="viewCustomerDetail(customer.id)"
      >
        <view class="customer-avatar">
          <text class="avatar-text">{{ customer.name.charAt(0) }}</text>
          <view class="vip-badge" v-if="customer.isVip">VIP</view>
        </view>

        <view class="customer-info">
          <view class="customer-header">
            <text class="customer-name">{{ customer.name }}</text>
            <text class="customer-level" :class="customer.level">{{
              customer.levelText
            }}</text>
          </view>

          <view class="customer-details">
            <text class="customer-phone">{{ customer.phone }}</text>
            <text class="customer-orders">{{ customer.orderCount }}个订单</text>
          </view>

          <view class="customer-stats">
            <text class="stat-item">
              <text class="stat-label">消费总额:</text>
              <text class="stat-value">¥{{ customer.totalAmount }}</text>
            </text>
            <text class="stat-item">
              <text class="stat-label">最后购买:</text>
              <text class="stat-value">{{ customer.lastOrderTime }}</text>
            </text>
          </view>
        </view>

        <view class="customer-actions">
          <text class="action-btn edit" @click.stop="editCustomer(customer.id)"
            >编辑</text
          >
          <text
            class="action-btn delete"
            @click.stop="deleteCustomer(customer.id)"
            >删除</text
          >
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="filteredCustomers.length === 0">
      <text class="empty-icon">👥</text>
      <text class="empty-text">暂无客户数据</text>
      <text class="empty-tip">点击下方按钮添加新客户</text>
    </view>

    <!-- 悬浮添加按钮 -->
    <view class="fab-button" @click="addCustomer">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentLevel: 'all',
      customerStats: {
        total: 234,
        vip: 45,
        new: 23,
        active: 156,
      },
      customerList: [
        {
          id: 1,
          name: '张三',
          phone: '138****8888',
          level: 'vip',
          levelText: 'VIP客户',
          isVip: true,
          orderCount: 15,
          totalAmount: '25,680.00',
          lastOrderTime: '2024-12-01',
        },
        {
          id: 2,
          name: '李四',
          phone: '139****9999',
          level: 'regular',
          levelText: '普通客户',
          isVip: false,
          orderCount: 8,
          totalAmount: '12,450.00',
          lastOrderTime: '2024-11-28',
        },
        {
          id: 3,
          name: '王五',
          phone: '137****7777',
          level: 'vip',
          levelText: 'VIP客户',
          isVip: true,
          orderCount: 22,
          totalAmount: '38,920.00',
          lastOrderTime: '2024-11-30',
        },
        {
          id: 4,
          name: '赵六',
          phone: '136****6666',
          level: 'new',
          levelText: '新客户',
          isVip: false,
          orderCount: 2,
          totalAmount: '3,200.00',
          lastOrderTime: '2024-11-25',
        },
        {
          id: 5,
          name: '钱七',
          phone: '135****5555',
          level: 'regular',
          levelText: '普通客户',
          isVip: false,
          orderCount: 5,
          totalAmount: '8,750.00',
          lastOrderTime: '2024-11-20',
        },
        {
          id: 6,
          name: '孙八',
          phone: '134****4444',
          level: 'vip',
          levelText: 'VIP客户',
          isVip: true,
          orderCount: 18,
          totalAmount: '31,600.00',
          lastOrderTime: '2024-11-29',
        },
      ],
    }
  },
  computed: {
    filteredCustomers() {
      if (this.currentLevel === 'all') {
        return this.customerList
      }
      return this.customerList.filter(
        (customer) => customer.level === this.currentLevel
      )
    },
  },
  methods: {
    setLevel(level) {
      this.currentLevel = level
    },

    viewCustomerDetail(customerId) {
      uni.navigateTo({
        url: `/pages/customer/detail?id=${customerId}`,
      })
    },

    addCustomer() {
      uni.showToast({
        title: '新增客户功能开发中',
        icon: 'none',
      })
    },

    editCustomer(customerId) {
      uni.showToast({
        title: '编辑客户功能开发中',
        icon: 'none',
      })
    },

    deleteCustomer(customerId) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这个客户吗？',
        success: (res) => {
          if (res.confirm) {
            // 从列表中移除客户
            const index = this.customerList.findIndex(
              (customer) => customer.id === customerId
            )
            if (index > -1) {
              this.customerList.splice(index, 1)
              uni.showToast({
                title: '删除成功',
                icon: 'success',
              })
            }
          }
        },
      })
    },
  },
}
</script>

<style scoped>
.customer-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
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

.level-section {
  background: #fff;
  margin: 0 40rpx 20rpx;
  border-radius: 20rpx;
  padding: 30rpx 0;
}

.level-scroll {
  white-space: nowrap;
}

.level-list {
  display: flex;
  padding: 0 40rpx;
}

.level-item {
  display: inline-block;
  padding: 15rpx 30rpx;
  margin-right: 20rpx;
  background: #f8f9fa;
  border-radius: 25rpx;
  font-size: 26rpx;
  color: #666;
  transition: all 0.3s;
}

.level-item.active {
  background: #007aff;
  color: #fff;
}

.customer-list {
  padding: 0 40rpx;
}

.customer-item {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.customer-avatar {
  position: relative;
  margin-right: 30rpx;
}

.avatar-text {
  width: 80rpx;
  height: 80rpx;
  background: #007aff;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
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
  font-size: 18rpx;
  font-weight: bold;
}

.customer-info {
  flex: 1;
}

.customer-header {
  display: flex;
  align-items: center;
  margin-bottom: 15rpx;
}

.customer-name {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  margin-right: 15rpx;
}

.customer-level {
  padding: 4rpx 12rpx;
  border-radius: 10rpx;
  font-size: 20rpx;
}

.customer-level.vip {
  background: #ffd700;
  color: #333;
}

.customer-level.regular {
  background: #8e8e93;
  color: #fff;
}

.customer-level.new {
  background: #34c759;
  color: #fff;
}

.customer-details {
  display: flex;
  align-items: center;
  margin-bottom: 15rpx;
}

.customer-phone {
  font-size: 24rpx;
  color: #666;
  margin-right: 20rpx;
}

.customer-orders {
  font-size: 24rpx;
  color: #007aff;
}

.customer-stats {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.stat-item {
  display: flex;
  align-items: center;
}

.stat-label {
  font-size: 22rpx;
  color: #666;
  margin-right: 10rpx;
}

.stat-value {
  font-size: 22rpx;
  color: #333;
  font-weight: bold;
}

.customer-actions {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.action-btn {
  padding: 8rpx 16rpx;
  border-radius: 15rpx;
  font-size: 22rpx;
  text-align: center;
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
