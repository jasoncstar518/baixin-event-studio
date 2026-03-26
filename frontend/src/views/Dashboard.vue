<template>
  <div class="dashboard">
    <header class="header">
      <h1>🎯 我的工作台</h1>
      <div class="user-info">
        <el-avatar :size="36">用</el-avatar>
        <span>匿名用户</span>
        <el-button @click="handleLogout" size="small">退出</el-button>
      </div>
    </header>

    <main class="main">
      <div class="actions">
        <el-button type="primary" size="large" @click="createEvent">
          <el-icon><Plus /></el-icon>
          创建新活动
        </el-button>
      </div>

      <section class="events-section">
        <h2>我的活动</h2>
        <div class="events-grid" v-if="events.length > 0">
          <div class="event-card" v-for="event in events" :key="event.id">
            <div class="event-header">
              <h3>{{ event.title }}</h3>
              <el-tag :type="event.status === 'published' ? 'success' : 'info'">
                {{ event.status === 'published' ? '已发布' : '草稿' }}
              </el-tag>
            </div>
            <p class="event-meta">创建于：{{ formatDate(event.createdAt) }}</p>
            <div class="event-actions">
              <el-button size="small" @click="editEvent(event.id)">编辑</el-button>
              <el-button size="small" v-if="event.status === 'published'">查看</el-button>
              <el-button size="small" type="danger" @click="deleteEvent(event.id)">删除</el-button>
            </div>
          </div>
        </div>
        <el-empty v-else description="暂无活动，创建一个吧！" />
      </section>
    </main>

    <!-- 创建活动对话框 -->
    <el-dialog v-model="dialogVisible" title="创建新活动" width="500px">
      <el-form :model="newEvent" label-width="80px">
        <el-form-item label="活动标题">
          <el-input v-model="newEvent.title" placeholder="请输入活动标题" />
        </el-form-item>
        <el-form-item label="选择模板">
          <el-select v-model="newEvent.templateId" placeholder="选择模板" style="width: 100%">
            <el-option label="💕 周年纪念" value="anniversary" />
            <el-option label="🎂 生日庆祝" value="birthday" />
            <el-option label="💍 求婚告白" value="wedding" />
            <el-option label="🚀 产品发布" value="product" />
            <el-option label="🎉 品牌活动" value="brand" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmCreate">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

const events = ref([
  // 示例数据
  { id: '1', title: '五周年纪念日', status: 'draft', createdAt: new Date().toISOString() },
  { id: '2', title: '宝宝生日派对', status: 'published', createdAt: new Date().toISOString() }
])

const dialogVisible = ref(false)
const newEvent = reactive({
  title: '',
  templateId: ''
})

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const createEvent = () => {
  dialogVisible.value = true
}

const confirmCreate = () => {
  if (!newEvent.title) {
    ElMessage.warning('请输入活动标题')
    return
  }
  // TODO: 调用创建活动 API
  ElMessage.success('活动创建成功')
  dialogVisible.value = false
  newEvent.title = ''
  newEvent.templateId = ''
}

const editEvent = (id) => {
  router.push(`/editor/${id}`)
}

const deleteEvent = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个活动吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    // TODO: 调用删除 API
    events.value = events.value.filter(e => e.id !== id)
    ElMessage.success('删除成功')
  } catch {
    // 取消删除
  }
}

const handleLogout = () => {
  localStorage.removeItem('token')
  ElMessage.success('已退出登录')
  router.push('/')
}
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #f5f7fa;
}

.header {
  background: white;
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header h1 {
  font-size: 24px;
  color: #333;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.actions {
  margin-bottom: 32px;
}

.events-section h2 {
  margin-bottom: 24px;
  color: #333;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.event-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s;
}

.event-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.event-header h3 {
  font-size: 18px;
  color: #333;
}

.event-meta {
  color: #999;
  font-size: 14px;
  margin-bottom: 16px;
}

.event-actions {
  display: flex;
  gap: 8px;
}
</style>
