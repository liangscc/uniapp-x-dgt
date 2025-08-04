<template>
  <view class="add-product-container">
    <!-- 表单内容 -->
    <scroll-view class="form-scroll" scroll-y="true">
      <view class="form-content">
        
        <!-- 基本信息 -->
        <view class="form-section">
          <view class="section-title">
            <text class="title-text">基本信息</text>
          </view>
          
          <view class="form-item">
            <text class="label">商品名称 *</text>
            <input 
              class="input-field" 
              v-model="formData.name" 
              placeholder="请输入商品名称"
              maxlength="50"
            />
          </view>
          
          <view class="form-item">
            <text class="label">商品编码</text>
            <input 
              class="input-field" 
              v-model="formData.code" 
              placeholder="请输入商品编码"
              maxlength="20"
            />
          </view>
          
          <view class="form-item">
            <text class="label">商品描述</text>
            <textarea 
              class="textarea-field" 
              v-model="formData.description" 
              placeholder="请输入商品描述"
              maxlength="200"
            />
          </view>
        </view>

        <!-- 分类信息 -->
        <view class="form-section">
          <view class="section-title">
            <text class="title-text">分类信息</text>
          </view>
          
          <view class="form-item">
            <text class="label">一级分类 *</text>
            <picker 
              class="picker-field" 
              :value="categoryIndex.first" 
              :range="categoryList.first" 
              range-key="name"
              @change="onFirstCategoryChange"
            >
              <view class="picker-text">
                {{ categoryList.first[categoryIndex.first]?.name || '请选择一级分类' }}
              </view>
            </picker>
          </view>
          
          <view class="form-item">
            <text class="label">二级分类</text>
            <picker 
              class="picker-field" 
              :value="categoryIndex.second" 
              :range="categoryList.second" 
              range-key="name"
              @change="onSecondCategoryChange"
            >
              <view class="picker-text">
                {{ categoryList.second[categoryIndex.second]?.name || '请选择二级分类' }}
              </view>
            </picker>
          </view>
          
          <view class="form-item">
            <text class="label">三级分类</text>
            <picker 
              class="picker-field" 
              :value="categoryIndex.third" 
              :range="categoryList.third" 
              range-key="name"
              @change="onThirdCategoryChange"
            >
              <view class="picker-text">
                {{ categoryList.third[categoryIndex.third]?.name || '请选择三级分类' }}
              </view>
            </picker>
          </view>
        </view>

        <!-- 价格信息 -->
        <view class="form-section">
          <view class="section-title">
            <text class="title-text">价格信息</text>
          </view>
          
          <view class="form-item">
            <text class="label">成本价 *</text>
            <input 
              class="input-field" 
              v-model="formData.costPrice" 
              type="digit"
              placeholder="请输入成本价"
            />
          </view>
          
          <view class="form-item">
            <text class="label">销售价 *</text>
            <input 
              class="input-field" 
              v-model="formData.salePrice" 
              type="digit"
              placeholder="请输入销售价"
            />
          </view>
          
          <view class="form-item">
            <text class="label">市场价</text>
            <input 
              class="input-field" 
              v-model="formData.marketPrice" 
              type="digit"
              placeholder="请输入市场价"
            />
          </view>
        </view>

        <!-- 库存信息 -->
        <view class="form-section">
          <view class="section-title">
            <text class="title-text">库存信息</text>
          </view>
          
          <view class="form-item">
            <text class="label">初始库存 *</text>
            <input 
              class="input-field" 
              v-model="formData.stock" 
              type="number"
              placeholder="请输入初始库存"
            />
          </view>
          
          <view class="form-item">
            <text class="label">库存预警值</text>
            <input 
              class="input-field" 
              v-model="formData.stockWarning" 
              type="number"
              placeholder="请输入库存预警值"
            />
          </view>
        </view>

        <!-- 商品图片 -->
        <view class="form-section">
          <view class="section-title">
            <text class="title-text">商品图片</text>
          </view>
          
          <view class="image-upload">
            <view class="image-list">
              <!-- 调试信息 -->
              <view style="font-size: 12px; color: #999; margin-bottom: 10px;">
                图片数量: {{ formData.images.length }}
              </view>
              <template v-for="(image, index) in formData.images" :key="index">
                <view 
                  class="image-item" 
                  v-if="image && image.url"
                >
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
                <text class="upload-icon">+</text>
                <text class="upload-text">添加图片</text>
              </view>
            </view>
            <text class="upload-tip">最多上传5张图片</text>
          </view>
        </view>

        <!-- 其他信息 -->
        <view class="form-section">
          <view class="section-title">
            <text class="title-text">其他信息</text>
          </view>
          
          <view class="form-item">
            <text class="label">品牌</text>
            <input 
              class="input-field" 
              v-model="formData.brand" 
              placeholder="请输入品牌"
            />
          </view>
          
          <view class="form-item">
            <text class="label">规格</text>
            <input 
              class="input-field" 
              v-model="formData.specification" 
              placeholder="请输入规格"
            />
          </view>
          
          <view class="form-item">
            <text class="label">单位</text>
            <input 
              class="input-field" 
              v-model="formData.unit" 
              placeholder="请输入单位"
            />
          </view>
          
          <view class="form-item">
            <text class="label">重量(kg)</text>
            <input 
              class="input-field" 
              v-model="formData.weight" 
              type="digit"
              placeholder="请输入重量"
            />
          </view>
        </view>

      </view>
    </scroll-view>

    <!-- 底部操作按钮 -->
    <view class="bottom-actions">
      <button class="btn btn-cancel" @click="goBack">取消</button>
      <button class="btn btn-save" @click="saveProduct">保存商品</button>
    </view>
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
        categoryId: '',
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
      categoryList: {
        first: [],
        second: [],
        third: []
      },
      categoryIndex: {
        first: 0,
        second: 0,
        third: 0
      }
    }
  },
  
  onLoad() {
    this.loadCategories()
  },
  
  methods: {
    // 加载分类数据
    async loadCategories() {
      try {
        const response = await apiService.getCategory({})
        if (response && response.data) {
          this.categoryList.first = response.data
        }
      } catch (error) {
        console.error('加载分类失败:', error)
        uni.showToast({
          title: '加载分类失败',
          icon: 'none'
        })
      }
    },
    
    // 一级分类变化
    onFirstCategoryChange(e) {
      const index = e.detail.value
      this.categoryIndex.first = index
      this.categoryIndex.second = 0
      this.categoryIndex.third = 0
      this.categoryList.second = []
      this.categoryList.third = []
      
      if (this.categoryList.first[index]) {
        this.loadSecondCategories(this.categoryList.first[index].id)
      }
    },
    
    // 二级分类变化
    onSecondCategoryChange(e) {
      const index = e.detail.value
      this.categoryIndex.second = index
      this.categoryIndex.third = 0
      this.categoryList.third = []
      
      if (this.categoryList.second[index]) {
        this.loadThirdCategories(this.categoryList.second[index].id)
      }
    },
    
    // 三级分类变化
    onThirdCategoryChange(e) {
      const index = e.detail.value
      this.categoryIndex.third = index
    },
    
    // 加载二级分类
    async loadSecondCategories(parentId) {
      try {
        const response = await apiService.getSecondCategory({ id: parentId })
        if (response && response.data) {
          this.categoryList.second = response.data
        }
      } catch (error) {
        console.error('加载二级分类失败:', error)
      }
    },
    
    // 加载三级分类
    async loadThirdCategories(parentId) {
      try {
        const response = await apiService.getThirdCategory({ id: parentId })
        if (response && response.data) {
          this.categoryList.third = response.data
        }
      } catch (error) {
        console.error('加载三级分类失败:', error)
      }
    },
    
    // 选择图片
    chooseImage() {
      console.log('开始选择图片')
      uni.chooseImage({
        count: 5 - this.formData.images.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          console.log('选择图片成功:', res)
          console.log('选择的图片路径:', res.tempFilePaths)
          // 先显示本地图片
          this.addLocalImages(res.tempFilePaths)
          // 然后异步上传
          this.uploadImages(res.tempFilePaths)
        },
        fail: (error) => {
          console.error('选择图片失败:', error)
          uni.showToast({
            title: '选择图片失败',
            icon: 'none'
          })
        }
      })
    },
    
    // 添加本地图片到显示列表
    addLocalImages(tempFilePaths) {
      console.log('添加本地图片到显示列表:', tempFilePaths)
      for (let i = 0; i < tempFilePaths.length; i++) {
        const imageData = {
          url: tempFilePaths[i],
          isLocal: true,
          uploading: true
        }
        console.log('添加图片数据:', imageData)
        this.formData.images.push(imageData)
      }
      console.log('当前图片列表:', this.formData.images)
      console.log('formData.images长度:', this.formData.images.length)
      // 强制更新视图
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
            // 使用uni.uploadFile上传图片
            const uploadResult = await new Promise((resolve, reject) => {
              uni.uploadFile({
                url: `${apiService.configUrl}/goods/uploadImg`,
                filePath: filePath,
                name: 'file',
                header: {
                  'Content-Type': 'multipart/form-data'
                },
                success: (res) => {
                  try {
                    const data = JSON.parse(res.data)
                    resolve(data)
                  } catch (e) {
                    reject(new Error('解析响应失败'))
                  }
                },
                fail: (error) => {
                  reject(error)
                }
              })
            })
            
            if (uploadResult && uploadResult.code === 200 && uploadResult.data) {
              // 更新图片URL为服务器地址
              this.formData.images[imageIndex] = {
                url: uploadResult.data.url || uploadResult.data,
                isLocal: false,
                uploading: false
              }
            } else {
              // 上传失败，标记为本地图片
              this.formData.images[imageIndex].uploading = false
            }
          } catch (error) {
            console.error('上传单张图片失败:', error)
            // 上传失败，标记为本地图片
            this.formData.images[imageIndex].uploading = false
          }
        }
        
        uni.showToast({
          title: '图片处理完成',
          icon: 'success'
        })
      } catch (error) {
        console.error('上传失败:', error)
        uni.showToast({
          title: '部分图片上传失败',
          icon: 'none'
        })
      }
    },
    
    // 删除图片
    deleteImage(index) {
      this.formData.images.splice(index, 1)
    },
    
    // 验证表单
    validateForm() {
      if (!this.formData.name.trim()) {
        uni.showToast({
          title: '请输入商品名称',
          icon: 'none'
        })
        return false
      }
      
      if (!this.formData.costPrice) {
        uni.showToast({
          title: '请输入成本价',
          icon: 'none'
        })
        return false
      }
      
      if (!this.formData.salePrice) {
        uni.showToast({
          title: '请输入销售价',
          icon: 'none'
        })
        return false
      }
      
      if (!this.formData.stock) {
        uni.showToast({
          title: '请输入初始库存',
          icon: 'none'
        })
        return false
      }
      
      return true
    },
    
    // 获取分类ID
    getCategoryId() {
      let categoryId = ''
      
      if (this.categoryIndex.third >= 0 && this.categoryList.third[this.categoryIndex.third]) {
        categoryId = this.categoryList.third[this.categoryIndex.third].id
      } else if (this.categoryIndex.second >= 0 && this.categoryList.second[this.categoryIndex.second]) {
        categoryId = this.categoryList.second[this.categoryIndex.second].id
      } else if (this.categoryIndex.first >= 0 && this.categoryList.first[this.categoryIndex.first]) {
        categoryId = this.categoryList.first[this.categoryIndex.first].id
      }
      
      return categoryId
    },
    
    // 保存商品
    async saveProduct() {
      if (!this.validateForm()) {
        return
      }
      
      const categoryId = this.getCategoryId()
      if (!categoryId) {
        uni.showToast({
          title: '请选择商品分类',
          icon: 'none'
        })
        return
      }
      
      uni.showLoading({
        title: '保存中...'
      })
      
      try {
        // 处理图片数据，只保留URL
        const imageUrls = this.formData.images.map(img => img.url)
        
        // 构建符合后端API期望的数据结构
        const goodsBean = {
          name: this.formData.name,
          code: this.formData.code,
          description: this.formData.description,
          categoryId: categoryId,
          costPrice: parseFloat(this.formData.costPrice),
          salePrice: parseFloat(this.formData.salePrice),
          marketPrice: this.formData.marketPrice ? parseFloat(this.formData.marketPrice) : 0,
          stock: parseInt(this.formData.stock),
          stockWarning: this.formData.stockWarning ? parseInt(this.formData.stockWarning) : 0,
          brand: this.formData.brand,
          specification: this.formData.specification,
          unit: this.formData.unit,
          weight: this.formData.weight ? parseFloat(this.formData.weight) : 0
        }
        
        const productData = {
          goodsBean: goodsBean,
          listGoodsSpec: [], // 商品规格列表，暂时为空
          listGoodsImg: imageUrls // 商品图片列表
        }
        
        const response = await apiService.addProduct(productData)
        
        uni.hideLoading()
        
        if (response && response.code === 200) {
          uni.showToast({
            title: '保存成功',
            icon: 'success'
          })
          
          // 返回上一页并刷新
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          uni.showToast({
            title: response?.message || '保存失败',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: '保存失败',
          icon: 'none'
        })
      }
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.add-product-container {
  height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.form-scroll {
  flex: 1;
  padding: 20rpx;
}

.form-content {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
}

.form-section {
  margin-bottom: 40rpx;
}

.section-title {
  margin-bottom: 30rpx;
  border-bottom: 1rpx solid #eee;
  padding-bottom: 20rpx;
}

.title-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.form-item {
  margin-bottom: 30rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 15rpx;
  font-weight: 500;
}

.input-field {
  width: 100%;
  height: 80rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  background: #fff;
}

.textarea-field {
  width: 100%;
  height: 120rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  padding: 20rpx;
  font-size: 28rpx;
  background: #fff;
}

.picker-field {
  width: 100%;
  height: 80rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  background: #fff;
}

.picker-text {
  height: 80rpx;
  line-height: 80rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #333;
}

.image-upload {
  margin-top: 20rpx;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.image-item {
  position: relative;
  width: 160rpx;
  height: 160rpx;
}

.uploaded-image {
  width: 100%;
  height: 100%;
  border-radius: 10rpx;
}

.upload-status {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10rpx;
}

.status-text {
  color: #fff;
  font-size: 24rpx;
  background: rgba(0, 0, 0, 0.7);
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
}

.delete-btn {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 40rpx;
  height: 40rpx;
  background: #ff4444;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-icon {
  color: #fff;
  font-size: 24rpx;
  font-weight: bold;
}

.upload-btn {
  width: 160rpx;
  height: 160rpx;
  border: 2rpx dashed #ddd;
  border-radius: 10rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}

.upload-icon {
  font-size: 40rpx;
  color: #999;
  margin-bottom: 10rpx;
}

.upload-text {
  font-size: 24rpx;
  color: #999;
}

.upload-tip {
  font-size: 24rpx;
  color: #999;
  margin-top: 20rpx;
}

.bottom-actions {
  padding: 30rpx;
  background: #fff;
  border-top: 1rpx solid #eee;
  display: flex;
  gap: 20rpx;
}

.btn {
  flex: 1;
  height: 80rpx;
  border-radius: 10rpx;
  font-size: 28rpx;
  border: none;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-save {
  background: #007aff;
  color: #fff;
}
</style> 