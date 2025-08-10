<template>
  <view class="order-add-container">
    <!-- 头部导航 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="header-icon">×</text>
      </view>
      <view class="header-center">
        <text class="header-title">新订单</text>
      </view>
      <view class="header-right" @click="saveOrder">
        <text class="header-icon">✓</text>
      </view>
    </view>

    <!-- 主要内容区域 -->
    <view class="content">
      <!-- 客户信息表单 -->
      <view class="form-section">
        <view class="form-item">
          <text class="form-label">客户姓名：</text>
          <input
            class="form-input"
            v-model="orderForm.customerName"
            placeholder="请输入客户姓名"
            @blur="validateCustomerName"
          />
          <text class="customer-select-icon" @click="selectCustomer">📋</text>
        </view>

        <view class="form-item">
          <text class="form-label">联系电话：</text>
          <input
            class="form-input"
            v-model="orderForm.customerPhone"
            placeholder="请输入联系电话"
            type="number"
            @blur="validatePhone"
            disabled
          />
        </view>

        <view class="form-item">
          <text class="form-label">省市区：</text>
          <input
            class="form-input"
            v-model="orderForm.address"
            placeholder="请选择省市区"
            disabled
          />
        </view>

        <view class="form-item color-item" @click="selectColor">
          <text class="form-label">颜色：</text>
          <view class="color-value">
            <view class="color-display">
              <view class="color-dot" :class="getColorClass(orderForm.selectedColor)"></view>
              <text class="color-text">{{ orderForm.selectedColor || '默认' }}</text>
            </view>
            <text class="arrow-icon">></text>
          </view>
        </view>
      </view>

      <!-- 商品选择提示 -->
      <view class="product-hint">
        <text class="hint-text">向左滑动移除商品</text>
      </view>

      <!-- 添加商品按钮 -->
      <view class="add-product-btn" @click="addProduct">
        <text class="add-product-text">添加商品</text>
      </view>

      <!-- 商品列表 -->
      <view class="product-list" v-if="orderForm.products.length > 0">
        <view 
          class="product-item" 
          v-for="(product, index) in orderForm.products" 
          :key="index"
          @touchstart="onTouchStart($event, index)"
          @touchmove="onTouchMove($event, index)"
          @touchend="onTouchEnd($event, index)"
        >
          <view class="product-info">
            <text class="product-name">{{ product.name }}</text>
            <text class="product-spec">{{ product.spec }}</text>
            <view class="product-price-qty">
              <text class="product-price">¥{{ product.price }}</text>
              <text class="product-qty">x{{ product.quantity }}</text>
            </view>
          </view>
          <view class="product-total">
            <text class="product-total-price">¥{{ (product.price * product.quantity).toFixed(2) }}</text>
          </view>
        </view>
      </view>

      <!-- 支付信息 -->
      <view class="info-section">
        <view class="info-item" @click="selectPaymentMethod">
          <text class="info-label">支付信息：</text>
          <text class="info-value">{{ orderForm.paymentStatus }}</text>
          <text class="arrow-icon">></text>
        </view>
      </view>

      <!-- 物流信息 -->
      <view class="info-section">
        <view class="info-item" @click="selectLogistics">
          <text class="info-label">物流信息：</text>
          <text class="info-value">{{ orderForm.logisticsInfo }}</text>
          <text class="arrow-icon">></text>
        </view>
      </view>

      <!-- 备注 -->
      <view class="form-section">
        <view class="form-item remark-item">
          <text class="form-label">备注：</text>
          <text class="remark-placeholder">{{ orderForm.remark || '无' }}</text>
        </view>
      </view>
    </view>

    <!-- 底部订单汇总 -->
    <view class="footer">
      <view class="order-summary">
        <view class="summary-row">
          <text class="summary-label">共 {{ totalProducts }}种商品，{{ totalQuantity }}件商品</text>
          <text class="summary-time">{{ currentTime }}</text>
        </view>
        <view class="summary-row">
          <text class="summary-label">+ 运费：</text>
          <text class="summary-value">{{ orderForm.shippingFee }}</text>
        </view>
        <view class="summary-row">
          <text class="summary-label">- 优惠：</text>
          <text class="summary-value">{{ orderForm.discount }}</text>
        </view>
        <view class="summary-row total-row">
          <text class="summary-label">成交价：</text>
          <text class="summary-total">{{ totalAmount }}</text>
          <text class="lock-icon">🔒</text>
        </view>
      </view>
    </view>

    <!-- 选择弹窗 -->
    <view class="modal-overlay" v-if="showModal" @click="closeModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ modalTitle }}</text>
        </view>
        <view class="modal-body">
          <view 
            class="modal-option" 
            v-for="(option, index) in modalOptions" 
            :key="index"
            @click="selectOption(option)"
          >
            <view class="option-content">
              <view 
                v-if="currentModalType === 'color'" 
                class="option-color-dot" 
                :class="getColorClass(option.label)"
              ></view>
              <text class="option-text">{{ option.label }}</text>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <text class="modal-btn cancel" @click="closeModal">取消</text>
          <text class="modal-btn confirm" @click="confirmSelection">完成</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      orderForm: {
        customerName: '',
        customerPhone: '',
        address: '',
        selectedColor: '',
        products: [],
        paymentStatus: '未支付',
        logisticsInfo: '无快递单号',
        remark: '',
        shippingFee: '0.00',
        discount: '0.00'
      },
      showModal: false,
      modalTitle: '',
      modalOptions: [],
      currentModalType: '',
      touchStartX: 0,
      touchStartY: 0,
      isMoving: false
    }
  },
  computed: {
    totalProducts() {
      return this.orderForm.products.length
    },
    totalQuantity() {
      return this.orderForm.products.reduce((sum, product) => sum + product.quantity, 0)
    },
    totalAmount() {
      const productTotal = this.orderForm.products.reduce((sum, product) => {
        return sum + (product.price * product.quantity)
      }, 0)
      const shipping = parseFloat(this.orderForm.shippingFee) || 0
      const discount = parseFloat(this.orderForm.discount) || 0
      return (productTotal + shipping - discount).toFixed(2)
    },
    currentTime() {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}`
    }
  },
  onLoad() {
    this.initOrderForm()
  },
  onShow() {
    // 检查是否有选中的商品
    this.checkSelectedProduct()
  },
  methods: {
    initOrderForm() {
      // 初始化表单数据
      console.log('初始化新订单表单')
    },

    goBack() {
      uni.showModal({
        title: '提示',
        content: '确定要放弃当前编辑的订单吗？',
        success: (res) => {
          if (res.confirm) {
            uni.navigateBack()
          }
        }
      })
    },

    async saveOrder() {
      if (!this.validateForm()) {
        return
      }

      uni.showLoading({
        title: '保存中...'
      })

      try {
        // 这里调用API保存订单
        // const response = await apiService.createOrder(this.orderForm)
        
        // 模拟保存成功
        setTimeout(() => {
          uni.hideLoading()
          uni.showToast({
            title: '订单保存成功',
            icon: 'success'
          })
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        }, 1000)
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: '保存失败',
          icon: 'none'
        })
      }
    },

    validateForm() {
      if (!this.orderForm.customerName.trim()) {
        uni.showToast({
          title: '请输入客户姓名',
          icon: 'none'
        })
        return false
      }
      if (!this.orderForm.customerPhone.trim()) {
        uni.showToast({
          title: '请输入联系电话',
          icon: 'none'
        })
        return false
      }
      return true
    },

    validateCustomerName() {
      // 客户姓名验证逻辑
    },

    validatePhone() {
      // 电话号码验证逻辑
    },

    selectCustomer() {
      // 跳转到客户选择页面
      uni.navigateTo({
        url: '/pages/customer/customer-select?from=order'
      })
    },

    addProduct() {
      // 跳转到商品分类选择页面
      uni.navigateTo({
        url: '/pages/product/product-category?from=order'
      })
    },

    selectPaymentMethod() {
      this.modalTitle = '支付方式'
      this.modalOptions = [
        { label: '未支付', value: 'unpaid' },
        { label: '已支付', value: 'paid' },
        { label: '部分支付', value: 'partial' }
      ]
      this.currentModalType = 'payment'
      this.showModal = true
    },

    selectLogistics() {
      this.modalTitle = '物流信息'
      this.modalOptions = [
        { label: '无快递单号', value: 'none' },
        { label: '顺丰快递', value: 'sf' },
        { label: '圆通快递', value: 'yt' },
        { label: '中通快递', value: 'zt' }
      ]
      this.currentModalType = 'logistics'
      this.showModal = true
    },

    selectColor() {
      this.modalTitle = '选择颜色'
      this.modalOptions = [
        { label: '默认', value: 'default' },
        { label: '红色', value: 'red' },
        { label: '粉色', value: 'pink' },
        { label: '橙色', value: 'orange' },
        { label: '黄色', value: 'yellow' },
        { label: '绿色', value: 'green' },
        { label: '蓝色', value: 'blue' }
      ]
      this.currentModalType = 'color'
      this.showModal = true
    },

    selectOption(option) {
      this.selectedOption = option
    },

    confirmSelection() {
      if (!this.selectedOption) {
        this.closeModal()
        return
      }

      switch (this.currentModalType) {
        case 'address':
          this.orderForm.address = this.selectedOption.label
          break
        case 'payment':
          this.orderForm.paymentStatus = this.selectedOption.label
          break
        case 'logistics':
          this.orderForm.logisticsInfo = this.selectedOption.label
          break
        case 'color':
          this.orderForm.selectedColor = this.selectedOption.label
          break
      }
      
      this.closeModal()
    },

    closeModal() {
      this.showModal = false
      this.selectedOption = null
      this.currentModalType = ''
    },

    // 触摸事件处理（用于滑动删除商品）
    onTouchStart(event, index) {
      this.touchStartX = event.touches[0].clientX
      this.touchStartY = event.touches[0].clientY
      this.isMoving = false
    },

    onTouchMove(event, index) {
      if (!this.isMoving) {
        const deltaX = Math.abs(event.touches[0].clientX - this.touchStartX)
        const deltaY = Math.abs(event.touches[0].clientY - this.touchStartY)
        
        if (deltaX > deltaY && deltaX > 10) {
          this.isMoving = true
        }
      }
    },

    onTouchEnd(event, index) {
      if (this.isMoving) {
        const deltaX = event.changedTouches[0].clientX - this.touchStartX
        
        if (deltaX < -50) {
          // 左滑删除商品
          uni.showModal({
            title: '确认删除',
            content: '确定要移除这个商品吗？',
            success: (res) => {
              if (res.confirm) {
                this.orderForm.products.splice(index, 1)
              }
            }
          })
        }
      }
      this.isMoving = false
    },

    getColorClass(colorName) {
      const colorMap = {
        '默认': 'color-default',
        '红色': 'color-red',
        '粉色': 'color-pink',
        '橙色': 'color-orange',
        '黄色': 'color-yellow',
        '绿色': 'color-green',
        '蓝色': 'color-blue'
      }
      return colorMap[colorName] || 'color-default'
    },

    checkSelectedProduct() {
      // 检查是否有选中的商品数据
      const selectedProduct = uni.getStorageSync('selected_product')
      if (selectedProduct) {
        // 检查是否已经存在相同商品
        const existingIndex = this.orderForm.products.findIndex(p => p.id === selectedProduct.id)
        
        if (existingIndex >= 0) {
          // 如果商品已存在，增加数量
          this.orderForm.products[existingIndex].quantity += 1
          uni.showToast({
            title: '商品数量+1',
            icon: 'success'
          })
        } else {
          // 如果是新商品，添加到列表
          this.orderForm.products.push(selectedProduct)
          uni.showToast({
            title: '商品添加成功',
            icon: 'success'
          })
        }
        
        // 清除临时存储
        uni.removeStorageSync('selected_product')
      }
    }
  }
}
</script>

<style scoped>
/* 整体容器 */
.order-add-container {
  height: 100vh;
  background-color: #F5F5F5;
  display: flex;
  flex-direction: column;
}

/* 头部导航 */
.header {
  height: 48px;
  background-color: #F44336;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.header-left,
.header-right {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-center {
  flex: 1;
  text-align: center;
}

.header-title {
  color: #FFFFFF;
  font-size: 18px;
  font-weight: bold;
}

.header-icon {
  color: #FFFFFF;
  font-size: 24px;
  font-weight: bold;
}

/* 主要内容区域 */
.content {
  flex: 1;
  margin-top: 48px;
  /* margin-bottom: 120px; */
  /* overflow-y: auto; */
}

/* 表单部分 */
.form-section {
  background-color: #FFFFFF;
  margin: 8px 0;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #F0F0F0;
  position: relative;
}

.form-item:last-child {
  border-bottom: none;
}

.form-label {
  width: 80px;
  color: #333333;
  font-size: 16px;
  flex-shrink: 0;
}

.form-input {
  flex: 1;
  color: #333333;
  font-size: 16px;
  border: none;
  outline: none;
  padding: 0;
  margin-left: 8px;
}

.customer-select-icon {
  color: #F44336;
  font-size: 20px;
  margin-left: 8px;
}

/* 颜色选择项 */
.color-item {
  cursor: pointer;
}

.color-value {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-left: 8px;
}

.color-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-dot {
  width: 16px;
  height: 16px;
  border-radius: 8px;
  border: 1px solid #E0E0E0;
}

.color-default {
  background-color: #F5F5F5;
}

.color-red {
  background-color: #F44336;
}

.color-pink {
  background-color: #E91E63;
}

.color-orange {
  background-color: #FF9800;
}

.color-yellow {
  background-color: #FFEB3B;
}

.color-green {
  background-color: #4CAF50;
}

.color-blue {
  background-color: #2196F3;
}

.color-text {
  color: #333333;
  font-size: 16px;
}

.arrow-icon {
  color: #999999;
  font-size: 16px;
}

/* 商品提示 */
.product-hint {
  padding: 8px 16px;
}

.hint-text {
  color: #999999;
  font-size: 14px;
}

/* 添加商品按钮 */
.add-product-btn {
  background-color: #F44336;
  margin: 16px;
  height: 48px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-product-text {
  color: #FFFFFF;
  font-size: 16px;
  font-weight: bold;
}

/* 商品列表 */
.product-list {
  background-color: #FFFFFF;
  margin: 8px 0;
}

.product-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #F0F0F0;
}

.product-item:last-child {
  border-bottom: none;
}

.product-info {
  flex: 1;
}

.product-name {
  color: #333333;
  font-size: 16px;
  font-weight: bold;
  display: block;
  margin-bottom: 4px;
}

.product-spec {
  color: #666666;
  font-size: 14px;
  display: block;
  margin-bottom: 4px;
}

.product-price-qty {
  display: flex;
  align-items: center;
  gap: 8px;
}

.product-price {
  color: #F44336;
  font-size: 14px;
}

.product-qty {
  color: #666666;
  font-size: 14px;
}

.product-total {
  text-align: right;
}

.product-total-price {
  color: #333333;
  font-size: 16px;
  font-weight: bold;
}

/* 信息部分 */
.info-section {
  background-color: #FFFFFF;
  margin: 8px 0;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #F0F0F0;
  cursor: pointer;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  width: 80px;
  color: #333333;
  font-size: 16px;
  flex-shrink: 0;
}

.info-value {
  flex: 1;
  color: #333333;
  font-size: 16px;
  margin-left: 8px;
}

/* 备注项 */
.remark-item {
  align-items: flex-start;
  padding-top: 16px;
  padding-bottom: 16px;
}

.remark-placeholder {
  flex: 1;
  color: #999999;
  font-size: 16px;
  margin-left: 8px;
}

/* 底部汇总 */
.footer {
  background-color: #F5F5F5;
  border-top: 1px solid #E0E0E0;
  padding: 16px;
}

.order-summary {
  background-color: #FFFFFF;
  border-radius: 4px;
  padding: 16px;
}

.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.summary-row:last-child {
  margin-bottom: 0;
}

.summary-label {
  color: #666666;
  font-size: 14px;
}

.summary-value {
  color: #333333;
  font-size: 14px;
}

.summary-time {
  color: #999999;
  font-size: 12px;
}

.total-row {
  border-top: 1px solid #F0F0F0;
  padding-top: 8px;
  margin-top: 8px;
}

.summary-total {
  color: #F44336;
  font-size: 16px;
  font-weight: bold;
}

.lock-icon {
  color: #F44336;
  font-size: 16px;
  margin-left: 4px;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: #FFFFFF;
  border-radius: 8px;
  width: 80%;
  max-width: 400px;
  max-height: 60%;
  overflow: hidden;
}

.modal-header {
  padding: 16px;
  border-bottom: 1px solid #F0F0F0;
  text-align: center;
}

.modal-title {
  color: #333333;
  font-size: 18px;
  font-weight: bold;
}

.modal-body {
  max-height: 300px;
  overflow-y: auto;
}

.modal-option {
  padding: 16px;
  border-bottom: 1px solid #F0F0F0;
  cursor: pointer;
}

.modal-option:last-child {
  border-bottom: none;
}

.option-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.option-color-dot {
  width: 20px;
  height: 20px;
  border-radius: 10px;
  border: 1px solid #E0E0E0;
}

.option-text {
  color: #333333;
  font-size: 16px;
}

.modal-footer {
  display: flex;
  border-top: 1px solid #F0F0F0;
}

.modal-btn {
  flex: 1;
  padding: 16px;
  text-align: center;
  font-size: 16px;
  cursor: pointer;
}

.modal-btn.cancel {
  color: #666666;
  border-right: 1px solid #F0F0F0;
}

.modal-btn.confirm {
  color: #F44336;
  font-weight: bold;
}
</style>
