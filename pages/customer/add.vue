<template>
  <view class="customer-add-container">
    <!-- 头部导航 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="header-icon">×</text>
      </view>
      <view class="header-center">
        <text class="header-title">添加客户</text>
      </view>
      <view class="header-right" @click="saveCustomer">
        <text class="header-icon">✓</text>
      </view>
    </view>

    <!-- 主要内容区域 -->
    <view class="content">
      <!-- 必填内容提示 -->
      <view class="required-section">
        <text class="required-title">必填内容：</text>
      </view>

      <!-- 必填信息表单 -->
      <view class="form-section">
        <view class="form-item">
          <text class="form-label">姓名：</text>
          <input
            class="form-input"
            v-model="customerForm.name"
            placeholder="请输入客户姓名"
            @blur="validateName"
          />
        </view>

        <view class="form-item">
          <text class="form-label">电话：</text>
          <input
            class="form-input"
            v-model="customerForm.phone"
            placeholder="请输入联系电话"
            type="number"
            @blur="validatePhone"
          />
        </view>

        <view class="form-item clickable" @click="selectRegion">
          <text class="form-label">所在地区：</text>
          <text class="form-value" :class="{ placeholder: !customerForm.region }">
            {{ customerForm.region || '请选择省市区' }}
          </text>
          <text class="arrow-icon">></text>
        </view>

        <view class="form-item clickable" @click="editDetailAddress">
          <text class="form-label">详细地址：</text>
          <text class="form-value placeholder">{{ customerForm.detailAddress || '无' }}</text>
          <text class="arrow-icon">></text>
        </view>

        <view class="form-item clickable" @click="selectCustomerType">
          <text class="form-label">客户类型：</text>
          <text class="form-value">{{ customerForm.customerType || '个人买家' }}</text>
          <text class="arrow-icon">></text>
        </view>
      </view>

      <!-- 选填内容提示 -->
      <view class="optional-section">
        <text class="optional-title">选填内容：</text>
      </view>

      <!-- 选填信息表单 -->
      <view class="form-section">
        <view class="form-item clickable" @click="selectGender">
          <text class="form-label">性别：</text>
          <text class="form-value" :class="{ placeholder: !customerForm.gender }">
            {{ customerForm.gender || '请选择' }}
          </text>
          <text class="arrow-icon">></text>
        </view>

        <view class="form-item">
          <text class="form-label">年龄：</text>
          <input
            class="form-input"
            v-model="customerForm.age"
            placeholder="请输入年龄"
            type="number"
          />
        </view>

        <view class="form-item clickable" @click="selectPaymentMethod">
          <text class="form-label">首选支付方式：</text>
          <text class="form-value" :class="{ placeholder: !customerForm.paymentMethod }">
            {{ customerForm.paymentMethod || '请选择' }}
          </text>
          <text class="arrow-icon">></text>
        </view>

        <view class="form-item description-item clickable" @click="editDescription">
          <text class="form-label">描述：</text>
          <text class="form-value placeholder">{{ customerForm.description || '无' }}</text>
          <text class="arrow-icon">></text>
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
            :class="{ selected: selectedOption && selectedOption.value === option.value }"
          >
            <text class="option-text">{{ option.label }}</text>
            <text class="check-icon" v-if="selectedOption && selectedOption.value === option.value">✓</text>
          </view>
        </view>
        <view class="modal-footer">
          <text class="modal-btn cancel" @click="closeModal">取消</text>
          <text class="modal-btn confirm" @click="confirmSelection">完成</text>
        </view>
      </view>
    </view>

    <!-- 详细地址编辑弹窗 -->
    <view class="modal-overlay" v-if="showAddressModal" @click="closeAddressModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">详细地址</text>
        </view>
        <view class="modal-body">
          <textarea 
            class="address-textarea"
            v-model="tempAddress"
            placeholder="请输入详细地址"
            maxlength="200"
          />
        </view>
        <view class="modal-footer">
          <text class="modal-btn cancel" @click="closeAddressModal">取消</text>
          <text class="modal-btn confirm" @click="confirmAddress">完成</text>
        </view>
      </view>
    </view>

    <!-- 描述编辑弹窗 -->
    <view class="modal-overlay" v-if="showDescriptionModal" @click="closeDescriptionModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">客户描述</text>
        </view>
        <view class="modal-body">
          <textarea 
            class="description-textarea"
            v-model="tempDescription"
            placeholder="请输入客户描述信息"
            maxlength="500"
          />
        </view>
        <view class="modal-footer">
          <text class="modal-btn cancel" @click="closeDescriptionModal">取消</text>
          <text class="modal-btn confirm" @click="confirmDescription">完成</text>
        </view>
      </view>
    </view>

    <!-- 城市选择器 -->
    <CityPicker 
      :visible="showCityPicker"
      :defaultValue="cityPickerValue"
      @confirm="onCityConfirm"
      @close="closeCityPicker"
    />
  </view>
</template>

<script>
import CityPicker from '../../components/CityPicker.vue'
import apiService from '../../utils/api.js'

export default {
  components: {
    CityPicker
  },
  data() {
    return {
      customerForm: {
        name: '',
        phone: '',
        region: '',
        regionCode: '',
        detailAddress: '',
        customerType: '个人买家',
        customerTypeCode: '1',
        gender: '',
        genderCode: '',
        age: '',
        paymentMethod: '',
        paymentMethodCode: '',
        description: '',
        offlineId: ''
      },
      showModal: false,
      showAddressModal: false,
      showDescriptionModal: false,
      showCityPicker: false,
      modalTitle: '',
      modalOptions: [],
      currentModalType: '',
      selectedOption: null,
      tempAddress: '',
      tempDescription: '',
      cityPickerValue: {
        province: {},
        city: {},
        district: {}
      }
    }
  },
  methods: {
    goBack() {
      if (this.hasChanges()) {
        uni.showModal({
          title: '提示',
          content: '确定要放弃当前编辑的客户信息吗？',
          success: (res) => {
            if (res.confirm) {
              uni.navigateBack()
            }
          }
        })
      } else {
        uni.navigateBack()
      }
    },

    hasChanges() {
      return this.customerForm.name || 
             this.customerForm.phone || 
             this.customerForm.region ||
             this.customerForm.detailAddress ||
             this.customerForm.gender ||
             this.customerForm.age ||
             this.customerForm.paymentMethod ||
             this.customerForm.description
    },

    async saveCustomer() {
      if (!this.validateForm()) {
        return
      }

      uni.showLoading({
        title: '保存中...'
      })

      try {
        // 生成离线ID（实际项目中可能由后端生成）
        const offlineId = 'customer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
        
        // 构建API参数
        const apiParams = {
          name: this.customerForm.name,
          tel: this.customerForm.phone,
          area: this.customerForm.regionCode || '110000',
          addr: this.customerForm.detailAddress || '',
          offline_id: offlineId,
          type: this.customerForm.customerTypeCode || '1',
          sex: this.customerForm.genderCode || '0',
          age: this.customerForm.age || '',
          pay: this.customerForm.paymentMethodCode || '',
          description: this.customerForm.description || '',
          pre_addr: this.customerForm.region || ''
        }
        
        console.log('API参数:', apiParams)
        
        // 调用API保存客户
        const response = await apiService.addCustomer(apiParams)
        
        uni.hideLoading()
        
        if (response && response.code === 1) {
          uni.showToast({
            title: '客户添加成功',
            icon: 'success'
          })
          
          // 如果是从客户选择页面进入的，需要特殊处理
          const pages = getCurrentPages()
          if (pages.length >= 3) {
            const customerSelectPage = pages[pages.length - 2]
            const orderPage = pages[pages.length - 3]
            
            // 将新客户信息传递给订单页面
            if (orderPage && orderPage.route.includes('order/add')) {
              orderPage.$vm.orderForm.customerName = this.customerForm.name
              orderPage.$vm.orderForm.customerPhone = this.customerForm.phone
              orderPage.$vm.orderForm.address = this.customerForm.region || ''
            }
          }
          
          setTimeout(() => {
            uni.navigateBack({ delta: 1 })
          }, 1500)
        } else {
          uni.showToast({
            title: response.message || '添加客户失败',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: '保存失败',
          icon: 'none'
        })
        console.error('保存客户失败:', error)
      }
    },

    validateForm() {
      if (!this.customerForm.name.trim()) {
        uni.showToast({
          title: '请输入客户姓名',
          icon: 'none'
        })
        return false
      }
      if (!this.customerForm.phone.trim()) {
        uni.showToast({
          title: '请输入联系电话',
          icon: 'none'
        })
        return false
      }
      if (!/^1[3-9]\d{9}$/.test(this.customerForm.phone)) {
        uni.showToast({
          title: '请输入正确的手机号码',
          icon: 'none'
        })
        return false
      }
      if (!this.customerForm.region.trim()) {
        uni.showToast({
          title: '请选择所在地区',
          icon: 'none'
        })
        return false
      }
      return true
    },

    validateName() {
      if (this.customerForm.name.trim().length < 2) {
        uni.showToast({
          title: '姓名至少2个字符',
          icon: 'none'
        })
      }
    },

    validatePhone() {
      if (this.customerForm.phone && !/^1[3-9]\d{9}$/.test(this.customerForm.phone)) {
        uni.showToast({
          title: '请输入正确的手机号码',
          icon: 'none'
        })
      }
    },

    selectRegion() {
      this.showCityPicker = true
    },

    selectCustomerType() {
      this.modalTitle = '客户类型'
      this.modalOptions = [
        { label: '个人买家', value: '1' },
        { label: '企业客户', value: '2' },
        { label: '代理商', value: '3' },
        { label: '批发商', value: '4' }
      ]
      this.currentModalType = 'customerType'
      this.showModal = true
    },

    selectGender() {
      this.modalTitle = '性别'
      this.modalOptions = [
        { label: '男', value: '1' },
        { label: '女', value: '2' },
        { label: '不愿透露', value: '0' }
      ]
      this.currentModalType = 'gender'
      this.showModal = true
    },

    selectPaymentMethod() {
      this.modalTitle = '首选支付方式'
      this.modalOptions = [
        { label: '微信支付', value: '1' },
        { label: '支付宝', value: '2' },
        { label: '现金', value: '3' },
        { label: '银行转账', value: '4' },
        { label: '货到付款', value: '5' }
      ]
      this.currentModalType = 'paymentMethod'
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
        case 'customerType':
          this.customerForm.customerType = this.selectedOption.label
          this.customerForm.customerTypeCode = this.selectedOption.value
          break
        case 'gender':
          this.customerForm.gender = this.selectedOption.label
          this.customerForm.genderCode = this.selectedOption.value
          break
        case 'paymentMethod':
          this.customerForm.paymentMethod = this.selectedOption.label
          this.customerForm.paymentMethodCode = this.selectedOption.value
          break
      }
      
      this.closeModal()
    },

    closeModal() {
      this.showModal = false
      this.selectedOption = null
      this.currentModalType = ''
    },

    editDetailAddress() {
      this.tempAddress = this.customerForm.detailAddress
      this.showAddressModal = true
    },

    closeAddressModal() {
      this.showAddressModal = false
      this.tempAddress = ''
    },

    confirmAddress() {
      this.customerForm.detailAddress = this.tempAddress
      this.closeAddressModal()
    },

    editDescription() {
      this.tempDescription = this.customerForm.description
      this.showDescriptionModal = true
    },

    closeDescriptionModal() {
      this.showDescriptionModal = false
      this.tempDescription = ''
    },

    confirmDescription() {
      this.customerForm.description = this.tempDescription
      this.closeDescriptionModal()
    },

    // 城市选择器相关方法
    onCityConfirm(result) {
      this.customerForm.region = result.fullAddress
      this.customerForm.regionCode = result.district.code
      this.cityPickerValue = {
        province: result.province,
        city: result.city,
        district: result.district
      }
    },

    closeCityPicker() {
      this.showCityPicker = false
    }
  }
}
</script>

<style scoped>
/* 整体容器 */
.customer-add-container {
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
  overflow-y: auto;
}

/* 必填/选填提示 */
.required-section,
.optional-section {
  padding: 12px 16px 8px;
}

.required-title,
.optional-title {
  color: #999999;
  font-size: 14px;
}

/* 表单部分 */
.form-section {
  background-color: #FFFFFF;
  margin-bottom: 8px;
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

.form-item.clickable {
  cursor: pointer;
}

.form-item.description-item {
  align-items: flex-start;
}

.form-label {
  width: 100px;
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

.form-value {
  flex: 1;
  color: #333333;
  font-size: 16px;
  margin-left: 8px;
}

.form-value.placeholder {
  color: #CCCCCC;
}

.arrow-icon {
  color: #CCCCCC;
  font-size: 16px;
  margin-left: 8px;
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.modal-option:last-child {
  border-bottom: none;
}

.modal-option.selected {
  background-color: #FFF5F5;
}

.option-text {
  color: #333333;
  font-size: 16px;
}

.check-icon {
  color: #F44336;
  font-size: 16px;
  font-weight: bold;
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

/* 文本域样式 */
.address-textarea,
.description-textarea {
  width: 100%;
  min-height: 120px;
  padding: 16px;
  border: 1px solid #F0F0F0;
  border-radius: 4px;
  font-size: 16px;
  color: #333333;
  resize: none;
  outline: none;
  margin: 16px;
  box-sizing: border-box;
}

.address-textarea:focus,
.description-textarea:focus {
  border-color: #F44336;
}
</style> 