<template>
  <view class="add-product-page">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="header-icon">‹</text>
      </view>
      <view class="header-center">
        <text class="header-title">新商品</text>
      </view>
      <view class="header-right" @click="saveProduct">
        <text class="header-icon">✓</text>
      </view>
    </view>

    <scroll-view class="page-scroll" scroll-y="true">
      <!-- 必填内容 -->
      <view class="section-divider">必填内容</view>
      <view class="list-card">
        <view class="list-item-row">
          <text class="row-label">商品名称：</text>
          <input class="row-input" v-model="formData.name" placeholder="请输入商品名称" maxlength="50" />
        </view>
        <view class="list-item-row">
          <text class="row-label">品牌</text>
          <input class="row-input" v-model="formData.brand" placeholder="请输入品牌" />
        </view>
        <view class="list-item-row">
          <text class="row-label">分类</text>
          <view class="row-value">
            <text class="value-text">{{ categoryPathText || '未设置' }}</text>
          </view>
        </view>
        <view class="list-item-row selectable" @click="openPurchasePlacePicker">
          <text class="row-label">商品采购地</text>
          <view class="row-value">
            <text class="value-text">{{ extraForm.purchasePlace || '请选择采购地' }}</text>
            <text class="arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 选填内容 -->
      <view class="section-divider">选填内容</view>
      <view class="list-card">
        <view class="list-item-row">
          <text class="row-label">过期提醒提前天数</text>
          <input class="row-input" v-model.number="extraForm.expireAdvanceDays" type="number" placeholder="如：7" />
        </view>
        <view class="list-item-row selectable" @click="toggleNeedVisit">
          <text class="row-label">是否需要回访</text>
          <view class="row-value">
            <text class="value-text">{{ extraForm.needVisit ? '需要' : '不需要' }}</text>
            <text class="arrow">›</text>
          </view>
        </view>
        <view class="list-item-row" v-if="extraForm.needVisit">
          <text class="row-label">回访提醒天数(货到几天)</text>
          <input class="row-input" v-model.number="extraForm.visitReminderDays" type="number" placeholder="如：3" />
        </view>
        <view class="list-item-row">
          <text class="row-label">宣传语</text>
          <input class="row-input" v-model="formData.description" placeholder="用于商品展示的简短文案" maxlength="200" />
        </view>
        <view class="list-item-row">
          <text class="row-label">备注</text>
          <input class="row-input" v-model="extraForm.remark" placeholder="可填写补充信息" maxlength="200" />
        </view>
      </view>

      <!-- 添加规格条 -->
      <view class="specs-bar">
        <text class="specs-label">添加规格：</text>
        <view class="add-spec-btn" @click="onAddSpec">
          <text class="plus">＋</text>
          <text class="btn-text">添加规格</text>
        </view>
      </view>

      <!-- 图片上传（保持原逻辑） -->
      <view class="image-upload-card">
        <view class="image-list">
          <template v-for="(image, index) in formData.images" :key="index">
            <view class="image-item" v-if="image && image.url">
              <image class="uploaded-image" :src="image.url" mode="aspectFill" />
              <view class="upload-status" v-if="image.uploading">
                <text class="status-text">上传中...</text>
              </view>
              <view class="delete-btn" @click="deleteImage(index)">
                <text class="delete-icon">×</text>
              </view>
            </view>
          </template>

          <view class="upload-btn" @click="chooseImage" v-if="formData.images.length < 5">
            <text class="upload-icon">＋</text>
            <text class="upload-text">添加图片</text>
          </view>
        </view>
        <text class="upload-tip">最多上传5张图片</text>
      </view>

      <!-- 分类选择器已移除 -->
    <!-- 分类信息从商品列表页面传递过来 -->
    </scroll-view>
  </view>
</template>

<script>
import apiService from '@/utils/api.js'

export default {
  data() {
    return {
      formData: {
        name: '',
        code: '',
        description: '',
        category_Id: '',
        costPrice: '',
        salePrice: '',
        marketPrice: '',
        stock: '',
        stockWarning: '',
        brand: '',
        specification: '',
        unit: '',
        weight: '',
        images: []
      },
      // 仅用于界面展示的扩展字段（不参与接口入参）
      extraForm: {
        purchasePlace: '',
        expireAdvanceDays: '',
        needVisit: false,
        visitReminderDays: '',
        remark: ''
      },
      // 从商品列表页面传递过来的分类信息
      cate1: '',
      cate2: '',
      cate3: '',
      // 采购地选项
      purchasePlaceOptions: ['中国', '韩国', '日本', '美国', '东南亚', '欧洲', '澳洲', '非洲', '其他']
    }
  },

  onLoad(options) {
    // 接收从商品列表页面传递过来的分类参数
    this.cate1 = options.cate1 || ''
    this.cate2 = options.cate2 || ''
    this.cate3 = options.cate3 || ''
    this.category_id = options.category_id || ''
  },

  computed: {
    categoryPathText() {
      return [this.cate1, this.cate2, this.cate3].filter(Boolean).join(' > ')
    }
  },

  methods: {
    toggleNeedVisit() {
      this.extraForm.needVisit = !this.extraForm.needVisit
    },

    // 选择图片
    chooseImage() {
      uni.chooseImage({
        count: 5 - this.formData.images.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.addLocalImages(res.tempFilePaths)
          this.uploadImages(res.tempFilePaths)
        }
      })
    },

    // 添加本地图片到显示列表
    addLocalImages(tempFilePaths) {
      for (let i = 0; i < tempFilePaths.length; i++) {
        this.formData.images.push({ url: tempFilePaths[i], isLocal: true, uploading: true })
      }
      this.$forceUpdate()
    },

    // 上传图片
    async uploadImages(tempFilePaths) {
      try {
        for (let i = 0; i < tempFilePaths.length; i++) {
          const filePath = tempFilePaths[i]
          const imageIndex = this.formData.images.findIndex(img => img.url === filePath)
          if (imageIndex === -1) continue

          try {
            const uploadResult = await new Promise((resolve, reject) => {
              uni.uploadFile({
                url: `${apiService.configUrl}/goods/uploadImg`,
                filePath: filePath,
                name: 'file',
                header: { 'Content-Type': 'multipart/form-data' },
                success: (res) => {
                  try { resolve(JSON.parse(res.data)) } catch (e) { reject(new Error('解析响应失败')) }
                },
                fail: (error) => reject(error)
              })
            })

            if (uploadResult && uploadResult.code === 200 && uploadResult.data) {
              this.formData.images[imageIndex] = {
                url: uploadResult.data.url || uploadResult.data,
                isLocal: false,
                uploading: false
              }
            } else {
              this.formData.images[imageIndex].uploading = false
            }
          } catch (error) {
            this.formData.images[imageIndex].uploading = false
          }
        }
        uni.showToast({ title: '图片处理完成', icon: 'success' })
      } catch (error) {
        uni.showToast({ title: '部分图片上传失败', icon: 'none' })
      }
    },

    // 删除图片
    deleteImage(index) {
      this.formData.images.splice(index, 1)
    },

    onAddSpec() {
      uni.showToast({ title: '规格功能待扩展', icon: 'none' })
    },

    // 验证表单（仅校验与接口相关字段）
    validateForm() {
      if (!this.formData.name.trim()) {
        uni.showToast({ title: '请输入商品名称', icon: 'none' })
        return false
      }
      return true
    },

    // 保存商品（保持接口入参不变）
    async saveProduct() {
      if (!this.validateForm()) return

      uni.showLoading({ title: '保存中...' })
      try {
        const imageUrls = this.formData.images.map(img => img.url)
        const goodsBean = {
          name: this.formData.name,
          code: this.formData.code,
          description: this.formData.description,
          costPrice: this.formData.costPrice ? parseFloat(this.formData.costPrice) : undefined,
          salePrice: this.formData.salePrice ? parseFloat(this.formData.salePrice) : undefined,
          marketPrice: this.formData.marketPrice ? parseFloat(this.formData.marketPrice) : 0,
          stock: this.formData.stock ? parseInt(this.formData.stock) : undefined,
          stockWarning: this.formData.stockWarning ? parseInt(this.formData.stockWarning) : 0,
          brand: this.formData.brand,
          specification: this.formData.specification,
          unit: this.formData.unit,
          weight: this.formData.weight ? parseFloat(this.formData.weight) : 0,
          category_id: this.category_id,
        }
        const productData = { goodsBean, listGoodsSpec: [], listGoodsImg: imageUrls }
        const response = await apiService.addProduct(productData)
        uni.hideLoading()
        if (response && response.code === 1) {
            uni.showToast({ title: '商品添加成功', icon: 'success' })
            setTimeout(() => {
              // uni.redirectTo({
              //   url: '/pages/product-list/product-list.vue?cate1=' + encodeURIComponent(this.cate1) + '&cate2=' + encodeURIComponent(this.cate2) + '&cate3=' + encodeURIComponent(this.cate3) + '&category_id=' + encodeURIComponent(this.category_id) + '&refresh=' + Date.now()
              // })
              uni.navigateBack({
                delta: 1
              })  
            }, 1200)
          } else {
          uni.showToast({ title: response?.message || '保存失败', icon: 'none' })
        }
      } catch (error) {
        uni.hideLoading()
        uni.showToast({ title: '保存失败', icon: 'none' })
      }
    },

    // 返回上一页
    // 打开采购地选择器
    openPurchasePlacePicker() {
      uni.showActionSheet({
        itemList: this.purchasePlaceOptions,
        success: ({ tapIndex }) => {
          this.extraForm.purchasePlace = this.purchasePlaceOptions[tapIndex]
        }
      })
    },

    goBack() { uni.navigateBack() }
  }
}
</script>

<style scoped>
.add-product-page {
  min-height: 100vh;
  background: var(--background-color);
  padding-top: calc(120rpx + var(--status-bar-height));
}
.page-scroll {
  height: calc(100vh - (120rpx + var(--status-bar-height)));
}

/* 顶部导航：珊瑚红 */
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
.header-left, .header-right { width: 60rpx; height: 60rpx; display:flex; align-items:center; justify-content:center; border-radius: var(--radius-circle); background: rgba(255,255,255,0.2); }
.header-icon { font-size: var(--font-size-lg); color: #FFFFFF; }
.header-center { flex: 1; text-align: center; }
.header-title { font-size: var(--font-size-lg); font-weight: 600; color: #FFFFFF; }

.section-divider {
  background: #f7f7f7;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  padding: 20rpx var(--spacing-xl);
}

.list-card {
  background: #fff;
  box-shadow: var(--shadow-light);
  margin-bottom: var(--spacing-md);
}

.list-item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx var(--spacing-xl);
  border-bottom: 1rpx solid var(--divider-color);
}
.list-item-row:last-child { border-bottom: none; }

.row-label {
  font-size: 30rpx;
  color: #fff; /* placeholder, will be corrected below */
}
.row-label { color: var(--text-primary); min-width: 220rpx; }

.row-input {
  flex: 1;
  height: 72rpx;
  border: none;
  text-align: right;
  font-size: 28rpx;
  color: var(--text-primary);
}

.selectable .row-value { display: flex; align-items: center; }
.value-text { color: var(--text-secondary); font-size: 28rpx; }
.arrow { margin-left: 12rpx; color: var(--text-tertiary); font-size: 32rpx; }

.specs-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 24rpx var(--spacing-xl);
  margin-top: var(--spacing-md);
  border-top: 1rpx solid var(--divider-color);
  border-bottom: 1rpx solid var(--divider-color);
}
.specs-label { font-size: 30rpx; color: var(--text-primary); }
.add-spec-btn { display: flex; align-items: center; }
.plus { font-size: 36rpx; color: var(--text-secondary); margin-right: 8rpx; }
.btn-text { color: var(--text-secondary); font-size: 28rpx; }

.image-upload-card { background: #fff; padding: 24rpx var(--spacing-xl); }
.image-list { display: flex; flex-wrap: wrap; gap: 20rpx; }
.image-item { position: relative; width: 160rpx; height: 160rpx; }
.uploaded-image { width: 100%; height: 100%; border-radius: 10rpx; }
.upload-btn { width: 160rpx; height: 160rpx; border: 2rpx dashed #ddd; border-radius: 10rpx; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #fafafa; }
.upload-icon { font-size: 40rpx; color: #999; margin-bottom: 10rpx; }
.upload-text { font-size: 24rpx; color: #999; }
.upload-tip { font-size: 24rpx; color: #999; margin-top: 20rpx; display: block; }

.upload-status { position: absolute; inset: 0; background: rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; border-radius: 10rpx; }
.status-text { color: #fff; font-size: 24rpx; background: rgba(0,0,0,0.7); padding: 10rpx 20rpx; border-radius: 20rpx; }
.delete-btn { position: absolute; top: -10rpx; right: -10rpx; width: 40rpx; height: 40rpx; background: #ff4444; border-radius: 50%; display:flex; align-items:center; justify-content:center; }
.delete-icon { color: #fff; font-size: 24rpx; font-weight: bold; }
</style>