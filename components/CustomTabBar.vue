<template>
  <view class="custom-tabbar">
    <view 
      class="tab-item" 
      v-for="(item, index) in tabList" 
      :key="index"
      :class="{ active: currentTab === index }"
      @click="switchTab(index, item.pagePath)"
    >
      <view class="tab-icon">
        <text class="icon-text">{{ currentTab === index ? item.activeIcon : item.icon }}</text>
      </view>
      <text class="tab-text">{{ item.text }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'CustomTabBar',
  data() {
    return {
      currentTab: 0,
      tabList: [
        {
          pagePath: '/pages/order/order',
          icon: '📋',
          activeIcon: '📋',
          text: '订单'
        },
        {
          pagePath: '/pages/purchase/purchase',
          icon: '🛒',
          activeIcon: '🛒',
          text: '采购'
        },
        {
          pagePath: '/pages/product/product',
          icon: '📦',
          activeIcon: '📦',
          text: '商品'
        },
        {
          pagePath: '/pages/warehouse/warehouse',
          icon: '🏭',
          activeIcon: '🏭',
          text: '仓库'
        },
        {
          pagePath: '/pages/customer/customer',
          icon: '👥',
          activeIcon: '👥',
          text: '客户'
        }
      ]
    }
  },
  mounted() {
    console.log('CustomTabBar mounted')
    this.setCurrentTab()
    // 监听页面更新事件
    uni.$on('updateTabBar', this.handleUpdateTabBar)
    // 监听强制显示事件
    uni.$on('forceShowTabBar', this.handleForceShow)
  },
  onShow() {
    // 每次页面显示时都重新设置当前tab
    console.log('CustomTabBar onShow')
    this.setCurrentTab()
  },
  beforeDestroy() {
    // 移除事件监听器
    uni.$off('updateTabBar', this.handleUpdateTabBar)
    uni.$off('forceShowTabBar', this.handleForceShow)
  },
  methods: {
    // 切换tab
    switchTab(index, pagePath) {
      if (this.currentTab === index) return
      
      console.log('切换到tab:', index, pagePath)
      this.currentTab = index
      
      // 使用 reLaunch 来实现类似 tabbar 的效果
      uni.reLaunch({
        url: pagePath,
        success: () => {
          console.log('切换成功:', pagePath)
        },
        fail: (error) => {
          console.error('切换tab失败:', error)
          // 如果失败，尝试使用 navigateTo
          uni.navigateTo({
            url: pagePath
          })
        }
      })
    },
    
    // 设置当前tab
    setCurrentTab() {
      try {
        const pages = getCurrentPages()
        if (pages.length > 0) {
          const currentPage = pages[pages.length - 1]
          const route = '/' + currentPage.route
          console.log('当前页面路径:', route)
          
          const index = this.tabList.findIndex(item => item.pagePath === route)
          console.log('找到的tab索引:', index)
          if (index !== -1) {
            this.currentTab = index
            console.log('设置当前tab为:', index)
          } else {
            console.log('未找到匹配的tab页面')
          }
        }
      } catch (error) {
        console.error('设置当前tab失败:', error)
      }
    },
    
    // 更新当前tab（供外部调用）
    updateCurrentTab(pagePath) {
      const index = this.tabList.findIndex(item => item.pagePath === pagePath)
      if (index !== -1) {
        this.currentTab = index
      }
    },

    // 处理页面更新事件
    handleUpdateTabBar(pagePath) {
      console.log('收到页面更新事件:', pagePath)
      this.updateCurrentTab(pagePath)
    },

    // 处理强制显示事件
    handleForceShow() {
      console.log('收到强制显示tabBar事件')
      // 强制设置当前tab为客户页面
      this.currentTab = 4 // 客户页面的索引
      this.setCurrentTab()
    },



    // 调试方法：检查组件状态
    debugTabBarStatus() {
      console.log('当前tab索引:', this.currentTab)
      console.log('tabList:', this.tabList)
      console.log('当前页面:', getCurrentPages())
    }
  }
}
</script>

<style scoped>
.custom-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background: #fff;
  border-top: 1rpx solid #eee;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 999;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  transition: all 0.3s ease;
}

.tab-item.active {
  transform: translateY(-4rpx);
}

.tab-icon {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8rpx;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.tab-item.active .tab-icon {
  background: rgba(0, 122, 255, 0.1);
  transform: scale(1.1);
}

.icon-text {
  font-size: 32rpx;
  transition: all 0.3s ease;
}

.tab-item.active .icon-text {
  transform: scale(1.2);
}

.tab-text {
  font-size: 20rpx;
  color: #666;
  transition: all 0.3s ease;
}

.tab-item.active .tab-text {
  color: #007aff;
  font-weight: bold;
}

/* 添加点击效果 */
.tab-item:active {
  transform: scale(0.95);
}

.tab-item.active:active {
  transform: translateY(-4rpx) scale(0.95);
}
</style> 