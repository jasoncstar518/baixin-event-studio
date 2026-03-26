<template>
  <div class="home">
    <header class="header">
      <h1>🎉 百信活动工坊</h1>
      <p class="subtitle">让任何人无需代码即可创建精美的活动纪念网页</p>
      <div class="actions">
        <el-button @click="$router.push('/login')" type="primary">登录</el-button>
        <el-button @click="$router.push('/register')">注册</el-button>
      </div>
    </header>

    <section class="features">
      <h2>核心功能</h2>
      <div class="feature-grid">
        <div class="feature-card">
          <el-icon :size="48"><Edit /></el-icon>
          <h3>可视化编辑</h3>
          <p>拖拽式操作，所见即所得</p>
        </div>
        <div class="feature-card">
          <el-icon :size="48"><Picture /></el-icon>
          <h3>丰富模板</h3>
          <p>5+ 精美模板，一键套用</p>
        </div>
        <div class="feature-card">
          <el-icon :size="48"><Rocket /></el-icon>
          <h3>快速发布</h3>
          <p>一键发布，生成独立链接</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// 首页
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

.header {
  text-align: center;
  color: white;
  margin-bottom: 60px;
}

.header h1 {
  font-size: 48px;
  margin-bottom: 16px;
}

.subtitle {
  font-size: 20px;
  opacity: 0.9;
  margin-bottom: 32px;
}

.actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.features {
  max-width: 1200px;
  margin: 0 auto;
  color: white;
}

.features h2 {
  text-align: center;
  font-size: 32px;
  margin-bottom: 40px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 40px 24px;
  text-align: center;
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-8px);
}

.feature-card h3 {
  margin: 16px 0 8px;
  font-size: 20px;
}

.feature-card p {
  opacity: 0.8;
}
</style>
