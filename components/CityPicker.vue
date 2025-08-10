<template>
  <view class="city-picker-overlay" v-if="visible" @click="handleClose">
    <view class="city-picker-container" @click.stop>
      <!-- 头部 -->
      <view class="picker-header">
        <text class="header-btn cancel" @click="handleClose">取消</text>
        <text class="header-title">选择地区</text>
        <text class="header-btn confirm" @click="handleConfirm">确定</text>
      </view>

      <!-- 选项卡 -->
      <view class="picker-tabs">
        <view 
          class="tab-item" 
          :class="{ active: currentTab === 0 }"
          @click="switchTab(0)"
        >
          <text class="tab-text">{{ selectedProvince.name || '请选择' }}</text>
        </view>
        <view 
          class="tab-item" 
          :class="{ active: currentTab === 1, disabled: !selectedProvince.name }"
          @click="switchTab(1)"
          v-if="selectedProvince.name"
        >
          <text class="tab-text">{{ selectedCity.name || '请选择' }}</text>
        </view>
        <view 
          class="tab-item" 
          :class="{ active: currentTab === 2, disabled: !selectedCity.name }"
          @click="switchTab(2)"
          v-if="selectedCity.name"
        >
          <text class="tab-text">{{ selectedDistrict.name || '请选择' }}</text>
        </view>
      </view>

      <!-- 列表内容 -->
      <view class="picker-content">
        <!-- 省份列表 -->
        <scroll-view 
          class="option-list" 
          scroll-y="true"
          v-if="currentTab === 0"
        >
          <view 
            class="option-item"
            v-for="(province, index) in provinces"
            :key="province.code"
            :class="{ selected: selectedProvince.code === province.code }"
            @click="selectProvince(province)"
          >
            <text class="option-text">{{ province.name }}</text>
            <text class="check-icon" v-if="selectedProvince.code === province.code">✓</text>
          </view>
        </scroll-view>

        <!-- 城市列表 -->
        <scroll-view 
          class="option-list" 
          scroll-y="true"
          v-if="currentTab === 1"
        >
          <view 
            class="option-item"
            v-for="(city, index) in cities"
            :key="city.code"
            :class="{ selected: selectedCity.code === city.code }"
            @click="selectCity(city)"
          >
            <text class="option-text">{{ city.name }}</text>
            <text class="check-icon" v-if="selectedCity.code === city.code">✓</text>
          </view>
        </scroll-view>

        <!-- 区县列表 -->
        <scroll-view 
          class="option-list" 
          scroll-y="true"
          v-if="currentTab === 2"
        >
          <view 
            class="option-item"
            v-for="(district, index) in districts"
            :key="district.code"
            :class="{ selected: selectedDistrict.code === district.code }"
            @click="selectDistrict(district)"
          >
            <text class="option-text">{{ district.name }}</text>
            <text class="check-icon" v-if="selectedDistrict.code === district.code">✓</text>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
import cityData from '../utils/citydata.json'

export default {
  name: 'CityPicker',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    defaultValue: {
      type: Object,
      default: () => ({
        province: {},
        city: {},
        district: {}
      })
    }
  },
  data() {
    return {
      provinces: cityData,
      cities: [],
      districts: [],
      currentTab: 0,
      selectedProvince: {},
      selectedCity: {},
      selectedDistrict: {}
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.initData()
      }
    },
    defaultValue: {
      handler(newVal) {
        if (newVal) {
          this.selectedProvince = newVal.province || {}
          this.selectedCity = newVal.city || {}
          this.selectedDistrict = newVal.district || {}
          this.loadCitiesAndDistricts()
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    initData() {
      // 初始化数据，如果有默认值则加载对应的城市和区县
      if (this.selectedProvince.code) {
        this.loadCities()
        if (this.selectedCity.code) {
          this.loadDistricts()
        }
      }
    },

    loadCitiesAndDistricts() {
      if (this.selectedProvince.code) {
        this.loadCities()
        if (this.selectedCity.code) {
          this.loadDistricts()
        }
      }
    },

    switchTab(tabIndex) {
      if (tabIndex === 1 && !this.selectedProvince.name) return
      if (tabIndex === 2 && !this.selectedCity.name) return
      this.currentTab = tabIndex
    },

    selectProvince(province) {
      this.selectedProvince = province
      this.selectedCity = {}
      this.selectedDistrict = {}
      this.loadCities()
      this.currentTab = 1
    },

    selectCity(city) {
      this.selectedCity = city
      this.selectedDistrict = {}
      this.loadDistricts()
      this.currentTab = 2
    },

    selectDistrict(district) {
      this.selectedDistrict = district
    },

    loadCities() {
      if (this.selectedProvince.children && this.selectedProvince.children.length > 0) {
        this.cities = this.selectedProvince.children
      } else {
        this.cities = []
      }
      this.districts = []
    },

    loadDistricts() {
      if (this.selectedCity.children && this.selectedCity.children.length > 0) {
        this.districts = this.selectedCity.children
      } else {
        this.districts = []
      }
    },

    handleConfirm() {
      if (!this.selectedProvince.name) {
        uni.showToast({
          title: '请选择省份',
          icon: 'none'
        })
        return
      }
      
      if (!this.selectedCity.name) {
        uni.showToast({
          title: '请选择城市',
          icon: 'none'
        })
        return
      }
      
      if (!this.selectedDistrict.name) {
        uni.showToast({
          title: '请选择区县',
          icon: 'none'
        })
        return
      }

      const result = {
        province: this.selectedProvince,
        city: this.selectedCity,
        district: this.selectedDistrict,
        fullAddress: `${this.selectedProvince.name}${this.selectedCity.name}${this.selectedDistrict.name}`
      }

      this.$emit('confirm', result)
      this.handleClose()
    },

    handleClose() {
      this.$emit('close')
    },

    reset() {
      this.selectedProvince = {}
      this.selectedCity = {}
      this.selectedDistrict = {}
      this.cities = []
      this.districts = []
      this.currentTab = 0
    }
  }
}
</script>

<style scoped>
.city-picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  align-items: flex-end;
}

.city-picker-container {
  width: 100%;
  background-color: #FFFFFF;
  border-radius: 16px 16px 0 0;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}

/* 头部 */
.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #F0F0F0;
}

.header-btn {
  font-size: 16px;
  color: #666666;
  padding: 8px;
}

.header-btn.confirm {
  color: #F44336;
  font-weight: bold;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
  color: #333333;
}

/* 选项卡 */
.picker-tabs {
  display: flex;
  background-color: #F8F8F8;
  border-bottom: 1px solid #E0E0E0;
}

.tab-item {
  flex: 1;
  padding: 12px 16px;
  text-align: center;
  border-bottom: 2px solid transparent;
  cursor: pointer;
}

.tab-item.active {
  background-color: #FFFFFF;
  border-bottom-color: #F44336;
}

.tab-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tab-text {
  font-size: 14px;
  color: #333333;
}

.tab-item.active .tab-text {
  color: #F44336;
  font-weight: bold;
}

/* 列表内容 */
.picker-content {
  flex: 1;
  overflow: hidden;
}

.option-list {
  height: 400px;
}

.option-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #F0F0F0;
  cursor: pointer;
}

.option-item:last-child {
  border-bottom: none;
}

.option-item.selected {
  background-color: #FFF5F5;
}

.option-text {
  font-size: 16px;
  color: #333333;
}

.option-item.selected .option-text {
  color: #F44336;
  font-weight: bold;
}

.check-icon {
  font-size: 16px;
  color: #F44336;
  font-weight: bold;
}

/* 响应式调整 */
@media (max-height: 600px) {
  .option-list {
    height: 300px;
  }
}
</style> 