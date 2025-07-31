<template>
  <view class="warehouse-container">
    <!-- 仓库统计 -->
    <view class="stats-section">
      <view class="stat-item">
        <text class="stat-number">{{ warehouseStats.totalProducts }}</text>
        <text class="stat-label">总商品数</text>
      </view>
      <view class="stat-item">
        <text class="stat-number">{{ warehouseStats.totalValue }}</text>
        <text class="stat-label">库存总值(万)</text>
      </view>
      <view class="stat-item">
        <text class="stat-number">{{ warehouseStats.lowStock }}</text>
        <text class="stat-label">库存不足</text>
      </view>
      <view class="stat-item">
        <text class="stat-number">{{ warehouseStats.expiring }}</text>
        <text class="stat-label">即将过期</text>
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
  </view>
</template>

<script>
export default {
	data() {
		return {
			warehouseStats: {
				totalProducts: 1256,
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
		}
	}
}
</script>

<style scoped>
.warehouse-container {
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
  color: #007aff;
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
  background: #007aff;
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
