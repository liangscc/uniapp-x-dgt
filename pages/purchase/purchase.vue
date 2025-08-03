<template>
  <view class="purchase-container">
    <!-- 头部导航 -->
    <view class="header">
      <view class="header-left" @click="showSlideMenu">
        <text class="header-icon">👤</text>
      </view>
      <view class="header-center">
        <text class="header-title">采购管理</text>
      </view>
      <view class="header-right" @click="gotoChart">
        <text class="header-icon">📊</text>
      </view>
    </view>

    <!-- 侧滑菜单 -->
    <SlideMenu :visible="slideMenuVisible" @close="hideSlideMenu" />

    <!-- 采购统计 -->
    <view class="stats-section">
      <view class="stat-item">
        <text class="stat-number">{{ purchaseStats.total }}</text>
        <text class="stat-label">总采购单</text>
      </view>
      <view class="stat-item">
        <text class="stat-number">{{ purchaseStats.pending }}</text>
        <text class="stat-label">待审核</text>
      </view>
      <view class="stat-item">
        <text class="stat-number">{{ purchaseStats.approved }}</text>
        <text class="stat-label">已审核</text>
      </view>
      <view class="stat-item">
        <text class="stat-number">{{ purchaseStats.completed }}</text>
        <text class="stat-label">已完成</text>
      </view>
    </view>

    <!-- 采购计划生成 -->
    <view class="plan-section">
      <view class="section-header">
        <text class="section-title">采购计划</text>
        <text class="section-action" @click="generatePlan">生成计划</text>
      </view>
      <view class="plan-content">
        <view
          class="plan-item"
          v-for="(plan, index) in purchasePlans"
          :key="index"
        >
          <view class="plan-header">
            <text class="plan-id">{{ plan.id }}</text>
            <text class="plan-status" :class="plan.status">{{
              plan.statusText
            }}</text>
          </view>
          <view class="plan-info">
            <text class="plan-date">{{ plan.createTime }}</text>
            <text class="plan-total">总计: {{ plan.totalItems }}件商品</text>
          </view>
          <view class="plan-actions">
            <text class="action-btn view" @click="viewPlanDetail(plan.id)"
              >查看详情</text
            >
            <text class="action-btn edit" @click="editPlan(plan.id)">编辑</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 采购单列表 -->
    <view class="purchase-list-section">
      <view class="section-header">
        <text class="section-title">采购单管理</text>
        <text class="section-action" @click="addPurchase">新增采购单</text>
      </view>
      <view class="purchase-list">
        <view
          class="purchase-item"
          v-for="(purchase, index) in purchaseList"
          :key="index"
          @click="viewPurchaseDetail(purchase.id)"
        >
          <view class="purchase-header">
            <text class="purchase-id">{{ purchase.id }}</text>
            <text class="purchase-status" :class="purchase.status">{{
              purchase.statusText
            }}</text>
          </view>
          <view class="purchase-info">
            <text class="purchase-supplier">{{ purchase.supplier }}</text>
            <text class="purchase-amount">¥{{ purchase.amount }}</text>
          </view>
          <view class="purchase-details">
            <text class="purchase-items">{{ purchase.itemCount }}件商品</text>
            <text class="purchase-date">{{ purchase.createTime }}</text>
          </view>
          <view class="purchase-actions">
            <text
              class="action-btn edit"
              @click.stop="editPurchase(purchase.id)"
              >编辑</text
            >
            <text
              class="action-btn delete"
              @click.stop="deletePurchase(purchase.id)"
              >删除</text
            >
          </view>
        </view>
      </view>
    </view>

    <!-- 拼箱管理 -->
    <view class="consolidation-section">
      <view class="section-header">
        <text class="section-title">拼箱管理</text>
        <text class="section-action" @click="createConsolidation"
          >创建拼箱</text
        >
      </view>
      <view class="consolidation-list">
        <view
          class="consolidation-item"
          v-for="(consolidation, index) in consolidationList"
          :key="index"
        >
          <view class="consolidation-header">
            <text class="consolidation-id">{{ consolidation.id }}</text>
            <text class="consolidation-status" :class="consolidation.status">{{
              consolidation.statusText
            }}</text>
          </view>
          <view class="consolidation-info">
            <text class="consolidation-items"
              >{{ consolidation.itemCount }}个货品</text
            >
            <text class="consolidation-logistics">{{
              consolidation.logisticsCompany
            }}</text>
          </view>
          <view class="consolidation-actions">
            <text
              class="action-btn view"
              @click="viewConsolidation(consolidation.id)"
              >查看</text
            >
            <text
              class="action-btn track"
              @click="trackConsolidation(consolidation.id)"
              >跟踪</text
            >
          </view>
        </view>
      </view>
    </view>

    <!-- 采购小结 -->
    <view class="summary-section">
      <view class="section-title">采购小结</view>
      <view class="summary-content">
        <view class="summary-item">
          <text class="summary-label">本月采购总额</text>
          <text class="summary-value">¥{{ purchaseSummary.monthlyTotal }}</text>
        </view>
        <view class="summary-item">
          <text class="summary-label">采购商品种类</text>
          <text class="summary-value"
            >{{ purchaseSummary.productTypes }}种</text
          >
        </view>
        <view class="summary-item">
          <text class="summary-label">平均采购周期</text>
          <text class="summary-value">{{ purchaseSummary.avgCycle }}天</text>
        </view>
        <view class="summary-item">
          <text class="summary-label">供应商数量</text>
          <text class="summary-value"
            >{{ purchaseSummary.supplierCount }}家</text
          >
        </view>
      </view>
    </view>

    <!-- 悬浮添加按钮 -->
    <view class="fab-button" @click="addPurchase">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>

<script>
import SlideMenu from '../../components/SlideMenu.vue'

export default {
  components: {
    SlideMenu
  },
  data() {
    return {
      slideMenuVisible: false,
      purchaseStats: {
        total: 45,
        pending: 12,
        approved: 20,
        completed: 13,
      },
      purchasePlans: [
        {
          id: 'PLAN001',
          status: 'pending',
          statusText: '待审核',
          createTime: '2024-12-01',
          totalItems: 25,
        },
        {
          id: 'PLAN002',
          status: 'approved',
          statusText: '已审核',
          createTime: '2024-11-28',
          totalItems: 18,
        },
        {
          id: 'PLAN003',
          status: 'completed',
          statusText: '已完成',
          createTime: '2024-11-25',
          totalItems: 32,
        },
      ],
      purchaseList: [
        {
          id: 'PUR001',
          supplier: '苹果官方',
          amount: '89,990.00',
          itemCount: 10,
          status: 'pending',
          statusText: '待审核',
          createTime: '2024-12-01',
        },
        {
          id: 'PUR002',
          supplier: '华为官方',
          amount: '45,600.00',
          itemCount: 8,
          status: 'approved',
          statusText: '已审核',
          createTime: '2024-11-30',
        },
        {
          id: 'PUR003',
          supplier: '小米官方',
          amount: '23,400.00',
          itemCount: 15,
          status: 'completed',
          statusText: '已完成',
          createTime: '2024-11-28',
        },
      ],
      consolidationList: [
        {
          id: 'CON001',
          status: 'shipping',
          statusText: '运输中',
          itemCount: 5,
          logisticsCompany: '顺丰速运',
        },
        {
          id: 'CON002',
          status: 'arrived',
          statusText: '已到货',
          itemCount: 3,
          logisticsCompany: '圆通速递',
        },
        {
          id: 'CON003',
          status: 'pending',
          statusText: '待发货',
          itemCount: 7,
          logisticsCompany: '中通快递',
        },
      ],
      purchaseSummary: {
        monthlyTotal: '158,990.00',
        productTypes: 12,
        avgCycle: 7,
        supplierCount: 8,
      },
    }
  },
  methods: {
    generatePlan() {
      uni.showToast({
        title: '生成采购计划功能开发中',
        icon: 'none',
      })
    },

    viewPlanDetail(planId) {
      uni.showToast({
        title: '查看计划详情功能开发中',
        icon: 'none',
      })
    },

    editPlan(planId) {
      uni.showToast({
        title: '编辑计划功能开发中',
        icon: 'none',
      })
    },

    addPurchase() {
      uni.showToast({
        title: '新增采购单功能开发中',
        icon: 'none',
      })
    },

    viewPurchaseDetail(purchaseId) {
      uni.showToast({
        title: '查看采购单详情功能开发中',
        icon: 'none',
      })
    },

    editPurchase(purchaseId) {
      uni.showToast({
        title: '编辑采购单功能开发中',
        icon: 'none',
      })
    },

    deletePurchase(purchaseId) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这个采购单吗？',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '删除成功',
              icon: 'success',
            })
          }
        },
      })
    },

    createConsolidation() {
      uni.showToast({
        title: '创建拼箱功能开发中',
        icon: 'none',
      })
    },

    viewConsolidation(consolidationId) {
      uni.showToast({
        title: '查看拼箱详情功能开发中',
        icon: 'none',
      })
    },

    trackConsolidation(consolidationId) {
      uni.showToast({
        title: '跟踪拼箱功能开发中',
        icon: 'none',
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
.purchase-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.header {
  background: #007aff;
  padding: 20rpx 40rpx;
  padding-top: calc(20rpx + var(--status-bar-height));
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
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

.plan-section,
.purchase-list-section,
.consolidation-section,
.summary-section {
  background: #fff;
  margin: 0 40rpx 20rpx;
  border-radius: 20rpx;
  padding: 40rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.section-action {
  font-size: 28rpx;
  color: #007aff;
}

.plan-content,
.purchase-list,
.consolidation-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.plan-item,
.purchase-item,
.consolidation-item {
  padding: 25rpx;
  background: #f8f9fa;
  border-radius: 15rpx;
}

.plan-header,
.purchase-header,
.consolidation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.plan-id,
.purchase-id,
.consolidation-id {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.plan-status,
.purchase-status,
.consolidation-status {
  padding: 6rpx 12rpx;
  border-radius: 15rpx;
  font-size: 22rpx;
}

.plan-status.pending,
.purchase-status.pending,
.consolidation-status.pending {
  background: #ff9500;
  color: #fff;
}

.plan-status.approved,
.purchase-status.approved {
  background: #34c759;
  color: #fff;
}

.plan-status.completed,
.purchase-status.completed {
  background: #8e8e93;
  color: #fff;
}

.consolidation-status.shipping {
  background: #007aff;
  color: #fff;
}

.consolidation-status.arrived {
  background: #34c759;
  color: #fff;
}

.plan-info,
.purchase-info,
.consolidation-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.plan-date,
.purchase-date,
.consolidation-items {
  font-size: 24rpx;
  color: #666;
}

.plan-total,
.purchase-amount,
.consolidation-logistics {
  font-size: 26rpx;
  color: #333;
  font-weight: bold;
}

.purchase-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.purchase-items {
  font-size: 24rpx;
  color: #666;
}

.plan-actions,
.purchase-actions,
.consolidation-actions {
  display: flex;
  gap: 20rpx;
}

.action-btn {
  padding: 8rpx 16rpx;
  border-radius: 15rpx;
  font-size: 22rpx;
}

.action-btn.view {
  background: #007aff;
  color: #fff;
}

.action-btn.edit {
  background: #ff9500;
  color: #fff;
}

.action-btn.delete {
  background: #ff3b30;
  color: #fff;
}

.action-btn.track {
  background: #34c759;
  color: #fff;
}

.summary-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.summary-item {
  background: #f8f9fa;
  padding: 25rpx;
  border-radius: 15rpx;
  text-align: center;
}

.summary-label {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.summary-value {
  font-size: 32rpx;
  color: #007aff;
  font-weight: bold;
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
