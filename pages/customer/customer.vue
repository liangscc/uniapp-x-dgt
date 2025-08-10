<template>
  <view class="customer-container">
    <!-- 头部导航 -->
    <view class="header">
      <view class="header-left" @click="showSlideMenu">
        <text class="header-icon">👤</text>
      </view>
      <view class="header-center">
        <text class="header-title">客户列表</text>
      </view>
      <view class="header-right" @click="gotoChart">
        <text class="header-icon">📊</text>
      </view>
    </view>

    <!-- 侧滑菜单 -->
    <SlideMenu :visible="slideMenuVisible" @close="hideSlideMenu" />

    <!-- 筛选条件区域 -->
    <view class="filter-section">
      <view class="filter-row">
        <view class="filter-item" @click="showLocationPicker">
          <text class="filter-text">{{ selectedLocation }}</text>
          <text class="filter-arrow">▼</text>
        </view>
        <view class="filter-item" @click="showTypePicker">
          <text class="filter-text">{{ selectedType }}</text>
          <text class="filter-arrow">▼</text>
        </view>
        <view class="filter-reset" @click="resetLocation" v-if="selectedLocation !== '全部地区'">
          <text class="reset-text">重置</text>
        </view>
      </view>
      
      <!-- 搜索框 -->
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input class="search-input" placeholder="客户姓名或电话" v-model="searchKeyword" />
      </view>
    </view>

    <!-- 客户列表 -->
    <view class="customer-list">
      <view
        class="customer-item"
        v-for="(customer, index) in filteredCustomers"
        :key="index"
        @click="viewCustomerDetail(customer.id)"
      >
        <view class="customer-content">
          <view class="customer-name">{{ customer.name }}</view>
          <view class="customer-address">地址：{{ customer.address }}</view>
        </view>
        <view class="customer-phone">{{ customer.phone }}</view>
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

    <!-- 自定义 TabBar -->
    <CustomTabBar />
    
    <!-- 城市选择器 -->
    <CityPicker 
      :visible="cityPickerVisible"
      :defaultValue="selectedLocationData"
      @confirm="onLocationConfirm"
      @close="onLocationClose"
    />
  </view>
</template>

<script>
import SlideMenu from '../../components/SlideMenu.vue'
import CustomTabBar from '../../components/CustomTabBar.vue'
import CityPicker from '../../components/CityPicker.vue'

export default {
  components: {
    SlideMenu,
    CustomTabBar,
    CityPicker
  },
  data() {
    return {
      slideMenuVisible: false,
      searchKeyword: '',
      selectedLocation: '全部地区',
      selectedType: '客户类型',
      cityPickerVisible: false,
      selectedLocationData: {
        province: {},
        city: {},
        district: {}
      },
      customerList: [
        {
          id: 1,
          name: 'Z',
          phone: '17711111111',
          address: '北京市北京市东城区11111',
        },
        {
          id: 2,
          name: '赵',
          phone: '17711111112',
          address: '北京市北京市朝阳区22222',
        },
        {
          id: 3,
          name: '王明',
          phone: '17711111113',
          address: '上海市上海市浦东新区33333',
        },
        {
          id: 4,
          name: '李华',
          phone: '17711111114',
          address: '广东省广州市天河区44444',
        },
        {
          id: 5,
          name: '张三',
          phone: '17711111115',
          address: '江苏省南京市鼓楼区55555',
        },
        {
          id: 6,
          name: '刘强',
          phone: '17711111116',
          address: '浙江省杭州市西湖区66666',
        },
      ],
    }
  },
  computed: {
    filteredCustomers() {
      let filtered = this.customerList
      
      // 根据搜索关键词过滤
      if (this.searchKeyword) {
        filtered = filtered.filter(customer => 
          customer.name.includes(this.searchKeyword) || 
          customer.phone.includes(this.searchKeyword)
        )
      }
      
      // 根据地理位置过滤
      if (this.selectedLocation !== '全部地区' && this.selectedLocationData.province.name) {
        filtered = filtered.filter(customer => {
          const address = customer.address || ''
          
          // 检查省份
          if (this.selectedLocationData.province.name && !address.includes(this.selectedLocationData.province.name)) {
            return false
          }
          
          // 检查城市（如果选择了城市）
          if (this.selectedLocationData.city.name && !address.includes(this.selectedLocationData.city.name)) {
            return false
          }
          
          // 检查区县（如果选择了区县）
          if (this.selectedLocationData.district.name && !address.includes(this.selectedLocationData.district.name)) {
            return false
          }
          
          return true
        })
      }
      
      return filtered
    },
  },
  methods: {
    viewCustomerDetail(customerId) {
      uni.navigateTo({
        url: `/pages/customer/detail?id=${customerId}`,
      })
    },

    addCustomer() {
      uni.navigateTo({
        url: '/pages/customer/add'
      })
    },

    showLocationPicker() {
      this.cityPickerVisible = true
    },

    onLocationConfirm(result) {
      this.selectedLocationData = result
      this.selectedLocation = result.fullAddress
      this.cityPickerVisible = false
      
      // 这里可以根据选择的地区过滤客户列表
      // 暂时先更新显示文本
    },

    onLocationClose() {
      this.cityPickerVisible = false
    },

    resetLocation() {
      this.selectedLocation = '全部地区'
      this.selectedLocationData = {
        province: {},
        city: {},
        district: {}
      }
    },

    showTypePicker() {
      uni.showActionSheet({
        itemList: ['全部类型', 'VIP客户', '普通客户', '新客户'],
        success: (res) => {
          const types = ['全部类型', 'VIP客户', '普通客户', '新客户']
          this.selectedType = types[res.tapIndex]
        }
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
.customer-container {
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: calc(120rpx + 100rpx);
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: #FF4D4F;
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

.filter-section {
  background: #FF4D4F;
  padding: 20rpx 40rpx;
  padding-top: calc(120rpx + var(--status-bar-height));
}

.filter-row {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.filter-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15rpx 20rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8rpx;
  margin-right: 20rpx;
}

.filter-item:last-child {
  margin-right: 0;
}

.filter-text {
  color: #fff;
  font-size: 28rpx;
  margin-right: 10rpx;
}

.filter-arrow {
  color: #fff;
  font-size: 24rpx;
}

.filter-reset {
  padding: 15rpx 20rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 8rpx;
  margin-left: 20rpx;
}

.reset-text {
  color: #fff;
  font-size: 26rpx;
}

.search-box {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 8rpx;
  padding: 15rpx 20rpx;
}

.search-icon {
  font-size: 32rpx;
  color: #999;
  margin-right: 15rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.customer-list {
  padding: 20rpx 40rpx;
  background: #F5F5F5;
}

.customer-item {
  background: #fff;
  border-radius: 8rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.customer-content {
  flex: 1;
}

.customer-name {
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.customer-address {
  font-size: 24rpx;
  color: #666;
}

.customer-phone {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
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
  bottom: calc(100rpx + 40rpx + env(safe-area-inset-bottom));
  right: 40rpx;
  width: 100rpx;
  height: 100rpx;
  background: #FF4D4F;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(255, 77, 79, 0.3);
  z-index: 1000;
}

.fab-icon {
  color: #fff;
  font-size: 40rpx;
  font-weight: bold;
}
</style>
