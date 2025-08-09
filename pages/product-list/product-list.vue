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
      <view class="goods-card" v-for="item in goodsList" :key="item.id" @click="gotoDetail(item)">
        <image class="cover" :src="getCover(item)" mode="aspectFill"></image>
        <view class="meta">
          <text class="name">{{ item.show_name || item.name || '-' }}</text>
          <text class="sub">品牌：{{ item.brand || '-' }} · 型号：{{ item.model || item.specification || '-' }}</text>
          <view class="tags">
            <text class="tag" v-if="item.unit">{{ item.unit }}</text>
            <text class="tag" v-if="item.color">{{ item.color }}</text>
          </view>
        </view>
      </view>
      <view class="loading-more" v-if="loadingMore">
        <text>加载中...</text>
      </view>
      <view class="no-more" v-if="!hasMore && goodsList.length > 0">
        <text>没有更多了</text>
      </view>
    </scroll-view>

    <!-- 悬浮添加按钮 -->
    <view class="fab-button" @click="addProduct">
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
    }
  },
  onLoad(options) {
    // 接收分类参数
    this.cate1 = options.cate1 || ''
    this.cate2 = options.cate2 || ''
    this.cate3 = options.cate3 || ''
    this.category_id = options.category_id || ''
    this.pageTitle = this.cate3 || this.cate2 || '商品列表'
  },
  onShow() {
    debugger
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
</style>