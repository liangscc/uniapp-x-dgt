<template>
  <view class="product-list-container">
    <!-- 头部导航 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="header-icon">←</text>
      </view>
      <view class="header-center">
        <text class="header-title">{{ pageTitle }}</text>
      </view>
      <view class="header-right" @click="openFilter">
        <text class="header-icon">🔍</text>
      </view>
    </view>

    <!-- 分类路径提示 -->
    <view class="breadcrumb" v-if="cate1 || cate2 || cate3">
      <text class="crumb" v-if="cate1">{{ cate1 }}</text>
      <text class="sep" v-if="cate1 && (cate2 || cate3)">/</text>
      <text class="crumb" v-if="cate2">{{ cate2 }}</text>
      <text class="sep" v-if="cate2 && cate3">/</text>
      <text class="crumb" v-if="cate3">{{ cate3 }}</text>
    </view>

    <!-- 搜索栏 -->
    <view class="search-bar">
      <input
        class="search-input"
        v-model.trim="keyword"
        type="text"
        placeholder="搜索商品名称/条码/品牌"
        confirm-type="search"
        @confirm="onSearch"
      />
      <button class="search-btn" @click="onSearch">搜索</button>
    </view>

    <!-- 商品列表 -->
    <scroll-view class="list-wrapper" scroll-y="true" @scrolltolower="loadMore">
      <view v-if="goodsList.length === 0 && !loading" class="empty">
        <text>暂无商品</text>
      </view>
      <view class="goods-card" v-for="item in goodsList" :key="item.id" @click="handleCardClick(item)">
        <image class="cover" :src="getCover(item)" mode="aspectFill"></image>
        <view class="meta">
          <text class="name">{{ item.show_name || item.name || '-' }}</text>
          <text class="sub">品牌：{{ item.brand || '-' }} · 型号：{{ item.model || item.specification || '-' }}</text>
          <view class="tags">
            <text class="tag" v-if="item.unit">{{ item.unit }}</text>
            <text class="tag" v-if="item.color">{{ item.color }}</text>
          </view>
        </view>
        <!-- 选择模式下显示添加按钮 -->
        <view v-if="mode === 'select'" class="add-btn" @click.stop="selectProduct(item)">
          <text class="add-btn-text">添加</text>
        </view>
      </view>
      <view class="loading-more" v-if="loadingMore">
        <text>加载中...</text>
      </view>
      <view class="no-more" v-if="!hasMore && goodsList.length > 0">
        <text>没有更多了</text>
      </view>
    </scroll-view>

    <!-- 悬浮添加按钮 (非选择模式时显示) -->
    <view v-if="mode !== 'select'" class="fab-button" @click="addProduct">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>

<script>
import apiService from '../../utils/api.js'
import CommonUtils from '../../utils/common.js'

export default {
  data() {
    return {
      cate1: '',
      cate2: '',
      cate3: '',
      category_id: '',
      pageTitle: '商品列表',
      keyword: '',
      goodsList: [],
      pageNum: 1,
      pageSize: 20,
      hasMore: true,
      loading: false,
      loadingMore: false,
      mode: '', // 页面模式：select表示选择模式
      fromPage: '', // 来源页面
    }
  },
  onLoad(options) {
    // 接收分类参数
    this.cate1 = options.cate1 || ''
    this.cate2 = options.cate2 || ''
    this.cate3 = options.cate3 || ''
    this.category_id = options.category_id || ''
    this.mode = options.mode || ''
    this.fromPage = options.from || ''
    this.pageTitle = this.cate3 || this.cate2 || '商品列表'
    
    // 如果是选择模式，修改页面标题
    if (this.mode === 'select') {
      this.pageTitle = '选择商品'
    }
  },
  onShow() {
    this.resetAndLoad()
  },
  onPullDownRefresh() {
    this.resetAndLoad().finally(() => {
      uni.stopPullDownRefresh()
    })
  },
  methods: {
    goBack() {
      CommonUtils.navigateBack()
    },
    openFilter() {
      // 预留：未来可打开筛选弹窗
    },
    getCover(item) {
      const top = (item.image_arr || '').split(',').filter(Boolean)
      if (top.length > 0) return top[0]
      const beanArr = (item.goodsBean?.image_arr || '').split(',').filter(Boolean)
      if (beanArr.length > 0) return beanArr[0]
      const listImgs = Array.isArray(item.listGoodsImg) ? item.listGoodsImg : []
      const url = listImgs
        .map(i => (typeof i === 'string' ? i : (i?.url || i?.imgUrl || i?.imageUrl || '')))
        .find(Boolean)
      return url || '/static/logo.png'
    },
    resetAndLoad() {
      this.pageNum = 1
      this.hasMore = true
      this.goodsList = []
      return this.loadList()
    },
    async onSearch() {
      this.pageNum = 1
      this.hasMore = true
      this.goodsList = []
      await this.loadList()
    },
    async loadMore() {
      if (this.loading || this.loadingMore || !this.hasMore) return
      this.pageNum += 1
      this.loadingMore = true
      try {
        await this.loadList(true)
      } finally {
        this.loadingMore = false
      }
    },
    async loadList(append = false) {
      if (!this.hasMore && append) return
      this.loading = !append

      try {
        const payload = {
          // pageNum: this.pageNum,
          // pageSize: this.pageSize,
          category_id: this.category_id,
          // keyword: this.keyword,
        }

        CommonUtils.showLoading('加载商品...')
        const res = await apiService.getGoodsList(payload)

        if (res && res.code === 1) {
          const raw = Array.isArray(res.data?.list) ? res.data.list : (Array.isArray(res.data) ? res.data : [])
          const normalized = raw.map(x => {
            const bean = x?.goodsBean || {}
            const imageArr = bean?.image_arr || ''
            return {
              ...bean,
              id: bean.uuid || bean.id || '',
              uuid: bean.uuid || '',
              image_arr: imageArr,
              listGoodsSpec: x?.listGoodsSpec || [],
              listGoodsImg: x?.listGoodsImg || [],
            }
          })

          const keyword = (this.keyword || '').trim()
          const filtered = keyword
            ? normalized.filter(it => {
                const text = [it.show_name, it.name, it.brand, it.bar_code, it.model]
                  .filter(Boolean)
                  .join(' ').toLowerCase()
                return text.includes(keyword.toLowerCase())
              })
            : normalized

          this.goodsList = append ? this.goodsList.concat(filtered) : filtered
          this.hasMore = false
        } else if (res && res.code === 207) {
          this.hasMore = false
        } else {
          this.hasMore = false
          CommonUtils.showError(res?.message || '加载失败')
        }
      } catch (e) {
        this.hasMore = false
        CommonUtils.showError('网络异常，加载失败')
      } finally {
        this.loading = false
        CommonUtils.hideLoading()
      }
    },
    handleCardClick(item) {
      if (this.mode === 'select') {
        // 选择模式下点击卡片也是选择商品
        this.selectProduct(item)
      } else {
        // 正常模式下点击查看详情
        this.gotoDetail(item)
      }
    },

    gotoDetail(item) {
      const id = item.id || item.goods_id || item.uuid || ''
      if (!id) {
        CommonUtils.showError('缺少商品ID，无法查看详情')
        return
      }
      uni.navigateTo({
        url: `/pages/product/detail?id=${id}`
      })
    },

    selectProduct(item) {
      // 选择商品并返回到订单页面
      uni.showModal({
        title: '添加商品',
        content: `确定要添加"${item.show_name || item.name}"到订单中吗？`,
        success: (res) => {
          if (res.confirm) {
            // 构造商品数据
            const productData = {
              id: item.id || item.uuid || '',
              name: item.show_name || item.name || '',
              spec: item.specification || item.model || '',
              price: item.price || '0.00',
              quantity: 1,
              brand: item.brand || '',
              unit: item.unit || '',
              color: item.color || '',
              barCode: item.bar_code || '',
              image: this.getCover(item)
            }

            // 将商品数据存储到全局
            uni.setStorageSync('selected_product', productData)

            // 返回到订单页面
            if (this.fromPage === 'order') {
              uni.navigateBack({
                delta: 2 // 返回两层，跳过product-category页面
              })
            } else {
              uni.navigateBack()
            }
          }
        }
      })
    },
    
    addProduct() {
      uni.navigateTo({
        url: `/pages/product/add?cate1=${this.cate1}&cate2=${this.cate2}&cate3=${this.cate3}&category_id=${this.category_id}`
      })
    }
  }
}
</script>

<style scoped>
.product-list-container {
  min-height: 100vh;
  background: var(--background-color);
  display: flex;
  flex-direction: column;
  padding-bottom: 40rpx;
  padding-top: calc(120rpx + var(--status-bar-height));
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: var(--primary-color);
  padding: var(--spacing-md) var(--spacing-xl);
  padding-top: calc(var(--spacing-md) + var(--status-bar-height));
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #FFFFFF;
  box-shadow: var(--shadow-medium);
}

.header-left,
.header-right {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-circle);
  background: rgba(255, 255, 255, 0.2);
  transition: all 0.2s ease;
}

.header-left:active,
.header-right:active {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0.95);
}

.header-icon {
  font-size: var(--font-size-lg);
  color: #FFFFFF;
}

.header-center {
  flex: 1;
  text-align: center;
}

.header-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: #FFFFFF;
}

.breadcrumb {
  margin: 20rpx var(--spacing-xl) 0;
  color: #666;
  display: flex;
  align-items: center;
  gap: 8rpx;
}
.crumb { font-size: 26rpx; color: #333; }
.sep { font-size: 26rpx; color: #999; }

.search-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx var(--spacing-xl);
}
.search-input {
  flex: 1;
  height: 72rpx;
  background: #fff;
  border: 1rpx solid #eee;
  border-radius: 36rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
}
.search-input:focus {
  border-color: var(--primary-color);
}
.search-btn {
  height: 72rpx;
  padding: 0 28rpx;
  background: var(--primary-color);
  color: #fff;
  border-radius: 36rpx;
  font-size: 28rpx;
}

.list-wrapper {
  flex: 1;
  padding: 10rpx var(--spacing-xl) 30rpx;
}

.goods-card {
  display: flex;
  gap: 20rpx;
  background: #fff;
  border: 1rpx solid #f0f0f0;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  position: relative;
}
.cover {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  background: #f8f8f8;
}
.meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12rpx;
}
.name {
  font-size: 30rpx;
  color: #333;
  font-weight: bold;
}
.sub {
  font-size: 24rpx;
  color: #777;
}
.tags {
  display: flex;
  gap: 10rpx;
}
.tag {
  font-size: 22rpx;
  color: #666;
  background: #f4f4f4;
  padding: 4rpx 10rpx;
  border-radius: 8rpx;
}

.empty, .loading-more, .no-more {
  text-align: center;
  padding: 20rpx;
  color: #999;
}

.fab-button {
  position: fixed;
  bottom: calc(40rpx + var(--spacing-xl) + env(safe-area-inset-bottom));
  right: var(--spacing-xl);
  width: 100rpx;
  height: 100rpx;
  background: var(--primary-color);
  border-radius: var(--radius-circle);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-heavy);
  transition: all 0.2s ease;
  z-index: 1000;
}

.fab-button:active {
  transform: scale(0.9);
  box-shadow: var(--shadow-medium);
}

.fab-icon {
  color: #FFFFFF;
  font-size: var(--font-size-xl);
  font-weight: bold;
}

/* 添加按钮样式 */
.add-btn {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  background: #F44336;
  color: #FFFFFF;
  border-radius: 8rpx;
  padding: 8rpx 16rpx;
  font-size: 24rpx;
  min-width: 60rpx;
  text-align: center;
  box-shadow: 0 2rpx 8rpx rgba(244, 67, 54, 0.3);
  transition: all 0.2s ease;
}

.add-btn:active {
  transform: scale(0.95);
  background: #E53935;
}

.add-btn-text {
  color: #FFFFFF;
  font-size: 24rpx;
  font-weight: bold;
}
</style>