<template>
  <view class="product-category-container">
    <!-- 头部导航 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="header-icon">×</text>
      </view>
      <view class="header-center">
        <text class="header-title">选择商品</text>
      </view>
      <view class="header-right">
        <!-- 可以添加搜索或其他功能 -->
      </view>
    </view>

    <!-- 分类商品布局 -->
    <view class="category-wrap">
      <!-- 左侧分类列表 -->
      <scroll-view class="left-side" scroll-y="true">
        <view class="category-list">
          <view
            class="category-item"
            :class="{ active: leftSideActive === index }"
            v-for="(item, index) in categoryAll"
            :key="index"
            @click="selectCategoryA(index, item.id, item.name)"
          >
            <text class="category-name">{{ item.name }}</text>
          </view>
        </view>
      </scroll-view>

      <!-- 右侧子分类和商品 -->
      <scroll-view class="right-side" scroll-y="true">
        <view
          class="subcategory-section"
          v-for="item in categoryBCur"
          :key="item.id"
        >
          <view class="category-name">
            <text class="name-text">{{ item.name }}</text>
          </view>
          <view class="subcategory-grid">
            <view
              class="subcategory-item"
              v-for="subItem in item.group"
              :key="subItem.id"
              @click="gotoProductList(item.name, subItem.name, cateA, subItem.id)"
            >
              <text class="subcategory-name">{{ subItem.name }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import apiService from '../../utils/api.js'
import CommonUtils from '../../utils/common.js'

export default {
  data() {
    return {
      leftSideActive: 0,
      cateA: '',
      categoryAll: [],
      categoryBCur: [],
      categoryChooseBean: {
        id: null,
        offline_id: this.getOfflineId()
      },
      fromPage: '' // 来源页面标识
    }
  },
  onLoad(options) {
    // 获取来源页面信息
    if (options.from) {
      this.fromPage = options.from
    }
    this.getUserCategory()
  },
  
  // 页面显示时重新加载数据
  onShow() {
    // 检查是否需要重新加载分类数据
    const needReload = uni.getStorageSync('category_updated')
    if (needReload) {
      this.getUserCategory()
      uni.removeStorageSync('category_updated')
    }
  },
  
  methods: {
    // 获取离线ID
    getOfflineId() {
      // 从存储中获取离线ID，如果没有则生成一个新的
      let offlineId = uni.getStorageSync('offline_id')
      if (!offlineId) {
        offlineId = this.generateOfflineId()
        uni.setStorageSync('offline_id', offlineId)
      }
      return offlineId
    },

    // 生成离线ID
    generateOfflineId() {
      return 'web_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    },

    // 检查登录状态
    checkLoginStatus() {
      const isLoggedIn = uni.getStorageSync('isLoggedIn')
      const token = uni.getStorageSync('token')
      const userInfo = uni.getStorageSync('userInfo')
      
      if (!isLoggedIn || !token || !userInfo) {
        this.gotoLogin()
        return false
      }
      return true
    },

    // 获取用户分类数据
    async getUserCategory() {
      // 检查登录状态
      if (!this.checkLoginStatus()) {
        return
      }
      
      try {
        CommonUtils.showLoading('加载分类数据...')
        
        const response = await apiService.getUserCategory(this.categoryChooseBean)
        
        if (response.code === 1) {
          const arr = response.data
          if (arr && arr.length > 0) {
            this.processCategoryData(arr)
          } else {
            this.showSetCategoryDialog()
          }
        } else if (response.code === 207) {
          // 登录状态失效
          CommonUtils.showError(response.message || '登录状态失效')
          this.gotoLogin()
        } else {
          // 其他错误，可能是未设置分类
          this.showSetCategoryDialog()
        }
      } catch (error) {
        console.error('获取分类数据失败:', error)
        CommonUtils.showError('获取分类数据失败')
      } finally {
        CommonUtils.hideLoading()
      }
    },

    // 处理分类数据
    processCategoryData(arr) {
      const level_A = []
      const level_B = []
      const level_C = []

      // 按层级分类
      arr.forEach(item => {
        if (item.level === '1') {
          level_A.push(item)
        } else if (item.level === '2') {
          level_B.push(item)
        } else if (item.level === '3') {
          level_C.push(item)
        }
      })

      // 构建层级关系
      level_A.forEach(categoryA => {
        const group_b = []
        level_B.forEach(categoryB => {
          if (categoryB.parentid === categoryA.id) {
            const group_c = []
            level_C.forEach(categoryC => {
              if (categoryC.parentid === categoryB.id) {
                group_c.push(categoryC)
              }
            })
            categoryB.group = group_c
            group_b.push(categoryB)
          }
        })
        categoryA.group = group_b
      })

      this.categoryAll = level_A
      this.categoryBCur = level_A[0] ? level_A[0].group : []
      this.cateA = level_A[0] ? level_A[0].name : ''
    },

    // 显示设置分类对话框
    showSetCategoryDialog() {
      CommonUtils.showConfirm(
        '请设置您销售的商品种类',
        '提示'
      ).then(confirmed => {
        if (confirmed) {
          this.gotoSetCategory()
        }
      })
    },

    // 跳转到设置分类页面
    gotoSetCategory() {
      uni.navigateTo({
        url: '/pages/setting-category/setting-category'
      })
    },

    // 跳转到登录页面
    gotoLogin() {
      uni.reLaunch({
        url: '/pages/login/login'
      })
    },

    selectCategoryA(index, pid, name) {
      this.leftSideActive = index
      this.getCategoryB(pid, name)
    },

    getCategoryB(pid, name) {
      this.cateA = name
      const category = this.categoryAll.find((item) => item.id === pid)
      if (category) {
        this.categoryBCur = category.group
      }
    },

    gotoProductList(item, subItem, cateA, category_id) {
      console.log('跳转到商品列表:', item, subItem, cateA, category_id)
      uni.navigateTo({
        url: `/pages/product-list/product-list?cate1=${cateA}&cate2=${item}&cate3=${subItem}&category_id=${category_id}&mode=select&from=${this.fromPage}`,
      })
    },

    // 返回上一页
    goBack() {
      uni.navigateBack()
    }
  },
}
</script>

<style scoped>
.product-category-container {
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

.category-wrap {
  flex: 1;
  display: flex;
  overflow: hidden;
  margin-top: 48px;
}

.left-side {
  width: 200rpx;
  background: #fff;
  border-right: 1rpx solid #eee;
}

.category-list {
  padding: 0;
}

.category-item {
  padding: 30rpx 20rpx;
  text-align: center;
  border-bottom: 1rpx solid #f0f0f0;
  transition: all 0.3s;
}

.category-item.active {
  background: #f4f4f4;
  color: #F44336;
  border-left: 4rpx solid #F44336;
}

.category-name {
  font-size: 28rpx;
  color: #333;
}

.category-item.active .category-name {
  color: #F44336;
  font-weight: bold;
}

.right-side {
  flex: 1;
  background: #fff;
  padding: 20rpx;
}

.subcategory-section {
  margin-bottom: 40rpx;
}

.category-name {
  margin: 20rpx 0 20rpx;
}

.name-text {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  border-left: 4rpx solid #F44336;
  padding-left: 20rpx;
}

.subcategory-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rpx;
  background: #f0f0f0;
  border-radius: 10rpx;
  overflow: hidden;
}

.subcategory-item {
  background: #fff;
  padding: 30rpx 20rpx;
  text-align: center;
  border: 1rpx solid #f0f0f0;
  transition: all 0.3s;
}

.subcategory-item:active {
  background: #f8f9fa;
}

.subcategory-name {
  font-size: 26rpx;
  color: #666;
}
</style> 