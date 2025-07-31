<template>
  <view class="product-container">
    <!-- 头部导航 -->
    <view class="header">
      <view class="header-left">
        <text class="header-title">商品管理</text>
      </view>
      <view class="header-right">
        <text class="header-btn" @click="gotoChart">统计</text>
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
              @click="
                gotoProductList(item.name, subItem.name, cateA, subItem.id)
              "
            >
              <text class="subcategory-name">{{ subItem.name }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 悬浮添加按钮 -->
    <view class="fab-button" @click="addProduct">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      leftSideActive: 0,
      cateA: '',
      categoryAll: [
        {
          id: 1,
          name: '电子产品',
          group: [
            {
              id: 11,
              name: '手机',
              group: [
                { id: 111, name: 'iPhone' },
                { id: 112, name: 'Samsung' },
                { id: 113, name: 'Huawei' },
              ],
            },
            {
              id: 12,
              name: '电脑',
              group: [
                { id: 121, name: 'MacBook' },
                { id: 122, name: 'ThinkPad' },
                { id: 123, name: 'Dell' },
              ],
            },
            {
              id: 13,
              name: '平板',
              group: [
                { id: 131, name: 'iPad' },
                { id: 132, name: 'Galaxy Tab' },
                { id: 133, name: 'MatePad' },
              ],
            },
          ],
        },
        {
          id: 2,
          name: '配件',
          group: [
            {
              id: 21,
              name: '耳机',
              group: [
                { id: 211, name: 'AirPods' },
                { id: 212, name: 'Sony' },
                { id: 213, name: 'Bose' },
              ],
            },
            {
              id: 22,
              name: '充电器',
              group: [
                { id: 221, name: '快充' },
                { id: 222, name: '无线充' },
                { id: 223, name: '数据线' },
              ],
            },
          ],
        },
        {
          id: 3,
          name: '服装',
          group: [
            {
              id: 31,
              name: '男装',
              group: [
                { id: 311, name: 'T恤' },
                { id: 312, name: '衬衫' },
                { id: 313, name: '裤子' },
              ],
            },
            {
              id: 32,
              name: '女装',
              group: [
                { id: 321, name: '连衣裙' },
                { id: 322, name: '上衣' },
                { id: 323, name: '裙子' },
              ],
            },
          ],
        },
      ],
      categoryBCur: [],
    }
  },
  mounted() {
    this.initCategoryData()
  },
  methods: {
    initCategoryData() {
      // 初始化分类数据
      this.categoryBCur = this.categoryAll[0].group
      this.cateA = this.categoryAll[0].name
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
        url: `/pages/product/detail?cate1=${cateA}&cate2=${item}&cate3=${subItem}&category_id=${category_id}`,
      })
    },

    gotoChart() {
      uni.navigateTo({
        url: '/pages/statistics/statistics',
      })
    },

    addProduct() {
      uni.showToast({
        title: '新增商品功能开发中',
        icon: 'none',
      })
    },
  },
}
</script>

<style scoped>
.product-container {
  height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.header {
  background: #007aff;
  padding: 20rpx 40rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
}

.header-title {
  font-size: 32rpx;
  font-weight: bold;
}

.header-btn {
  font-size: 28rpx;
  padding: 10rpx 20rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20rpx;
}

.category-wrap {
  flex: 1;
  display: flex;
  overflow: hidden;
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
  color: #007aff;
  border-left: 4rpx solid #007aff;
}

.category-name {
  font-size: 28rpx;
  color: #333;
}

.category-item.active .category-name {
  color: #007aff;
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
  border-left: 4rpx solid #007aff;
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
