<template>
  <div class="event-view">
    <header class="event-header" v-if="event">
      <h1>{{ event.title }}</h1>
    </header>

    <main class="event-content">
      <div class="component-container" v-for="component in components" :key="component.id">
        <!-- 文字组件 -->
        <div v-if="component.type === 'text'" 
             class="text-component"
             :style="{ 
               fontSize: component.props.fontSize + 'px', 
               color: component.props.color, 
               textAlign: component.props.textAlign 
             }">
          {{ component.props.content }}
        </div>

        <!-- 图片组件 -->
        <div v-else-if="component.type === 'image'" class="image-component">
          <img :src="component.props.url" :alt="component.props.alt" />
        </div>

        <!-- 时间线组件 -->
        <div v-else-if="component.type === 'timeline'" class="timeline-component">
          <div class="timeline-item" v-for="(item, index) in component.props.items" :key="index">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <div class="timeline-date">{{ item.date }}</div>
              <div class="timeline-title">{{ item.title }}</div>
              <div class="timeline-description">{{ item.description }}</div>
            </div>
          </div>
        </div>

        <!-- 倒计时组件 -->
        <div v-else-if="component.type === 'countdown'" class="countdown-component">
          <div class="countdown-timer">
            <div class="countdown-item">
              <span class="countdown-number">{{ countdown.days }}</span>
              <span class="countdown-label">天</span>
            </div>
            <div class="countdown-item">
              <span class="countdown-number">{{ countdown.hours }}</span>
              <span class="countdown-label">时</span>
            </div>
            <div class="countdown-item">
              <span class="countdown-number">{{ countdown.minutes }}</span>
              <span class="countdown-label">分</span>
            </div>
            <div class="countdown-item">
              <span class="countdown-number">{{ countdown.seconds }}</span>
              <span class="countdown-label">秒</span>
            </div>
          </div>
        </div>

        <!-- 未知组件 -->
        <div v-else class="unknown-component">
          [{{ component.type }} 组件]
        </div>
      </div>

      <div v-if="!event || components.length === 0" class="empty-state">
        <h2>活动不存在或尚未发布</h2>
        <el-button @click="$router.push('/')">返回首页</el-button>
      </div>
    </main>

    <footer class="event-footer" v-if="event">
      <p>Powered by 百信活动工坊</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const event = ref(null)
const components = ref([])
const countdown = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 })
let timer = null

onMounted(async () => {
  const slug = route.params.slug
  
  // TODO: 调用 API 获取活动数据
  // const res = await axios.get(`/api/events/${slug}`)
  // event.value = res.data.event
  // components.value = res.data.components
  
  // 示例数据
  event.value = {
    id: '1',
    title: '五周年纪念日快乐',
    slug: slug
  }
  
  components.value = [
    {
      id: '1',
      type: 'text',
      props: {
        content: '💕 五周年快乐 💕',
        fontSize: 48,
        color: '#e91e63',
        textAlign: 'center'
      }
    },
    {
      id: '2',
      type: 'text',
      props: {
        content: '感谢有你，相伴一生',
        fontSize: 24,
        color: '#666666',
        textAlign: 'center'
      }
    },
    {
      id: '3',
      type: 'timeline',
      props: {
        items: [
          { date: '2021-03-26', title: '相遇', description: '第一次见面' },
          { date: '2022-05-20', title: '求婚', description: '你愿意嫁给我吗？' },
          { date: '2023-08-15', title: '结婚', description: '执子之手，与子偕老' }
        ]
      }
    }
  ]
  
  // 启动倒计时
  startCountdown()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const startCountdown = () => {
  const targetDate = new Date('2026-03-26T00:00:00').getTime()
  
  timer = setInterval(() => {
    const now = new Date().getTime()
    const distance = targetDate - now
    
    if (distance < 0) {
      clearInterval(timer)
      return
    }
    
    countdown.value = {
      days: Math.floor(distance / (1000 * 60 * 60 * 24)),
      hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((distance % (1000 * 60)) / 1000)
    }
  }, 1000)
}
</script>

<style scoped>
.event-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.event-header {
  background: white;
  padding: 40px 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.event-header h1 {
  font-size: 36px;
  color: #333;
}

.event-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.component-container {
  margin-bottom: 40px;
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.text-component {
  line-height: 1.6;
}

.image-component img {
  max-width: 100%;
  border-radius: 8px;
}

.timeline-component {
  position: relative;
  padding-left: 32px;
}

.timeline-item {
  position: relative;
  padding-bottom: 32px;
  padding-left: 24px;
  border-left: 2px solid #e0e0e0;
}

.timeline-item:last-child {
  border-left-color: transparent;
}

.timeline-marker {
  position: absolute;
  left: -8px;
  top: 0;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #409eff;
  border: 3px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.timeline-date {
  font-size: 14px;
  color: #999;
  margin-bottom: 4px;
}

.timeline-title {
  font-size: 18px;
  color: #333;
  margin-bottom: 8px;
}

.timeline-description {
  font-size: 14px;
  color: #666;
}

.countdown-component {
  text-align: center;
}

.countdown-timer {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.countdown-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.countdown-number {
  font-size: 48px;
  font-weight: bold;
  color: #409eff;
}

.countdown-label {
  font-size: 14px;
  color: #999;
  margin-top: 8px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-state h2 {
  color: #666;
  margin-bottom: 24px;
}

.event-footer {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 14px;
}
</style>
