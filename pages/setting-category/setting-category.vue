<template>
  <view class="setting-category-container">
    <!-- 头部导航 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="header-icon">‹</text>
      </view>
      <view class="header-center">
        <text class="header-title">商品分类设置</text>
      </view>
      <view class="header-right" @click="addCategory">
        <text class="header-icon">+</text>
      </view>
    </view>

    <!-- 分类列表 -->
    <view class="category-list">
      <view 
        class="category-item" 
        v-for="(category, index) in categories" 
        :key="category.id"
        @click="editCategory(category)"
      >
        <view class="category-info">
          <view class="category-icon">
            <text class="icon-text">{{ category.icon || '📁' }}</text>
          </view>
          <view class="category-details">
            <text class="category-name">{{ category.name }}</text>
            <text class="category-desc">{{ category.description || '暂无描述' }}</text>
            <text class="category-count">{{ category.productCount || 0 }} 个商品</text>
          </view>
        </view>
        <view class="category-actions">
          <view class="action-btn edit-btn" @click.stop="editCategory(category)">
            <text class="action-icon">✏️</text>
          </view>
          <view class="action-btn delete-btn" @click.stop="deleteCategory(category)">
            <text class="action-icon">🗑️</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="categories.length === 0">
      <view class="empty-icon">📂</view>
      <text class="empty-text">暂无分类</text>
      <text class="empty-desc">点击右上角"+"添加第一个分类</text>
    </view>

    <!-- 添加/编辑分类弹窗 -->
    <view class="modal-overlay" v-if="showModal" @click="closeModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ isEditing ? '编辑分类' : '添加分类' }}</text>
          <view class="modal-close" @click="closeModal">
            <text class="close-icon">✕</text>
          </view>
        </view>
        
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">分类名称</text>
            <input 
              class="form-input" 
              v-model="formData.name" 
              placeholder="请输入分类名称"
              maxlength="20"
            />
          </view>
          
          <view class="form-item">
            <text class="form-label">分类图标</text>
            <view class="icon-selector">
              <view 
                class="icon-option" 
                :class="{ active: formData.icon === icon }"
                v-for="icon in iconOptions" 
                :key="icon"
                @click="selectIcon(icon)"
              >
                <text class="icon-text">{{ icon }}</text>
              </view>
            </view>
          </view>
          
          <view class="form-item">
            <text class="form-label">分类描述</text>
            <textarea 
              class="form-textarea" 
              v-model="formData.description" 
              placeholder="请输入分类描述（可选）"
              maxlength="100"
            />
          </view>
          
          <view class="form-item" v-if="isEditing">
            <text class="form-label">排序</text>
            <input 
              class="form-input" 
              v-model="formData.sort" 
              type="number"
              placeholder="数字越小越靠前"
            />
          </view>
        </view>
        
        <view class="modal-footer">
          <view class="btn btn-cancel" @click="closeModal">
            <text class="btn-text">取消</text>
          </view>
          <view class="btn btn-confirm" @click="saveCategory">
            <text class="btn-text">保存</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'SettingCategory',
  data() {
    return {
      categories: [
        {
          id: 1,
          name: '电子产品',
          icon: '📱',
          description: '手机、电脑、平板等电子设备',
          productCount: 25,
          sort: 1
        },
        {
          id: 2,
          name: '服装配饰',
          icon: '👕',
          description: '男装、女装、鞋帽等服饰类',
          productCount: 18,
          sort: 2
        },
        {
          id: 3,
          name: '家居用品',
          icon: '🏠',
          description: '家具、装饰、生活用品',
          productCount: 12,
          sort: 3
        },
        {
          id: 4,
          name: '运动户外',
          icon: '⚽',
          description: '运动器材、户外装备',
          productCount: 8,
          sort: 4
        }
      ],
      showModal: false,
      isEditing: false,
      editingIndex: -1,
      formData: {
        name: '',
        icon: '📁',
        description: '',
        sort: 0
      },
      iconOptions: ['📁', '📱', '💻', '👕', '👖', '👟', '🏠', '🛋️', '⚽', '🏃', '🎒', '👜', '💄', '🧴', '🍎', '🥤', '📚', '✏️', '🎨', '🎵']
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    
    addCategory() {
      this.isEditing = false
      this.editingIndex = -1
      this.formData = {
        name: '',
        icon: '📁',
        description: '',
        sort: this.categories.length + 1
      }
      this.showModal = true
    },
    
    editCategory(category) {
      this.isEditing = true
      this.editingIndex = this.categories.findIndex(item => item.id === category.id)
      this.formData = {
        name: category.name,
        icon: category.icon,
        description: category.description,
        sort: category.sort
      }
      this.showModal = true
    },
    
    deleteCategory(category) {
      uni.showModal({
        title: '确认删除',
        content: `确定要删除分类"${category.name}"吗？删除后该分类下的商品将变为未分类状态。`,
        confirmText: '删除',
        confirmColor: '#ff4757',
        success: (res) => {
          if (res.confirm) {
            const index = this.categories.findIndex(item => item.id === category.id)
            if (index > -1) {
              this.categories.splice(index, 1)
              uni.showToast({
                title: '删除成功',
                icon: 'success'
              })
            }
          }
        }
      })
    },
    
    selectIcon(icon) {
      this.formData.icon = icon
    },
    
    closeModal() {
      this.showModal = false
    },
    
    saveCategory() {
      if (!this.formData.name.trim()) {
        uni.showToast({
          title: '请输入分类名称',
          icon: 'none'
        })
        return
      }
      
      if (this.isEditing) {
        // 编辑模式
        if (this.editingIndex > -1) {
          this.categories[this.editingIndex] = {
            ...this.categories[this.editingIndex],
            name: this.formData.name,
            icon: this.formData.icon,
            description: this.formData.description,
            sort: parseInt(this.formData.sort) || 0
          }
        }
      } else {
        // 添加模式
        const newCategory = {
          id: Date.now(),
          name: this.formData.name,
          icon: this.formData.icon,
          description: this.formData.description,
          productCount: 0,
          sort: parseInt(this.formData.sort) || this.categories.length + 1
        }
        this.categories.push(newCategory)
      }
      
      // 按排序字段排序
      this.categories.sort((a, b) => a.sort - b.sort)
      
      this.closeModal()
      uni.showToast({
        title: this.isEditing ? '编辑成功' : '添加成功',
        icon: 'success'
      })
    }
  }
}
</script>

<style scoped>
.setting-category-container {
  min-height: 100vh;
  background: var(--background-color);
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

.category-list {
  padding: 0 var(--spacing-xl);
}

.category-item {
  background: var(--card-background);
  border-radius: var(--radius-medium);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  box-shadow: var(--shadow-light);
  transition: all 0.3s ease;
}

.category-item:active {
  transform: scale(0.98);
  box-shadow: var(--shadow-medium);
}

.category-info {
  display: flex;
  align-items: center;
}

.category-icon {
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.icon-text {
  font-size: 40rpx;
}

.category-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.category-name {
  font-size: 36rpx;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8rpx;
}

.category-desc {
  font-size: 28rpx;
  color: #7f8c8d;
  margin-bottom: 8rpx;
  line-height: 1.4;
}

.category-count {
  font-size: 24rpx;
  color: #3498db;
  font-weight: 500;
}

.category-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 30rpx;
}

.action-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.edit-btn {
  background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
}

.delete-btn {
  background: linear-gradient(135deg, #ff7675 0%, #d63031 100%);
}

.action-icon {
  font-size: 32rpx;
}

.action-btn:active {
  transform: scale(0.9);
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10rpx);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.modal-content {
  background: #fff;
  border-radius: 24rpx;
  width: 100%;
  max-width: 600rpx;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.modal-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #2c3e50;
}

.modal-close {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f8f9fa;
}

.close-icon {
  font-size: 28rpx;
  color: #7f8c8d;
}

.modal-body {
  padding: 40rpx;
  max-height: 60vh;
  overflow-y: auto;
}

.form-item {
  margin-bottom: 40rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #2c3e50;
  font-weight: 500;
  margin-bottom: 20rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #2c3e50;
  background: #fff;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  border-color: #667eea;
}

.form-textarea {
  width: 100%;
  min-height: 120rpx;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  padding: 24rpx;
  font-size: 28rpx;
  color: #2c3e50;
  background: #fff;
  resize: none;
  transition: border-color 0.2s ease;
}

.form-textarea:focus {
  border-color: #667eea;
}

.icon-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.icon-option {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  background: #fff;
  transition: all 0.2s ease;
}

.icon-option.active {
  border-color: #667eea;
  background: #667eea;
  color: #fff;
}

.icon-option:active {
  transform: scale(0.95);
}

.modal-footer {
  display: flex;
  gap: 20rpx;
  padding: 40rpx;
  border-top: 1rpx solid #f0f0f0;
}

.btn {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: #f8f9fa;
  color: #7f8c8d;
}

.btn-confirm {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.btn:active {
  transform: scale(0.98);
}

.btn-text {
  font-size: 28rpx;
  font-weight: 500;
}
</style> 