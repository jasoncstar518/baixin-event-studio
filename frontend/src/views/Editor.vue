<template>
  <div class="editor">
    <!-- 顶部工具栏 -->
    <header class="toolbar">
      <div class="left">
        <el-button @click="$router.push('/dashboard')">← 返回</el-button>
        <el-button @click="undo" title="撤销 (Ctrl+Z)">↶</el-button>
        <el-button @click="redo" title="重做 (Ctrl+Shift+Z)">↷</el-button>
        <h2>{{ eventTitle }}</h2>
      </div>
      <div class="right">
        <el-button @click="preview">预览</el-button>
        <el-button type="primary" @click="save">保存 (Ctrl+S)</el-button>
        <el-button type="success" @click="publish">发布</el-button>
      </div>
    </header>

    <div class="editor-body">
      <!-- 左侧组件面板 -->
      <aside class="components-panel">
        <h3>组件库</h3>
        <div class="component-list">
          <div class="component-item" draggable="true" @dragstart="dragComponent('text')">
            <el-icon><Edit /></el-icon>
            <span>文字</span>
          </div>
          <div class="component-item" draggable="true" @dragstart="dragComponent('image')">
            <el-icon><Picture /></el-icon>
            <span>图片</span>
          </div>
          <div class="component-item" draggable="true" @dragstart="dragComponent('timeline')">
            <el-icon><Connection /></el-icon>
            <span>时间线</span>
          </div>
          <div class="component-item" draggable="true" @dragstart="dragComponent('countdown')">
            <el-icon><Timer /></el-icon>
            <span>倒计时</span>
          </div>
        </div>
      </aside>

      <!-- 中间画布 -->
      <main class="canvas-area">
        <div class="canvas" @dragover.prevent @drop="dropComponent">
          <draggable v-model="components" item-key="id" class="components-list">
            <template #item="{ element }">
              <div class="canvas-component" :class="{ selected: selectedId === element.id }" @click="selectComponent(element)">
                <component-preview :component="element" />
                <div class="component-actions">
                  <el-button size="small" @click.stop="moveUp(element.id)">↑</el-button>
                  <el-button size="small" @click.stop="moveDown(element.id)">↓</el-button>
                  <el-button size="small" type="danger" @click.stop="removeComponent(element.id)">删除</el-button>
                </div>
              </div>
            </template>
          </draggable>
          <el-empty v-if="components.length === 0" description="从左侧拖拽组件到此处" />
        </div>
      </main>

      <!-- 右侧属性面板 -->
      <aside class="properties-panel" v-if="selectedComponent">
        <h3>属性设置</h3>
        <el-form label-width="80px" size="small">
          <el-form-item label="类型">
            <el-tag>{{ selectedComponent.type }}</el-tag>
          </el-form-item>
          
          <!-- 文字组件属性 -->
          <template v-if="selectedComponent.type === 'text'">
            <el-form-item label="内容">
              <el-input v-model="selectedComponent.props.content" type="textarea" rows="3" />
            </el-form-item>
            <el-form-item label="字体大小">
              <el-input-number v-model="selectedComponent.props.fontSize" :min="12" :max="72" />
            </el-form-item>
            <el-form-item label="颜色">
              <el-color-picker v-model="selectedComponent.props.color" />
            </el-form-item>
            <el-form-item label="对齐">
              <el-select v-model="selectedComponent.props.textAlign" style="width: 100%">
                <el-option label="左对齐" value="left" />
                <el-option label="居中" value="center" />
                <el-option label="右对齐" value="right" />
              </el-select>
            </el-form-item>
          </template>
          
          <!-- 图片组件属性 -->
          <template v-if="selectedComponent.type === 'image'">
            <el-form-item label="上传">
              <el-upload drag action="#" :before-upload="handleImageUpload" accept="image/*">
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text">点击或拖拽上传图片</div>
              </el-upload>
            </el-form-item>
            <el-form-item label="宽度">
              <el-input-number v-model="selectedComponent.props.width" :min="100" :max="800" />
            </el-form-item>
            <el-form-item label="高度">
              <el-input-number v-model="selectedComponent.props.height" :min="100" :max="600" />
            </el-form-item>
            <el-form-item label="填充">
              <el-select v-model="selectedComponent.props.objectFit" style="width: 100%">
                <el-option label="覆盖" value="cover" />
                <el-option label="包含" value="contain" />
                <el-option label="填充" value="fill" />
              </el-select>
            </el-form-item>
            <el-form-item label="说明">
              <el-input v-model="selectedComponent.props.alt" />
            </el-form-item>
          </template>
          
          <!-- 时间线组件属性 -->
          <template v-if="selectedComponent.type === 'timeline'">
            <el-form-item label="主题">
              <el-select v-model="selectedComponent.props.theme" style="width: 100%">
                <el-option label="蓝色" value="blue" />
                <el-option label="绿色" value="green" />
                <el-option label="橙色" value="orange" />
              </el-select>
            </el-form-item>
            <el-form-item label="时间线项">
              <div class="timeline-items">
                <div v-for="(item, index) in selectedComponent.props.items" :key="index" class="timeline-item">
                  <el-input v-model="item.time" placeholder="时间" style="width: 80px; margin-right: 8px" />
                  <el-input v-model="item.title" placeholder="标题" style="flex: 1; margin-right: 8px" />
                  <el-input v-model="item.description" placeholder="描述" style="flex: 1; margin-right: 8px" />
                  <el-button size="small" type="danger" @click="removeTimelineItem(index)">×</el-button>
                </div>
                <el-button type="primary" size="small" @click="addTimelineItem" style="width: 100%; margin-top: 8px">
                  + 添加时间项
                </el-button>
              </div>
            </el-form-item>
          </template>
          
          <!-- 倒计时组件属性 -->
          <template v-if="selectedComponent.type === 'countdown'">
            <el-form-item label="标题">
              <el-input v-model="selectedComponent.props.title" />
            </el-form-item>
            <el-form-item label="目标日期">
              <el-date-picker 
                v-model="selectedComponent.props.targetDate" 
                type="datetime" 
                placeholder="选择日期时间"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="主题">
              <el-select v-model="selectedComponent.props.theme" style="width: 100%">
                <el-option label="渐变" value="gradient" />
                <el-option label="简约" value="simple" />
                <el-option label="喜庆" value="festive" />
              </el-select>
            </el-form-item>
          </template>
        </el-form>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElUpload } from 'element-plus'
import draggable from 'vuedraggable'
import axios from 'axios'

const eventTitle = ref('未命名活动')
const components = ref([])
const selectedId = ref(null)
const draggedType = ref(null)
const eventId = ref(null)

// 撤销/重做栈
const historyStack = ref([])
const futureStack = ref([])
const isUndoRedo = ref(false)

// 自动保存定时器
let autoSaveTimer = null

const selectedComponent = computed(() => {
  return components.value.find(c => c.id === selectedId.value)
})

// 记录历史（用于撤销/重做）
const recordHistory = () => {
  if (isUndoRedo.value) {
    isUndoRedo.value = false
    return
  }
  historyStack.value.push(JSON.parse(JSON.stringify(components.value)))
  if (historyStack.value.length > 50) historyStack.value.shift()
  futureStack.value = []
}

// 撤销
const undo = () => {
  if (historyStack.value.length === 0) {
    ElMessage.info('没有可撤销的操作')
    return
  }
  futureStack.value.push(JSON.parse(JSON.stringify(components.value)))
  components.value = historyStack.value.pop()
  isUndoRedo.value = true
  ElMessage.success('已撤销')
}

// 重做
const redo = () => {
  if (futureStack.value.length === 0) {
    ElMessage.info('没有可重做的操作')
    return
  }
  historyStack.value.push(JSON.parse(JSON.stringify(components.value)))
  components.value = futureStack.value.pop()
  isUndoRedo.value = true
  ElMessage.success('已重做')
}

// 键盘快捷键
const handleKeydown = (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
    e.preventDefault()
    if (e.shiftKey) {
      redo()
    } else {
      undo()
    }
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault()
    save()
  }
}

const dragComponent = (type) => {
  draggedType.value = type
}

const dropComponent = (event) => {
  if (!draggedType.value) return
  recordHistory()
  
  const newComponent = {
    id: `comp_${Date.now()}`,
    type: draggedType.value,
    props: getDefaultProps(draggedType.value),
    style: {}
  }
  
  components.value.push(newComponent)
  draggedType.value = null
}

const getDefaultProps = (type) => {
  switch (type) {
    case 'text':
      return { content: '请输入文字', fontSize: 24, color: '#333333', textAlign: 'center' }
    case 'image':
      return { url: '', alt: '图片', width: 300, height: 200, objectFit: 'cover' }
    case 'timeline':
      return { 
        items: [
          { time: '10:00', title: '活动开始', description: '' },
          { time: '12:00', title: '午休', description: '' }
        ],
        theme: 'blue'
      }
    case 'countdown':
      return { 
        targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        title: '距离活动开始还有',
        theme: 'gradient'
      }
    default:
      return {}
  }
}

const selectComponent = (component) => {
  selectedId.value = component.id
}

const removeComponent = (id) => {
  recordHistory()
  components.value = components.value.filter(c => c.id !== id)
  if (selectedId.value === id) selectedId.value = null
}

const moveUp = (id) => {
  recordHistory()
  const index = components.value.findIndex(c => c.id === id)
  if (index > 0) {
    [components.value[index - 1], components.value[index]] = 
    [components.value[index], components.value[index - 1]]
  }
}

const moveDown = (id) => {
  recordHistory()
  const index = components.value.findIndex(c => c.id === id)
  if (index < components.value.length - 1) {
    [components.value[index], components.value[index + 1]] = 
    [components.value[index + 1], components.value[index]]
  }
}

// 图片上传处理
const handleImageUpload = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    if (selectedComponent.value && selectedComponent.value.type === 'image') {
      recordHistory()
      selectedComponent.value.props.url = e.target.result
    }
  }
  reader.readAsDataURL(file)
  return false
}

// 时间线项操作
const addTimelineItem = () => {
  if (selectedComponent.value && selectedComponent.value.type === 'timeline') {
    recordHistory()
    selectedComponent.value.props.items.push({ time: '', title: '', description: '' })
  }
}

const removeTimelineItem = (index) => {
  if (selectedComponent.value && selectedComponent.value.type === 'timeline') {
    recordHistory()
    selectedComponent.value.props.items.splice(index, 1)
  }
}

// 保存功能
const save = async () => {
  try {
    const eventData = {
      title: eventTitle.value,
      components: components.value,
      updatedAt: new Date().toISOString()
    }
    
    // TODO: 调用后端保存 API
    // await axios.put(`/api/events/${eventId.value}`, eventData)
    
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败：' + error.message)
  }
}

// 自动保存（30 秒间隔）
const startAutoSave = () => {
  autoSaveTimer = setInterval(() => {
    if (components.value.length > 0) {
      save()
    }
  }, 30000)
}

// 预览功能
const preview = () => {
  const previewWindow = window.open('', '_blank')
  previewWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${eventTitle.value} - 预览</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .component { margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h1>${eventTitle.value}</h1>
        ${components.value.map(c => renderPreview(c)).join('')}
      </body>
    </html>
  `)
  ElMessage.success('预览已打开')
}

const renderPreview = (component) => {
  switch (component.type) {
    case 'text':
      return `<div class="component" style="font-size:${component.props.fontSize}px;color:${component.props.color};text-align:${component.props.textAlign}">${component.props.content}</div>`
    case 'image':
      return `<div class="component"><img src="${component.props.url}" alt="${component.props.alt}" style="max-width:100%" /></div>`
    case 'timeline':
      return `<div class="component"><h3>时间线</h3>${component.props.items.map(i => `<p>${i.time} - ${i.title}</p>`).join('')}</div>`
    case 'countdown':
      return `<div class="component"><h3>${component.props.title}</h3><p>${new Date(component.props.targetDate).toLocaleString()}</p></div>`
    default:
      return `<div class="component">[${component.type}]</div>`
  }
}

// 发布功能
const publish = async () => {
  try {
    // TODO: 调用后端发布 API
    // await axios.post(`/api/events/${eventId.value}/publish`)
    ElMessage.success('发布成功')
  } catch (error) {
    ElMessage.error('发布失败：' + error.message)
  }
}

// 生命周期
onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  startAutoSave()
  
  // 从路由获取事件 ID
  const params = new URLSearchParams(window.location.search)
  eventId.value = params.get('id')
  if (eventId.value) {
    loadEvent(eventId.value)
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (autoSaveTimer) clearInterval(autoSaveTimer)
})

const loadEvent = async (id) => {
  try {
    // TODO: 调用后端 API 加载事件
    // const res = await axios.get(`/api/events/${id}`)
    // eventTitle.value = res.data.title
    // components.value = res.data.components || []
    ElMessage.info('加载事件数据')
  } catch (error) {
    ElMessage.error('加载失败：' + error.message)
  }
}

// 组件预览子组件
const ComponentPreview = {
  props: ['component'],
  template: `
    <div class="preview">
      <div v-if="component.type === 'text'" :style="{ fontSize: component.props.fontSize + 'px', color: component.props.color, textAlign: component.props.textAlign, padding: '8px' }">
        {{ component.props.content }}
      </div>
      <div v-else-if="component.type === 'image'">
        <img :src="component.props.url || 'https://via.placeholder.com/300x200?text=点击上传'" :alt="component.props.alt" :style="{ width: component.props.width + 'px', height: component.props.height + 'px', objectFit: component.props.objectFit }" />
      </div>
      <div v-else-if="component.type === 'timeline'" class="timeline-preview">
        <div v-for="(item, idx) in component.props.items" :key="idx" class="timeline-item-preview" :class="'theme-' + component.props.theme">
          <div class="timeline-time">{{ item.time }}</div>
          <div class="timeline-content">
            <div class="timeline-title">{{ item.title }}</div>
            <div class="timeline-desc">{{ item.description }}</div>
          </div>
        </div>
      </div>
      <div v-else-if="component.type === 'countdown'" class="countdown-preview" :class="'theme-' + component.props.theme">
        <div class="countdown-title">{{ component.props.title }}</div>
        <div class="countdown-date">{{ formatDate(component.props.targetDate) }}</div>
      </div>
      <div v-else>[{{ component.type }} 组件]</div>
    </div>
  `,
  methods: {
    formatDate(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.toLocaleString('zh-CN')
    }
  }
}
</script>

<style scoped>
.editor {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.toolbar {
  height: 60px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.toolbar .left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.toolbar h2 {
  font-size: 18px;
  color: #333;
}

.editor-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.components-panel {
  width: 200px;
  background: #fafafa;
  border-right: 1px solid #e0e0e0;
  padding: 16px;
  overflow-y: auto;
}

.components-panel h3 {
  margin-bottom: 16px;
  font-size: 14px;
  color: #666;
}

.component-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.component-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: grab;
  transition: all 0.2s;
}

.component-item:hover {
  border-color: #409eff;
  background: #ecf5ff;
}

.canvas-area {
  flex: 1;
  background: #f5f7fa;
  padding: 20px;
  overflow-y: auto;
}

.canvas {
  min-height: 100%;
  background: white;
  border-radius: 8px;
  padding: 40px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.canvas-component {
  position: relative;
  border: 2px solid transparent;
  margin-bottom: 16px;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
}

.canvas-component:hover {
  border-color: #409eff;
}

.canvas-component.selected {
  border-color: #409eff;
  background: #ecf5ff;
}

.component-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.canvas-component:hover .component-actions {
  opacity: 1;
}

.properties-panel {
  width: 320px;
  background: white;
  border-left: 1px solid #e0e0e0;
  padding: 16px;
  overflow-y: auto;
}

.properties-panel h3 {
  margin-bottom: 16px;
  font-size: 14px;
  color: #666;
}

.timeline-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.timeline-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 时间线预览样式 */
.timeline-preview {
  padding: 8px;
}

.timeline-item-preview {
  display: flex;
  gap: 12px;
  padding: 8px;
  border-left: 3px solid #409eff;
  margin-bottom: 8px;
}

.timeline-item-preview.theme-green {
  border-left-color: #67c23a;
}

.timeline-item-preview.theme-orange {
  border-left-color: #e6a23c;
}

.timeline-time {
  font-weight: bold;
  color: #666;
  min-width: 60px;
}

.timeline-content {
  flex: 1;
}

.timeline-title {
  font-weight: bold;
  margin-bottom: 4px;
}

.timeline-desc {
  font-size: 12px;
  color: #999;
}

/* 倒计时预览样式 */
.countdown-preview {
  padding: 16px;
  text-align: center;
  border-radius: 8px;
}

.countdown-preview.theme-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.countdown-preview.theme-simple {
  background: #f5f5f5;
  color: #333;
}

.countdown-preview.theme-festive {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.countdown-title {
  font-size: 16px;
  margin-bottom: 8px;
}

.countdown-date {
  font-size: 18px;
  font-weight: bold;
}
</style>
