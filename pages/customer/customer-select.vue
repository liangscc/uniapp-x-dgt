<template>
  <view class="customer-select-container">
    <!-- 头部导航 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="header-icon">×</text>
      </view>
      <view class="header-center">
        <text class="header-title">选择客户</text>
      </view>
      <view class="header-right" @click="addNewCustomer">
        <text class="header-icon">+</text>
      </view>
    </view>

    <!-- 搜索栏 -->
    <view class="search-section">
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input 
          class="search-input" 
          v-model="searchKeyword" 
          placeholder="搜索客户姓名或电话"
          @input="onSearchInput"
        />
        <text class="search-clear" v-if="searchKeyword" @click="clearSearch">×</text>
      </view>
    </view>

    <!-- 客户列表 -->
    <view class="customer-list" v-if="filteredCustomers.length > 0">
      <view 
        class="customer-item" 
        v-for="(customer, index) in filteredCustomers" 
        :key="customer.id"
        @click="selectCustomer(customer)"
      >
        <view class="customer-avatar">
          <text class="avatar-text">{{ customer.name.charAt(0) }}</text>
          <view class="vip-badge" v-if="customer.isVip">VIP</view>
        </view>

        <view class="customer-info">
          <view class="customer-header">
            <text class="customer-name">{{ customer.name }}</text>
            <text class="customer-level" :class="customer.level">{{ customer.levelText }}</text>
          </view>
          
          <view class="customer-details">
            <text class="customer-phone">{{ customer.phone }}</text>
            <text class="customer-location" v-if="customer.address">{{ customer.address }}</text>
          </view>
          
          <view class="customer-stats">
            <text class="stat-item">{{ customer.orderCount }}个订单</text>
            <text class="stat-item">消费¥{{ formatAmount(customer.totalAmount) }}</text>
          </view>
        </view>

        <view class="select-indicator">
          <text class="arrow-icon">></text>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="filteredCustomers.length === 0">
      <text class="empty-icon">👥</text>
      <text class="empty-text" v-if="searchKeyword">未找到相关客户</text>
      <text class="empty-text" v-else>暂无客户数据</text>
      <text class="empty-tip">点击右上角添加新客户</text>
      <view class="add-customer-btn" @click="addNewCustomer">
        <text class="add-customer-text">添加客户</text>
      </view>
    </view>
  </view>
</template>

<script>
import apiService from '../../utils/api.js'

export default {
  data() {
    return {
      searchKeyword: '',
      customerList: [
        {
          id: 'uuid1',
          name: '张三',
          phone: '13812345678',
          address: '北京市北京市朝阳区',
          detailAddress: '朝阳区建国门外大街1号',
          description: 'VIP客户，购买力强',
          level: 'vip',
          levelText: 'VIP客户',
          isVip: true,
          orderCount: 15,
          totalAmount: '25680.00',
          regTime: 1672531200000,
          sex: 1,
          age: 35,
          area: '110105',
          pay: 1,
          offlineId: 'default',
          accountId: '1'
        },
        {
          id: 'uuid2',
          name: '李四',
          phone: '13923456789',
          address: '上海市上海市浦东新区',
          detailAddress: '浦东新区陆家嘴金融中心',
          description: '普通客户',
          level: 'regular',
          levelText: '个人买家',
          isVip: false,
          orderCount: 8,
          totalAmount: '12450.00',
          regTime: 1672531200000,
          sex: 2,
          age: 28,
          area: '310115',
          pay: 2,
          offlineId: 'default',
          accountId: '1'
        },
        {
          id: 'uuid3',
          name: '王五',
          phone: '13734567890',
          address: '广东省广州市天河区',
          detailAddress: '天河区珠江新城',
          description: 'VIP客户，长期合作',
          level: 'vip',
          levelText: 'VIP客户',
          isVip: true,
          orderCount: 22,
          totalAmount: '38920.00',
          regTime: 1672531200000,
          sex: 1,
          age: 42,
          area: '440106',
          pay: 1,
          offlineId: 'default',
          accountId: '1'
        }
      ]
    }
  },
  computed: {
    filteredCustomers() {
      if (!this.searchKeyword.trim()) {
        return this.customerList
      }
      
      const keyword = this.searchKeyword.toLowerCase()
      return this.customerList.filter(customer => {
        return customer.name.toLowerCase().includes(keyword) || 
               customer.phone.includes(keyword)
      })
    }
  },
  onLoad(options) {
    // 接收来源页面信息
    this.fromPage = options.from || 'order'
  },
  onShow() {
     // 加载客户数据
     this.loadCustomerData()
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },

    addNewCustomer() {
      uni.navigateTo({
        url: '/pages/customer/add'
      })
    },

    selectCustomer(customer) {
      // 将选中的客户信息传回上一页
      const pages = getCurrentPages()
      const prevPage = pages[pages.length - 2]
      
      if (prevPage) {
        // 设置客户信息到订单页面
        prevPage.$vm.orderForm.customerName = customer.name
        prevPage.$vm.orderForm.customerPhone = customer.phone
        prevPage.$vm.orderForm.address = customer.address || ''
        
        // 如果订单页面有customerInfo字段，也设置完整的客户信息
        if (prevPage.$vm.orderForm.customerInfo !== undefined) {
          prevPage.$vm.orderForm.customerInfo = {
            uuid: customer.id,
            name: customer.name,
            tel: customer.phone,
            pre_addr: customer.address,
            addr: customer.detailAddress,
            type: customer.level,
            sex: customer.sex,
            age: customer.age,
            area: customer.area,
            pay: customer.pay,
            offline_id: customer.offlineId
          }
        }
        
        uni.showToast({
          title: '客户信息已填入',
          icon: 'success'
        })
        
        setTimeout(() => {
          uni.navigateBack()
        }, 1000)
      }
    },

    onSearchInput() {
      // 搜索输入处理
    },

    clearSearch() {
      this.searchKeyword = ''
    },

    async loadCustomerData() {
      try {
        uni.showLoading({
          title: '加载中...'
        })
        // 获取用户信息作为offline_id
        const userInfo = uni.getStorageSync('userInfo')
        const offlineId = userInfo ? userInfo.offline_id : 'default'
        
        // 调用API获取客户列表
        const response = await apiService.getCustomerList({
          offline_id: offlineId
        })
        
        uni.hideLoading()
        
        if (response && response.code === 1 && response.data) {
          // 转换分组数据为平铺的客户列表
          let customers = []
          response.data.forEach(group => {
            if (group.detail && Array.isArray(group.detail)) {
              group.detail.forEach(customer => {
                customers.push({
                  id: customer.uuid,
                  name: customer.name,
                  phone: customer.tel,
                  address: customer.pre_addr,
                  detailAddress: customer.addr,
                  description: customer.description,
                  level: this.getCustomerLevel(customer.type),
                  levelText: this.getCustomerLevelText(customer.type),
                  isVip: customer.type === 2,
                  orderCount: customer.buycount || 0,
                  totalAmount: (customer.buymoney || 0).toFixed(2),
                  regTime: customer.reg_time,
                  sex: customer.sex,
                  age: customer.age,
                  area: customer.area,
                  pay: customer.pay,
                  offlineId: customer.offline_id,
                  accountId: customer.account_id
                })
              })
            }
          })
          
          this.customerList = customers
          console.log('客户列表加载成功，共', customers.length, '条数据')
                  } else {
            // 如果API失败或无数据，清空列表
            this.customerList = []
            console.log('API获取客户失败或无数据')
            if (response && response.message) {
              uni.showToast({
                title: response.message,
                icon: 'none'
              })
            }
          }
      } catch (error) {
        uni.hideLoading()
        console.error('加载客户数据失败:', error)
        uni.showToast({
          title: '加载客户数据失败',
          icon: 'none'
        })
      }
    },

    getCustomerLevel(type) {
      const levelMap = {
        1: 'regular',
        2: 'vip', 
        3: 'agent',
        4: 'wholesaler'
      }
      return levelMap[type] || 'regular'
    },

    getCustomerLevelText(type) {
      const levelTextMap = {
        1: '个人买家',
        2: 'VIP客户',
        3: '代理商', 
        4: '批发商'
      }
      return levelTextMap[type] || '普通客户'
    },

    formatAmount(amount) {
      if (!amount) return '0.00'
      const num = parseFloat(amount)
      return num.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }
  }
}
</script>

<style scoped>
/* 整体容器 */
.customer-select-container {
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

/* 搜索栏 */
.search-section {
  margin-top: 48px;
  padding: 16px;
  background-color: #FFFFFF;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  background-color: #F5F5F5;
  border-radius: 8px;
  padding: 0 12px;
  height: 40px;
}

.search-icon {
  color: #999999;
  font-size: 16px;
  margin-right: 8px;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 16px;
  color: #333333;
}

.search-clear {
  color: #999999;
  font-size: 18px;
  padding: 0 4px;
}

/* 客户列表 */
.customer-list {
  flex: 1;
  overflow-y: auto;
  background-color: #FFFFFF;
  margin: 8px 16px;
  border-radius: 8px;
}

.customer-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #F0F0F0;
}

.customer-item:last-child {
  border-bottom: none;
}

.customer-avatar {
  position: relative;
  margin-right: 16px;
}

.avatar-text {
  width: 48px;
  height: 48px;
  background-color: #F44336;
  color: #FFFFFF;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
}

.vip-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background-color: #FFD700;
  color: #333333;
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 8px;
  font-weight: bold;
}

.customer-info {
  flex: 1;
}

.customer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.customer-name {
  color: #333333;
  font-size: 16px;
  font-weight: bold;
}

.customer-level {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
}

.customer-level.vip {
  background-color: #FFE0E0;
  color: #F44336;
}

.customer-level.regular {
  background-color: #E0F0FF;
  color: #2196F3;
}

.customer-level.new {
  background-color: #E0FFE0;
  color: #4CAF50;
}

.customer-details {
  margin-bottom: 4px;
}

.customer-phone {
  color: #666666;
  font-size: 14px;
  display: block;
}

.customer-location {
  color: #999999;
  font-size: 12px;
  display: block;
  margin-top: 2px;
}

.customer-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  color: #999999;
  font-size: 12px;
}

.select-indicator {
  margin-left: 8px;
}

.arrow-icon {
  color: #CCCCCC;
  font-size: 16px;
}

/* 空状态 */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  color: #666666;
  font-size: 16px;
  margin-bottom: 8px;
}

.empty-tip {
  color: #999999;
  font-size: 14px;
  margin-bottom: 24px;
}

.add-customer-btn {
  background-color: #F44336;
  padding: 12px 24px;
  border-radius: 24px;
}

.add-customer-text {
  color: #FFFFFF;
  font-size: 16px;
  font-weight: bold;
}
</style> 