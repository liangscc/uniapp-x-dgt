<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
			 // 检测更新
			 // 网络监听
			 // 初始化数据
		},
		onShow: function() {
			console.log('App Show') 
			// 恢复播放
		},
		onHide: function() {
			console.log('App Hide')
			// 停在播放
		}
	}
</script>

<style>
	/*每个页面公共css */
	/* 官方 css 库 */
	@import "./common/uni.css";
	/* iconfont */
	@import "./common/iconfont/iconfont.css";
	/* 动画库 */
	@import "./common/animate.min.css";
</style>
