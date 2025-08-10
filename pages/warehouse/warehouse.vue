<template>
  <view class="warehouse-container">
    <!-- 头部导航 -->
    <view class="header">
      <view class="header-left" @click="showSlideMenu">
        <text class="header-icon">👤</text>
      </view>
      <view class="header-center">
        <text class="header-title">仓库管理</text>
      </view>
      <view class="header-right" @click="gotoChart">
        <text class="header-icon">📊</text>
      </view>
    </view>

    <!-- 侧滑菜单 -->
    <SlideMenu :visible="slideMenuVisible" @close="hideSlideMenu" />

    <!-- 仓库统计 -->
    <view class="stats-section">
      <view class="stats-number">
        <text class="main-stat-number">{{ warehouseStats.totalProducts }}</text>
      </view>
      <view class="status-labels">
        <text class="status-label gray">空白</text>
        <text class="status-label green">无预警</text>
        <text class="status-label green">无过期</text>
      </view>
    </view>

    <!-- 仓库管理按钮 -->
    <view class="action-buttons">
      <view class="action-button" @click="viewWarehouseDetails">
        <text class="button-text">仓库商品详情</text>
      </view>
      <view class="action-button" @click="viewWarehouseFlow">
        <text class="button-text">仓库流水</text>
      </view>
    </view>

    <!-- 仓库管理 -->
    <view class="warehouse-section">
      <view class="section-header">
        <text class="section-title">仓库管理</text>
        <text class="section-action" @click="addWarehouse">新增仓库</text>
      </view>
      <view class="warehouse-list">
        <view
          class="warehouse-item"
          v-for="(warehouse, index) in warehouseList"
          :key="index"
        >
          <view class="warehouse-header">
            <text class="warehouse-name">{{ warehouse.name }}</text>
            <text class="warehouse-status" :class="warehouse.status">{{
              warehouse.statusText
            }}</text>
          </view>
          <view class="warehouse-info">
            <text class="warehouse-location">{{ warehouse.location }}</text>
            <text class="warehouse-capacity"
              >容量: {{ warehouse.capacity }}</text
            >
          </view>
          <view class="warehouse-actions">
            <text class="action-btn view" @click="viewWarehouse(warehouse.id)"
              >查看详情</text
            >
            <text class="action-btn edit" @click="editWarehouse(warehouse.id)"
              >编辑</text
            >
          </view>
        </view>
      </view>
    </view>

    <!-- 采购单入仓 -->
    <view class="inbound-section">
      <view class="section-header">
        <text class="section-title">采购单入仓</text>
        <text class="section-action" @click="processInbound">处理入仓</text>
      </view>
      <view class="inbound-list">
        <view
          class="inbound-item"
          v-for="(inbound, index) in inboundList"
          :key="index"
        >
          <view class="inbound-header">
            <text class="inbound-id">{{ inbound.id }}</text>
            <text class="inbound-status" :class="inbound.status">{{
              inbound.statusText
            }}</text>
          </view>
          <view class="inbound-info">
            <text class="inbound-supplier">{{ inbound.supplier }}</text>
            <text class="inbound-items">{{ inbound.itemCount }}件商品</text>
          </view>
          <view class="inbound-actions">
            <text
              class="action-btn process"
              @click="processInboundItem(inbound.id)"
              >处理</text
            >
            <text class="action-btn view" @click="viewInboundDetail(inbound.id)"
              >查看</text
            >
          </view>
        </view>
      </view>
    </view>

    <!-- 库存状态 -->
    <view class="inventory-section">
      <view class="section-header">
        <text class="section-title">库存状态</text>
        <text class="section-action" @click="updateStatus">更新状态</text>
      </view>
      <view class="inventory-list">
        <view
          class="inventory-item"
          v-for="(item, index) in inventoryList"
          :key="index"
        >
          <view class="inventory-header">
            <text class="inventory-name">{{ item.name }}</text>
            <text class="inventory-status" :class="item.stockStatus">{{
              item.stockText
            }}</text>
          </view>
          <view class="inventory-info">
            <text class="inventory-stock">库存: {{ item.stock }}</text>
            <text class="inventory-value">价值: ¥{{ item.value }}</text>
          </view>
          <view class="inventory-details">
            <text class="inventory-location">位置: {{ item.location }}</text>
            <text class="inventory-expiry">到期: {{ item.expiryDate }}</text>
          </view>
          <view class="inventory-actions">
            <text class="action-btn adjust" @click="adjustStock(item.id)"
              >调整库存</text
            >
            <text class="action-btn move" @click="moveItem(item.id)">移库</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 货期提醒 -->
    <view class="expiry-section">
      <view class="section-header">
        <text class="section-title">货期提醒</text>
        <text class="section-action" @click="setExpiryReminder">设置提醒</text>
      </view>
      <view class="expiry-list">
        <view
          class="expiry-item"
          v-for="(expiry, index) in expiryList"
          :key="index"
        >
          <view class="expiry-header">
            <text class="expiry-product">{{ expiry.productName }}</text>
            <text class="expiry-status" :class="expiry.status">{{
              expiry.statusText
            }}</text>
          </view>
          <view class="expiry-info">
            <text class="expiry-date">到期日期: {{ expiry.expiryDate }}</text>
            <text class="expiry-days">剩余: {{ expiry.remainingDays }}天</text>
          </view>
          <view class="expiry-actions">
            <text class="action-btn extend" @click="extendExpiry(expiry.id)"
              >延期</text
            >
            <text class="action-btn dispose" @click="disposeItem(expiry.id)"
              >处理</text
            >
          </view>
        </view>
      </view>
    </view>

    <!-- 仓库总结 -->
    <view class="summary-section">
      <view class="section-title">仓库总结</view>
      <view class="summary-content">
        <view class="summary-item">
          <text class="summary-label">本月入库</text>
          <text class="summary-value"
            >{{ warehouseSummary.monthlyInbound }}件</text
          >
        </view>
        <view class="summary-item">
          <text class="summary-label">本月出库</text>
          <text class="summary-value"
            >{{ warehouseSummary.monthlyOutbound }}件</text
          >
        </view>
        <view class="summary-item">
          <text class="summary-label">库存周转率</text>
          <text class="summary-value"
            >{{ warehouseSummary.turnoverRate }}%</text
          >
        </view>
        <view class="summary-item">
          <text class="summary-label">库存准确率</text>
          <text class="summary-value"
            >{{ warehouseSummary.accuracyRate }}%</text
          >
        </view>
      </view>
    </view>

    <!-- 悬浮添加按钮 -->
    <view class="fab-button" @click="addWarehouse">
      <text class="fab-icon">+</text>
    </view>

    <!-- 自定义 TabBar -->
    <CustomTabBar />
  </view>
</template>

<script>
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
			warehouseStats: {
				totalProducts: 111,
				totalValue: 89.5,
				lowStock: 23,
				expiring: 8
			},
			warehouseList: [
				{
					id: 1,
					name: '主仓库',
					location: '北京市朝阳区',
					capacity: '1000㎡',
					status: 'active',
					statusText: '正常运营'
				},
				{
					id: 2,
					name: '分仓库A',
					location: '上海市浦东新区',
					capacity: '500㎡',
					status: 'active',
					statusText: '正常运营'
				},
				{
					id: 3,
					name: '临时仓库',
					location: '广州市天河区',
					capacity: '200㎡',
					status: 'maintenance',
					statusText: '维护中'
				}
			],
			inboundList: [
				{
					id: 'IN001',
					supplier: '苹果官方',
					itemCount: 50,
					status: 'pending',
					statusText: '待处理'
				},
				{
					id: 'IN002',
					supplier: '华为官方',
					itemCount: 30,
					status: 'processing',
					statusText: '处理中'
				},
				{
					id: 'IN003',
					supplier: '小米官方',
					itemCount: 25,
					status: 'completed',
					statusText: '已完成'
				}
			],
			inventoryList: [
				{
					id: 1,
					name: 'iPhone 15 Pro',
					stock: 15,
					value: '134,985.00',
					location: 'A区-01-01',
					expiryDate: '2025-12-01',
					stockStatus: 'normal',
					stockText: '正常'
				},
				{
					id: 2,
					name: 'MacBook Air M2',
					stock: 5,
					value: '49,995.00',
					location: 'A区-01-02',
					expiryDate: '2025-11-15',
					stockStatus: 'low',
					stockText: '库存不足'
				},
				{
					id: 3,
					name: 'AirPods Pro',
					stock: 0,
					value: '0.00',
					location: 'B区-02-01',
					expiryDate: '2025-10-30',
					stockStatus: 'out',
					stockText: '缺货'
				}
			],
			expiryList: [
				{
					id: 1,
					productName: 'iPhone 14 Pro',
					expiryDate: '2024-12-15',
					remainingDays: 14,
					status: 'warning',
					statusText: '即将过期'
				},
				{
					id: 2,
					productName: 'iPad Air',
					expiryDate: '2024-12-20',
					remainingDays: 19,
					status: 'normal',
					statusText: '正常'
				},
				{
					id: 3,
					productName: 'Apple Watch Series 8',
					expiryDate: '2024-12-10',
					remainingDays: 9,
					status: 'urgent',
					statusText: '紧急'
				}
			],
			warehouseSummary: {
				monthlyInbound: 156,
				monthlyOutbound: 142,
				turnoverRate: 85.2,
				accuracyRate: 98.5
			}
		}
	},
	methods: {
		addWarehouse() {
			uni.showToast({
				title: '新增仓库功能开发中',
				icon: 'none'
			});
		},

		viewWarehouse(warehouseId) {
			uni.showToast({
				title: '查看仓库详情功能开发中',
				icon: 'none'
			});
		},

		editWarehouse(warehouseId) {
			uni.showToast({
				title: '编辑仓库功能开发中',
				icon: 'none'
			});
		},

		processInbound() {
			uni.showToast({
				title: '处理入仓功能开发中',
				icon: 'none'
			});
		},

		processInboundItem(inboundId) {
			uni.showToast({
				title: '处理入仓项目功能开发中',
				icon: 'none'
			});
		},

		viewInboundDetail(inboundId) {
			uni.showToast({
				title: '查看入仓详情功能开发中',
				icon: 'none'
			});
		},

		updateStatus() {
			uni.showToast({
				title: '更新状态功能开发中',
				icon: 'none'
			});
		},

		adjustStock(itemId) {
			uni.showToast({
				title: '调整库存功能开发中',
				icon: 'none'
			});
		},

		moveItem(itemId) {
			uni.showToast({
				title: '移库功能开发中',
				icon: 'none'
			});
		},

		setExpiryReminder() {
			uni.showToast({
				title: '设置提醒功能开发中',
				icon: 'none'
			});
		},

		extendExpiry(expiryId) {
			uni.showToast({
				title: '延期功能开发中',
				icon: 'none'
			});
		},

		disposeItem(expiryId) {
			uni.showToast({
				title: '处理过期商品功能开发中',
				icon: 'none'
			});
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
		
		// 查看仓库商品详情
		viewWarehouseDetails() {
			uni.showToast({
				title: '仓库商品详情功能开发中',
				icon: 'none'
			});
		},
		
		// 查看仓库流水
		viewWarehouseFlow() {
			uni.showToast({
				title: '仓库流水功能开发中',
				icon: 'none'
			});
		}
	}
}
</script>

<style scoped>
.warehouse-container {
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
  background: #F44336;
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
  align-items: center;
}

.stats-number {
  flex: 1;
}

.main-stat-number {
  font-size: 72rpx;
  font-weight: bold;
  color: #333;
}

.status-labels {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.status-label {
  padding: 6rpx 12rpx;
  border-radius: 4rpx;
  font-size: 24rpx;
  color: #fff;
  text-align: center;
  min-width: 60rpx;
}

.status-label.gray {
  background: #888888;
}

.status-label.green {
  background: #4CAF50;
}

.action-buttons {
  display: flex;
  gap: 20rpx;
  margin: 0 40rpx 20rpx;
}

.action-button {
  flex: 1;
  background: #F44336;
  border-radius: 4rpx;
  padding: 20rpx;
  text-align: center;
  border: 2rpx solid #F44336;
}

.button-text {
  color: #fff;
  font-size: 28rpx;
  font-weight: regular;
}

.warehouse-section,
.inbound-section,
.inventory-section,
.expiry-section,
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
  color: #F44336;
}

.warehouse-list,
.inbound-list,
.inventory-list,
.expiry-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.warehouse-item,
.inbound-item,
.inventory-item,
.expiry-item {
  padding: 25rpx;
  background: #f8f9fa;
  border-radius: 15rpx;
}

.warehouse-header,
.inbound-header,
.inventory-header,
.expiry-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.warehouse-name,
.inbound-id,
.inventory-name,
.expiry-product {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.warehouse-status,
.inbound-status,
.inventory-status,
.expiry-status {
  padding: 6rpx 12rpx;
  border-radius: 15rpx;
  font-size: 22rpx;
}

.warehouse-status.active,
.inbound-status.completed,
.inventory-status.normal,
.expiry-status.normal {
  background: #34c759;
  color: #fff;
}

.warehouse-status.maintenance,
.inbound-status.pending,
.inventory-status.low,
.expiry-status.warning {
  background: #ff9500;
  color: #fff;
}

.inbound-status.processing {
  background: #007aff;
  color: #fff;
}

.inventory-status.out,
.expiry-status.urgent {
  background: #ff3b30;
  color: #fff;
}

.warehouse-info,
.inbound-info,
.inventory-info,
.expiry-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.warehouse-location,
.inbound-supplier,
.inventory-stock,
.expiry-date {
  font-size: 24rpx;
  color: #666;
}

.warehouse-capacity,
.inbound-items,
.inventory-value,
.expiry-days {
  font-size: 26rpx;
  color: #333;
  font-weight: bold;
}

.inventory-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.inventory-location,
.inventory-expiry {
  font-size: 24rpx;
  color: #666;
}

.warehouse-actions,
.inbound-actions,
.inventory-actions,
.expiry-actions {
  display: flex;
  gap: 20rpx;
}

.action-btn {
  padding: 8rpx 16rpx;
  border-radius: 15rpx;
  font-size: 22rpx;
}

.action-btn.view {
  background: #F44336;
  color: #fff;
}

.action-btn.edit {
  background: #ff9500;
  color: #fff;
}

.action-btn.process {
  background: #34c759;
  color: #fff;
}

.action-btn.adjust {
  background: #af52de;
  color: #fff;
}

.action-btn.move {
  background: #5856d6;
  color: #fff;
}

.action-btn.extend {
  background: #ff9500;
  color: #fff;
}

.action-btn.dispose {
  background: #ff3b30;
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
  color: #F44336;
  font-weight: bold;
}

.fab-button {
  position: fixed;
  bottom: calc(100rpx + 40rpx + env(safe-area-inset-bottom));
  right: 40rpx;
  width: 100rpx;
  height: 100rpx;
  background: #F44336;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(244, 67, 54, 0.3);
  z-index: 1000;
}

.fab-icon {
  color: #fff;
  font-size: 40rpx;
  font-weight: bold;
}
</style>
