<template>
  <view class="setting-category-container">
    <!-- 头部导航 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="header-icon">✕</text>
      </view>
      <view class="header-center">
        <text class="header-title">商品分类设置</text>
      </view>
      <view class="header-right" @click="saveSettings">
        <text class="header-icon">✓</text>
      </view>
    </view>

    <!-- 分类列表 -->
    <view class="category-list">
      <view 
        class="category-item" 
        v-for="(category, index) in categories" 
        :key="category.id"
      >
        <view class="category-info">
          <text class="category-name">{{ category.name }}</text>
        </view>
        <view class="category-toggle">
          <switch 
            :checked="category.enabled" 
            @change="toggleCategory(index)"
            color="#FF5C5C"
            style="transform: scale(0.8);"
          />
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="categories.length === 0">
      <view class="empty-icon">📂</view>
      <text class="empty-text">暂无分类</text>
      <text class="empty-desc">请先添加商品分类</text>
    </view>

    <!-- 加载状态 -->
    <view class="loading-overlay" v-if="loading">
      <view class="loading-content">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>
    </view>
  </view>
</template>

<script>
import apiService from '@/utils/api.js'
import store from '@/utils/store.js'

export default {
  name: 'SettingCategory',
  data() {
    return {
      loading: false,
      categories: [
        {
          id: '00001',
          name: '护肤',
          enabled: false
        },
        {
          id: '00002',
          name: '彩妆',
          enabled: false
        },
        {
          id: '00003',
          name: '香水/美体/美发',
          enabled: false
        },
        {
          id: '00004',
          name: '箱包/钱包',
          enabled: false
        },
        {
          id: '00005',
          name: '手表/首饰',
          enabled: false
        },
        {
          id: '00006',
          name: '时尚/配件',
          enabled: false
        },
        {
          id: '00007',
          name: '数码电器',
          enabled: false
        },
        {
          id: '00008',
          name: '食品/生活',
          enabled: false
        }
      ],
      changeFlags: [false, false, false, false, false, false, false, false]
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },

    // 跳转到登录页面
    gotoLogin() {
      uni.reLaunch({
        url: '/pages/login/login'
      })
    },
    
    toggleCategory(index) {
      this.categories[index].enabled = !this.categories[index].enabled
      this.changeFlags[index] = true
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

    // 获取用户分类设置
    async getUserCategory() {
      // 检查登录状态
      if (!this.checkLoginStatus()) {
        return
      }
      
      try {
        this.loading = true
        const paramObj = {}
        
        const response = await apiService.getUserCategory(paramObj)
        
        if (response && response.data) {
          const arr = response.data
          if (arr && arr.length > 0) {
            arr.forEach(item => {
              if (item.level === '1') {
                const categoryIndex = this.categories.findIndex(cat => cat.id === item.id)
                if (categoryIndex !== -1) {
                  this.categories[categoryIndex].enabled = true
                }
              }
            })
          }
        }
      } catch (error) {
        console.error('获取用户分类失败:', error)
        uni.showToast({
          title: '获取分类设置失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    // 添加分类
    async addCategory(categoryId, index) {
      try {
        const paramObj = {
          id: categoryId
        }
        
        const response = await apiService.setFirstCategory(paramObj)
        
        if (response && response.message) {
          uni.showToast({
            title: response.message,
            icon: 'success'
          })
        }
      } catch (error) {
        console.error('添加分类失败:', error)
        uni.showToast({
          title: '操作失败',
          icon: 'none'
        })
      }
    },
    
    // 移除分类
    async removeCategory(categoryId, index) {
      try {
        const paramObj = {
          id: categoryId
        }
        
        const response = await apiService.removeFirstCategory(paramObj)
        
        if (response && response.message) {
          uni.showToast({
            title: response.message,
            icon: 'success'
          })
        }
      } catch (error) {
        console.error('移除分类失败:', error)
        uni.showToast({
          title: '操作失败',
          icon: 'none'
        })
      }
    },
    
    // 保存设置
    async saveSettings() {
      try {
        this.loading = true
        
        // 遍历所有分类，根据状态调用相应的接口
        for (let i = 0; i < this.categories.length; i++) {
          const category = this.categories[i]
          const categoryId = category.id
          
          if (category.enabled) {
            await this.addCategory(categoryId, i)
          } else {
            await this.removeCategory(categoryId, i)
          }
        }
        
        // 重置变更标志
        this.changeFlags = [false, false, false, false, false, false, false, false]
        
        uni.showToast({
          title: '设置已保存',
          icon: 'success'
        })
        
        // 设置标记通知父页面重新加载数据
        uni.setStorageSync('category_updated', true)
        
        // 返回上一页
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
        
      } catch (error) {
        console.error('保存设置失败:', error)
        uni.showToast({
          title: '保存失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    

  },
  
  onLoad() {
    this.getUserCategory()
  }
}
</script>

<style scoped>
.setting-category-container {
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: 40rpx;
  padding-top: calc(120rpx + var(--status-bar-height));
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: #FF5C5C;
  padding: var(--spacing-md) var(--spacing-xl);
  padding-top: calc(var(--spacing-md) + var(--status-bar-height));
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #FFFFFF;
  box-shadow: 0 2rpx 8rpx rgba(255, 92, 92, 0.3);
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
  transition: all 0.2s ease;
}

.header-left:active,
.header-right:active {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0.95);
}

.header-icon {
  font-size: 32rpx;
  color: #FFFFFF;
  font-weight: 500;
}

.header-center {
  flex: 1;
  text-align: center;
}

.header-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #FFFFFF;
}

.category-list {
  padding: 0;
}

.category-item {
  background: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx var(--spacing-xl);
  border-bottom: 1rpx solid #F0F0F0;
  transition: background-color 0.2s ease;
}

.category-item:active {
  background: #F8F8F8;
}

.category-info {
  flex: 1;
}

.category-name {
  font-size: 32rpx;
  color: #333333;
  font-weight: 400;
  line-height: 1.4;
}

.category-toggle {
  display: flex;
  align-items: center;
}

.empty-state {
  text-align: center;
  padding: 200rpx var(--spacing-xl);
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: var(--spacing-xl);
  opacity: 0.6;
  display: block;
}

.empty-text {
  display: block;
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
  font-weight: 500;
}

.empty-desc {
  font-size: var(--font-size-md);
  color: var(--text-tertiary);
  line-height: var(--line-height-relaxed);
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-content {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid #F0F0F0;
  border-top: 4rpx solid #FF5C5C;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 30rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #666666;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 