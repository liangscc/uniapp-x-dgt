<template>
  <view class="product-detail-container">
    <!-- 商品图片 -->
    <view class="product-image-section">
      <image
        class="product-image"
        :src="productInfo.image"
        mode="aspectFill"
      ></image>
      <view class="stock-badge" :class="productInfo.stockStatus">
        {{ productInfo.stockText }}
      </view>
    </view>

    <!-- 商品基本信息 -->
    <view class="product-info-section">
      <text class="product-name">{{ productInfo.name }}</text>
      <text class="product-category">{{ productInfo.category }}</text>
      <view class="product-price">
        <text class="price-symbol">¥</text>
        <text class="price-value">{{ productInfo.price }}</text>
      </view>
      <view class="product-stock">
        <text class="stock-label">库存数量:</text>
        <text class="stock-value" :class="productInfo.stockStatus">{{
          productInfo.stock
        }}</text>
      </view>
    </view>

    <!-- 商品详细信息 -->
    <view class="detail-section">
      <view class="section-title">详细信息</view>
      <view class="detail-content">
        <view class="detail-item">
          <text class="detail-label">商品编号</text>
          <text class="detail-value">{{ productInfo.productNo }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">品牌</text>
          <text class="detail-value">{{ productInfo.brand }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">型号</text>
          <text class="detail-value">{{ productInfo.model }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">颜色</text>
          <text class="detail-value">{{ productInfo.color }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">尺寸</text>
          <text class="detail-value">{{ productInfo.size }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">重量</text>
          <text class="detail-value">{{ productInfo.weight }}</text>
        </view>
      </view>
    </view>

    <!-- 销售统计 -->
    <view class="sales-section">
      <view class="section-title">销售统计</view>
      <view class="sales-content">
        <view class="sales-item">
          <text class="sales-label">本月销量</text>
          <text class="sales-value">{{ productInfo.sales.monthly }}</text>
        </view>
        <view class="sales-item">
          <text class="sales-label">总销量</text>
          <text class="sales-value">{{ productInfo.sales.total }}</text>
        </view>
        <view class="sales-item">
          <text class="sales-label">销售额</text>
          <text class="sales-value">¥{{ productInfo.sales.amount }}</text>
        </view>
        <view class="sales-item">
          <text class="sales-label">利润率</text>
          <text class="sales-value">{{ productInfo.sales.profitRate }}%</text>
        </view>
      </view>
    </view>

    <!-- 库存记录 -->
    <view class="inventory-section">
      <view class="section-title">库存记录</view>
      <view class="inventory-content">
        <view
          class="inventory-item"
          v-for="(record, index) in productInfo.inventoryRecords"
          :key="index"
        >
          <view class="record-header">
            <text class="record-type">{{ record.type }}</text>
            <text class="record-time">{{ record.time }}</text>
          </view>
          <view class="record-details">
            <text class="record-quantity"
              >{{ record.quantity > 0 ? '+' : '' }}{{ record.quantity }}</text
            >
            <text class="record-operator">{{ record.operator }}</text>
          </view>
          <text class="record-remark" v-if="record.remark">{{
            record.remark
          }}</text>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-section">
      <view class="action-buttons">
        <button class="action-btn edit" @click="editProduct">编辑商品</button>
        <button class="action-btn adjust" @click="adjustStock">调整库存</button>
        <button class="action-btn delete" @click="deleteProduct">
          删除商品
        </button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      productInfo: {
        name: 'iPhone 15 Pro',
        category: '手机',
        price: '8,999',
        stock: 15,
        image: '/static/logo.png',
        stockStatus: 'normal',
        stockText: '有库存',
        productNo: 'IP15P001',
        brand: 'Apple',
        model: 'iPhone 15 Pro',
        color: '深空黑色',
        size: '6.1英寸',
        weight: '187g',
        sales: {
          monthly: 8,
          total: 156,
          amount: '1,403,844',
          profitRate: 25.6,
        },
        inventoryRecords: [
          {
            type: '入库',
            time: '2024-12-01 14:30',
            quantity: 20,
            operator: '张三',
            remark: '新货入库',
          },
          {
            type: '出库',
            time: '2024-11-30 16:45',
            quantity: -3,
            operator: '李四',
            remark: '销售出库',
          },
          {
            type: '入库',
            time: '2024-11-28 10:20',
            quantity: 15,
            operator: '王五',
            remark: '补货入库',
          },
          {
            type: '出库',
            time: '2024-11-25 15:30',
            quantity: -5,
            operator: '赵六',
            remark: '销售出库',
          },
        ],
      },
    }
  },
  onLoad(options) {
    if (options.id) {
      this.loadProductDetail(options.id)
    }
  },
  methods: {
    loadProductDetail(productId) {
      // 加载商品详情数据
      console.log('加载商品详情:', productId)
    },

    editProduct() {
      uni.showToast({
        title: '编辑商品功能开发中',
        icon: 'none',
      })
    },

    adjustStock() {
      uni.showToast({
        title: '调整库存功能开发中',
        icon: 'none',
      })
    },

    deleteProduct() {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这个商品吗？',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '删除成功',
              icon: 'success',
            })
            setTimeout(() => {
              uni.navigateBack()
            }, 1500)
          }
        },
      })
    },
  },
}
</script>

<style scoped>
.product-detail-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.product-image-section {
  position: relative;
  width: 100%;
  height: 400rpx;
  background: #fff;
}

.product-image {
  width: 100%;
  height: 100%;
}

.stock-badge {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  padding: 8rpx 16rpx;
  border-radius: 15rpx;
  font-size: 24rpx;
  color: #fff;
}

.stock-badge.normal {
  background: #34c759;
}

.stock-badge.low {
  background: #ff9500;
}

.stock-badge.out {
  background: #ff3b30;
}

.product-info-section {
  background: #fff;
  margin: 20rpx 40rpx;
  border-radius: 20rpx;
  padding: 40rpx;
}

.product-name {
  display: block;
  font-size: 36rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 15rpx;
}

.product-category {
  display: block;
  font-size: 26rpx;
  color: #666;
  margin-bottom: 20rpx;
}

.product-price {
  display: flex;
  align-items: baseline;
  margin-bottom: 20rpx;
}

.price-symbol {
  font-size: 28rpx;
  color: #ff3b30;
  margin-right: 5rpx;
}

.price-value {
  font-size: 40rpx;
  color: #ff3b30;
  font-weight: bold;
}

.product-stock {
  display: flex;
  align-items: center;
}

.stock-label {
  font-size: 26rpx;
  color: #666;
  margin-right: 10rpx;
}

.stock-value {
  font-size: 26rpx;
  font-weight: bold;
}

.stock-value.normal {
  color: #34c759;
}

.stock-value.low {
  color: #ff9500;
}

.stock-value.out {
  color: #ff3b30;
}

.detail-section,
.sales-section,
.inventory-section {
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

.detail-content {
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

.sales-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.sales-item {
  background: #f8f9fa;
  padding: 25rpx;
  border-radius: 15rpx;
  text-align: center;
}

.sales-label {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.sales-value {
  font-size: 32rpx;
  color: #007aff;
  font-weight: bold;
}

.inventory-content {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.inventory-item {
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

.record-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.record-quantity {
  font-size: 28rpx;
  font-weight: bold;
}

.record-quantity:not([style*='color']) {
  color: #34c759;
}

.record-operator {
  font-size: 24rpx;
  color: #666;
}

.record-remark {
  font-size: 22rpx;
  color: #999;
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
  background: #ff9500;
  color: #fff;
}

.action-btn.adjust {
  background: #007aff;
  color: #fff;
}

.action-btn.delete {
  background: #ff3b30;
  color: #fff;
}
</style>
