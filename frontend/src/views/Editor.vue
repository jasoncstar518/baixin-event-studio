<template>
  <div class="editor">
    <!-- 顶部工具栏 -->
    <header class="toolbar">
      <div class="left">
        <el-button @click="$router.push('/dashboard')">← 返回</el-button>
        <el-button @click="undo" title="撤销 (Ctrl+Z)">↶</el-button>
        <el-button @click="redo" title="重做 (Ctrl+Shift+Z)">↷</el-button>
        <el-input v-model="eventTitle" placeholder="活动标题" style="width: 200px; margin-left: 10px" />
      </div>
      <div class="right">
        <el-button @click="preview">预览</el-button>
        <el-button type="primary" @click="save" :loading="saving">保存 (Ctrl+S)</el-button>
        <el-button type="success" @click="publish" :loading="publishing">发布</el-button>
      </div>
    </header>

    <div class="editor-body">
      <!-- 左侧页面和组件面板 -->
      <aside class="left-panel">
        <!-- 页面管理 -->
        <div class="pages-section">
          <div class="section-header">
            <h3>页面</h3>
            <el-button type="primary" size="small" @click="addPage" title="添加页面">+</el-button>
          </div>
          <div class="page-list">
            <div 
              v-for="(page, index) in pages" 
              :key="page.id"
              :class="['page-item', { active: currentPageId === page.id }]"
              @click="switchPage(page.id)"
            >
              <el-icon><Document /></el-icon>
              <span class="page-name">{{ page.name || `页面 ${index + 1}` }}</span>
              <el-button 
                v-if="pages.length > 1"
                size="small" 
                type="danger" 
                class="delete-page-btn"
                @click.stop="deletePage(page.id)"
              >×</el-button>
            </div>
          </div>
        </div>

        <!-- 组件库 -->
        <div class="components-section">
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
          <div class="component-item" draggable="true" @dragstart="dragComponent('button')">
            <el-icon><Pointer /></el-icon>
            <span>按钮</span>
          </div>
          <div class="component-item" draggable="true" @dragstart="dragComponent('timeline')">
            <el-icon><Connection /></el-icon>
            <span>时间线</span>
          </div>
          <div class="component-item" draggable="true" @dragstart="dragComponent('countdown')">
            <el-icon><Timer /></el-icon>
            <span>倒计时</span>
          </div>
          <div class="component-item" draggable="true" @dragstart="dragComponent('marquee')">
            <el-icon><Promotion /></el-icon>
            <span>滚动文字</span>
          </div>
          <div class="component-item" draggable="true" @dragstart="dragComponent('quiz')">
            <el-icon><QuestionFilled /></el-icon>
            <span>问答题</span>
          </div>
          <div class="component-item" draggable="true" @dragstart="dragComponent('essay')">
            <el-icon><Document /></el-icon>
            <span>简答题</span>
          </div>
          <div class="component-item" draggable="true" @dragstart="dragComponent('rewardCard')">
            <el-icon><Van /></el-icon>
            <span>奖励卡</span>
          </div>
          <div class="component-item" draggable="true" @dragstart="dragComponent('punishCard')">
            <el-icon><WarningFilled /></el-icon>
            <span>惩罚卡</span>
          </div>
          </div>
        </div>
      </div>

      <!-- 中间画布 -->
      <main class="canvas-area">
        <div class="page-indicator">
          <span>当前页面：{{ currentPage?.name || '未命名页面' }}</span>
        </div>
        <div class="canvas" @dragover.prevent @drop="dropComponent">
          <draggable v-model="currentPageComponents" item-key="id" class="components-list">
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
          <el-empty v-if="currentPageComponents.length === 0" description="从左侧拖拽组件到此处" />
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

          <!-- 按钮组件属性 -->
          <template v-if="selectedComponent.type === 'button'">
            <el-form-item label="文字">
              <el-input v-model="selectedComponent.props.text" />
            </el-form-item>
            <el-form-item label="跳转页面">
              <el-select v-model="selectedComponent.props.jumpToPage" placeholder="选择目标页面" style="width: 100%">
                <el-option 
                  v-for="page in pages" 
                  :key="page.id" 
                  :label="page.name" 
                  :value="page.id"
                  :disabled="page.id === currentPageId"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="按钮颜色">
              <el-color-picker v-model="selectedComponent.props.color" />
            </el-form-item>
            <el-form-item label="尺寸">
              <el-select v-model="selectedComponent.props.size" style="width: 100%">
                <el-option label="小" value="small" />
                <el-option label="中" value="default" />
                <el-option label="大" value="large" />
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
            <el-form-item label="跳转页面">
              <el-select v-model="selectedComponent.props.jumpToPage" placeholder="不跳转" style="width: 100%" clearable>
                <el-option 
                  v-for="page in pages" 
                  :key="page.id" 
                  :label="page.name" 
                  :value="page.id"
                  :disabled="page.id === currentPageId"
                />
              </el-select>
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

          <!-- 滚动文字组件属性 -->
          <template v-if="selectedComponent.type === 'marquee'">
            <el-form-item label="内容">
              <el-input v-model="selectedComponent.props.content" type="textarea" rows="2" />
            </el-form-item>
            <el-form-item label="速度">
              <el-slider v-model="selectedComponent.props.speed" :min="1" :max="10" />
            </el-form-item>
            <el-form-item label="方向">
              <el-select v-model="selectedComponent.props.direction" style="width: 100%">
                <el-option label="从右到左" value="left" />
                <el-option label="从左到右" value="right" />
              </el-select>
            </el-form-item>
            <el-form-item label="背景色">
              <el-color-picker v-model="selectedComponent.props.backgroundColor" />
            </el-form-item>
            <el-form-item label="文字颜色">
              <el-color-picker v-model="selectedComponent.props.color" />
            </el-form-item>
          </template>

          <!-- 问答题组件属性 -->
          <template v-if="selectedComponent.type === 'quiz'">
            <el-form-item label="题目">
              <el-input v-model="selectedComponent.props.question" type="textarea" rows="2" />
            </el-form-item>
            <el-form-item label="选项">
              <div class="quiz-options">
                <div v-for="(option, index) in selectedComponent.props.options" :key="index" class="quiz-option">
                  <el-input v-model="option.text" :placeholder="'选项' + (index+1)" style="flex: 1" />
                  <el-radio v-model="selectedComponent.props.correctAnswer" :label="index">✓</el-radio>
                  <el-button size="small" type="danger" @click="removeQuizOption(index)" :disabled="selectedComponent.props.options.length <= 2">×</el-button>
                </div>
                <el-button type="primary" size="small" @click="addQuizOption" style="width: 100%; margin-top: 8px">
                  + 添加选项
                </el-button>
              </div>
            </el-form-item>
            <el-form-item label="答对奖励">
              <el-select v-model="selectedComponent.props.rewardCardId" placeholder="选择奖励卡" style="width: 100%">
                <el-option label="无" :value="null" />
                <el-option v-for="card in rewardCards" :key="card.id" :label="card.name" :value="card.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="答错惩罚">
              <el-select v-model="selectedComponent.props.punishCardId" placeholder="选择惩罚卡" style="width: 100%">
                <el-option label="无" :value="null" />
                <el-option v-for="card in punishCards" :key="card.id" :label="card.name" :value="card.id" />
              </el-select>
            </el-form-item>
          </template>

          <!-- 简答题组件属性 -->
          <template v-if="selectedComponent.type === 'essay'">
            <el-form-item label="题目">
              <el-input v-model="selectedComponent.props.question" type="textarea" rows="2" />
            </el-form-item>
            <el-form-item label="提示文字">
              <el-input v-model="selectedComponent.props.placeholder" placeholder="请输入提示文字" />
            </el-form-item>
            <el-form-item label="最少字数">
              <el-input-number v-model="selectedComponent.props.minLength" :min="0" :max="1000" />
            </el-form-item>
          </template>

          <!-- 奖励卡组件属性 -->
          <template v-if="selectedComponent.type === 'rewardCard'">
            <el-form-item label="卡片名称">
              <el-input v-model="selectedComponent.props.name" />
            </el-form-item>
            <el-form-item label="卡片内容">
              <el-input v-model="selectedComponent.props.content" type="textarea" rows="3" />
            </el-form-item>
            <el-form-item label="图标">
              <el-select v-model="selectedComponent.props.icon" style="width: 100%">
                <el-option label="🎁" value="🎁" />
                <el-option label="🎉" value="🎉" />
                <el-option label="💝" value="💝" />
                <el-option label="⭐" value="⭐" />
                <el-option label="🌟" value="🌟" />
              </el-select>
            </el-form-item>
          </template>

          <!-- 惩罚卡组件属性 -->
          <template v-if="selectedComponent.type === 'punishCard'">
            <el-form-item label="卡片名称">
              <el-input v-model="selectedComponent.props.name" />
            </el-form-item>
            <el-form-item label="卡片内容">
              <el-input v-model="selectedComponent.props.content" type="textarea" rows="3" />
            </el-form-item>
            <el-form-item label="图标">
              <el-select v-model="selectedComponent.props.icon" style="width: 100%">
                <el-option label="😈" value="😈" />
                <el-option label="👻" value="👻" />
                <el-option label="💀" value="💀" />
                <el-option label="🎃" value="🎃" />
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
import { ElMessage } from 'element-plus'
import draggable from 'vuedraggable'
import axios from 'axios'

// 配置 axios 默认地址
axios.defaults.baseURL = '/api'
axios.defaults.headers.common['Content-Type'] = 'application/json'

// 从 localStorage 获取 token
const token = localStorage.getItem('token')
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

const eventTitle = ref('未命名活动')
const pages = ref([{ id: 'page_1', name: '页面 1', components: [] }])
const currentPageId = ref('page_1')
const selectedId = ref(null)
const draggedType = ref(null)
const eventId = ref(null)
const saving = ref(false)
const publishing = ref(false)

// 奖励卡/惩罚卡列表
const rewardCards = ref([])
const punishCards = ref([])

// 撤销/重做栈
const historyStack = ref([])
const futureStack = ref([])
const isUndoRedo = ref(false)

// 自动保存定时器
let autoSaveTimer = null

const currentPage = computed(() => {
  return pages.value.find(p => p.id === currentPageId.value)
})

const currentPageComponents = computed({
  get: () => currentPage.value?.components || [],
  set: (val) => {
    const page = pages.value.find(p => p.id === currentPageId.value)
    if (page) page.components = val
  }
})

const selectedComponent = computed(() => {
  return currentPageComponents.value.find(c => c.id === selectedId.value)
})

// 记录历史
const recordHistory = () => {
  if (isUndoRedo.value) {
    isUndoRedo.value = false
    return
  }
  historyStack.value.push(JSON.parse(JSON.stringify(pages.value)))
  if (historyStack.value.length > 50) historyStack.value.shift()
  futureStack.value = []
}

// 撤销
const undo = () => {
  if (historyStack.value.length === 0) {
    ElMessage.info('没有可撤销的操作')
    return
  }
  futureStack.value.push(JSON.parse(JSON.stringify(pages.value)))
  pages.value = historyStack.value.pop()
  isUndoRedo.value = true
  ElMessage.success('已撤销')
}

// 重做
const redo = () => {
  if (futureStack.value.length === 0) {
    ElMessage.info('没有可重做的操作')
    return
  }
  historyStack.value.push(JSON.parse(JSON.stringify(pages.value)))
  pages.value = futureStack.value.pop()
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
  
  currentPageComponents.value.push(newComponent)
  draggedType.value = null
}

const getDefaultProps = (type) => {
  switch (type) {
    case 'text':
      return { content: '请输入文字', fontSize: 24, color: '#333333', textAlign: 'center' }
    case 'image':
      return { url: '', alt: '图片', width: 300, height: 200, objectFit: 'cover', jumpToPage: null }
    case 'button':
      return { 
        text: '按钮', 
        jumpToPage: null,
        color: '#409eff',
        size: 'default'
      }
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
    case 'marquee':
      return {
        content: '欢迎参加我们的活动！',
        speed: 5,
        direction: 'left',
        backgroundColor: '#fffbe6',
        color: '#fa8c16'
      }
    case 'quiz':
      return {
        question: '请输入问题',
        options: [
          { text: '选项 A', id: 0 },
          { text: '选项 B', id: 1 }
        ],
        correctAnswer: 0,
        rewardCardId: null,
        punishCardId: null
      }
    case 'essay':
      return {
        question: '请输入问题',
        placeholder: '在这里写下你的答案...',
        minLength: 0
      }
    case 'rewardCard':
      return {
        name: '奖励卡',
        content: '恭喜你获得奖励！',
        icon: '🎁'
      }
    case 'punishCard':
      return {
        name: '惩罚卡',
        content: '请接受惩罚~',
        icon: '😈'
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
  currentPageComponents.value = currentPageComponents.value.filter(c => c.id !== id)
  if (selectedId.value === id) selectedId.value = null
}

const moveUp = (id) => {
  recordHistory()
  const index = currentPageComponents.value.findIndex(c => c.id === id)
  if (index > 0) {
    [currentPageComponents.value[index - 1], currentPageComponents.value[index]] = 
    [currentPageComponents.value[index], currentPageComponents.value[index - 1]]
  }
}

const moveDown = (id) => {
  recordHistory()
  const index = currentPageComponents.value.findIndex(c => c.id === id)
  if (index < currentPageComponents.value.length - 1) {
    [currentPageComponents.value[index], currentPageComponents.value[index + 1]] = 
    [currentPageComponents.value[index + 1], currentPageComponents.value[index]]
  }
}

// 页面管理
const addPage = () => {
  recordHistory()
  const newPageId = `page_${Date.now()}`
  pages.value.push({
    id: newPageId,
    name: `页面 ${pages.value.length + 1}`,
    components: []
  })
  currentPageId.value = newPageId
  ElMessage.success('页面已添加')
}

const deletePage = (pageId) => {
  if (pages.value.length <= 1) {
    ElMessage.warning('至少保留一个页面')
    return
  }
  recordHistory()
  pages.value = pages.value.filter(p => p.id !== pageId)
  if (currentPageId.value === pageId) {
    currentPageId.value = pages.value[0].id
  }
  ElMessage.success('页面已删除')
}

const switchPage = (pageId) => {
  currentPageId.value = pageId
  selectedId.value = null
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

// 问答题选项操作
const addQuizOption = () => {
  if (selectedComponent.value && selectedComponent.value.type === 'quiz') {
    recordHistory()
    const newId = selectedComponent.value.props.options.length
    selectedComponent.value.props.options.push({ text: `选项 ${String.fromCharCode(65 + newId)}`, id: newId })
  }
}

const removeQuizOption = (index) => {
  if (selectedComponent.value && selectedComponent.value.type === 'quiz') {
    recordHistory()
    selectedComponent.value.props.options.splice(index, 1)
  }
}

// 收集所有奖励卡和惩罚卡
const collectCards = () => {
  rewardCards.value = components.value
    .filter(c => c.type === 'rewardCard')
    .map((c, idx) => ({ id: `card_${idx}`, name: c.props.name || '奖励卡' }))
  
  punishCards.value = components.value
    .filter(c => c.type === 'punishCard')
    .map((c, idx) => ({ id: `card_${idx}`, name: c.props.name || '惩罚卡' }))
}

// 保存功能 - 调用后端 API
const save = async () => {
  if (saving.value) return
  
  saving.value = true
  try {
    collectCards()
    
    // 多页面数据结构
    const pagesData = pages.value.map((page, pageIndex) => ({
      pageId: page.id,
      pageName: page.name,
      sortOrder: pageIndex,
      components: page.components.map((c, compIndex) => ({
        id: c.id,
        type: c.type,
        props: c.props,
        config: c.props,
        sortOrder: compIndex
      }))
    }))
    
    const eventData = {
      title: eventTitle.value,
      pages: pagesData
    }
    
    let response
    if (eventId.value) {
      // 更新现有活动
      response = await axios.put(`/events/${eventId.value}`, eventData)
    } else {
      // 创建新活动
      response = await axios.post('/events', {
        title: eventTitle.value
      })
      eventId.value = response.data.data.id
      
      // 保存页面和组件
      if (pagesData.length > 0) {
        await axios.put(`/events/${eventId.value}`, eventData)
      }
    }
    
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败：' + (error.response?.data?.message || error.message))
  } finally {
    saving.value = false
  }
}

// 自动保存
const startAutoSave = () => {
  autoSaveTimer = setInterval(() => {
    const hasComponents = pages.value.some(p => p.components && p.components.length > 0)
    if (hasComponents && eventId.value) {
      save()
    }
  }, 30000)
}

// 预览功能
const preview = () => {
  const previewWindow = window.open('', '_blank')
  
  let pagesHtml = pages.value.map((page, pageIndex) => `
    <div class="page" id="page_${page.id}" style="display: ${pageIndex === 0 ? 'block' : 'none'}">
      <h2 class="page-title">${page.name}</h2>
      ${page.components.map(c => renderPreview(c, page.id)).join('')}
    </div>
  `).join('')
  
  previewWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${eventTitle.value} - 预览</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
          .page { margin-bottom: 40px; }
          .page-title { text-align: center; color: #667eea; margin-bottom: 30px; }
          .component { margin-bottom: 20px; padding: 16px; border-radius: 8px; background: #fafafa; cursor: pointer; }
          .component:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .marquee-container { overflow: hidden; white-space: nowrap; }
          .marquee { display: inline-block; animation: scroll ${10 / 5}s linear infinite; }
          @keyframes scroll {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
          .quiz-option { padding: 12px; margin: 8px 0; border: 2px solid #e0e0e0; border-radius: 8px; cursor: pointer; }
          .quiz-option:hover { border-color: #409eff; }
          .card { padding: 20px; text-align: center; border-radius: 12px; cursor: pointer; }
          .reward-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
          .punish-card { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; }
          .button-component { display: inline-block; padding: 12px 24px; border-radius: 8px; cursor: pointer; }
        </style>
      </head>
      <body>
        <h1 style="text-align:center">${eventTitle.value}</h1>
        ${pagesHtml}
        <script>
          function navigateToPage(pageId) {
            const pages = document.querySelectorAll('.page');
            pages.forEach(p => p.style.display = 'none');
            const targetPage = document.getElementById('page_' + pageId);
            if (targetPage) targetPage.style.display = 'block';
          }
        <\/script>
      </body>
    </html>
  `)
  ElMessage.success('预览已打开')
}

const renderPreview = (component, pageId) => {
  const jumpHandler = component.props.jumpToPage ? `onclick="navigateToPage('${component.props.jumpToPage}')"` : ''
  
  switch (component.type) {
    case 'text':
      return `<div class="component" style="font-size:${component.props.fontSize}px;color:${component.props.color};text-align:${component.props.textAlign}">${component.props.content}</div>`
    case 'image':
      return `<div class="component" ${jumpHandler}><img src="${component.props.url || 'https://via.placeholder.com/300x200'}" style="max-width:100%" /></div>`
    case 'button':
      return `<div class="component button-component" ${jumpHandler} style="background:${component.props.color};color:white;padding:12px 24px;border-radius:8px;display:inline-block;">
        ${component.props.text}
      </div>`
    case 'timeline':
      return `<div class="component"><h3>时间线</h3>${component.props.items.map(i => `<p>${i.time} - ${i.title}</p>`).join('')}</div>`
    case 'countdown':
      return `<div class="component"><h3>${component.props.title}</h3><p>${new Date(component.props.targetDate).toLocaleString()}</p></div>`
    case 'marquee':
      return `<div class="component" style="background:${component.props.backgroundColor};color:${component.props.color};padding:12px;">
        <div class="marquee-container">
          <div class="marquee">${component.props.content}</div>
        </div>
      </div>`
    case 'quiz':
      return `<div class="component">
        <h4>${component.props.question}</h4>
        ${component.props.options.map((opt, i) => 
          `<div class="quiz-option ${i === component.props.correctAnswer ? 'correct' : ''}">${String.fromCharCode(65+i)}. ${opt.text}</div>`
        ).join('')}
      </div>`
    case 'essay':
      return `<div class="component">
        <h4>${component.props.question}</h4>
        <textarea placeholder="${component.props.placeholder}" style="width:100%;min-height:100px;padding:8px;"></textarea>
      </div>`
    case 'rewardCard':
      return `<div class="component card reward-card">
        <div style="font-size:48px">${component.props.icon}</div>
        <h3>${component.props.name}</h3>
        <p>${component.props.content}</p>
      </div>`
    case 'punishCard':
      return `<div class="component card punish-card">
        <div style="font-size:48px">${component.props.icon}</div>
        <h3>${component.props.name}</h3>
        <p>${component.props.content}</p>
      </div>`
    default:
      return `<div class="component">[${component.type}]</div>`
  }
}

// 发布功能 - 调用后端 API
const publish = async () => {
  if (publishing.value) return
  if (components.value.length === 0) {
    ElMessage.warning('请先添加组件')
    return
  }
  
  publishing.value = true
  try {
    // 先保存
    if (!eventId.value) {
      await save()
    }
    
    // 调用发布 API
    await axios.post(`/events/${eventId.value}/publish`)
    
    ElMessage.success('发布成功')
  } catch (error) {
    console.error('发布失败:', error)
    ElMessage.error('发布失败：' + (error.response?.data?.message || error.message))
  } finally {
    publishing.value = false
  }
}

// 生命周期
onMounted(async () => {
  window.addEventListener('keydown', handleKeydown)
  startAutoSave()
  
  // 从路由获取事件 ID
  const params = new URLSearchParams(window.location.search)
  eventId.value = params.get('id')
  if (eventId.value) {
    await loadEvent(eventId.value)
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (autoSaveTimer) clearInterval(autoSaveTimer)
})

const loadEvent = async (id) => {
  try {
    const res = await axios.get(`/events/${id}`)
    const data = res.data.data
    eventTitle.value = data.title
    eventId.value = data.id
    
    // 多页面数据加载
    if (data.pages && data.pages.length > 0) {
      pages.value = data.pages.map(p => ({
        id: p.pageId || `page_${Date.now()}_${Math.random()}`,
        name: p.pageName || '未命名页面',
        components: (p.components || []).map(c => ({
          id: c.id || `comp_${Date.now()}_${Math.random()}`,
          type: c.componentType,
          props: c.config || {},
          style: {}
        }))
      }))
      currentPageId.value = pages.value[0].id
    } else if (data.components && data.components.length > 0) {
      // 兼容旧数据（单页面）
      pages.value = [{
        id: 'page_1',
        name: '页面 1',
        components: data.components.map(c => ({
          id: c.id || `comp_${Date.now()}_${Math.random()}`,
          type: c.componentType,
          props: c.config || {},
          style: {}
        }))
      }]
      currentPageId.value = 'page_1'
    }
    
    ElMessage.success('加载成功')
  } catch (error) {
    console.error('加载失败:', error)
    ElMessage.error('加载失败：' + (error.response?.data?.message || error.message))
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
      <div v-else-if="component.type === 'marquee'" class="marquee-preview" :style="{ background: component.props.backgroundColor, color: component.props.color, padding: '12px', overflow: 'hidden' }">
        <div class="marquee-text">{{ component.props.content }}</div>
      </div>
      <div v-else-if="component.type === 'quiz'" class="quiz-preview">
        <div class="quiz-question">{{ component.props.question }}</div>
        <div v-for="(opt, idx) in component.props.options" :key="idx" class="quiz-option-preview">
          {{ String.fromCharCode(65+idx) }}. {{ opt.text }}
        </div>
      </div>
      <div v-else-if="component.type === 'essay'" class="essay-preview">
        <div class="essay-question">{{ component.props.question }}</div>
        <div class="essay-textarea">{{ component.props.placeholder }}</div>
      </div>
      <div v-else-if="component.type === 'rewardCard'" class="card-preview reward">
        <div class="card-icon">{{ component.props.icon }}</div>
        <div class="card-name">{{ component.props.name }}</div>
        <div class="card-content">{{ component.props.content }}</div>
      </div>
      <div v-else-if="component.type === 'punishCard'" class="card-preview punish">
        <div class="card-icon">{{ component.props.icon }}</div>
        <div class="card-name">{{ component.props.name }}</div>
        <div class="card-content">{{ component.props.content }}</div>
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

.left-panel {
  width: 220px;
  background: #fafafa;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.pages-section {
  border-bottom: 1px solid #e0e0e0;
  max-height: 40%;
  overflow-y: auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
}

.section-header h3 {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.page-list {
  padding: 0 12px 12px;
}

.page-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.page-item:hover {
  border-color: #409eff;
  background: #ecf5ff;
}

.page-item.active {
  border-color: #409eff;
  background: #409eff;
  color: white;
}

.page-item .page-name {
  flex: 1;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.delete-page-btn {
  padding: 2px 6px;
  font-size: 16px;
  line-height: 1;
  opacity: 0;
  transition: opacity 0.2s;
}

.page-item:hover .delete-page-btn {
  opacity: 1;
}

.page-item.active .delete-page-btn {
  color: white;
}

.page-item.active .delete-page-btn:hover {
  background: rgba(255,255,255,0.3);
}

.components-section {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
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
  display: flex;
  flex-direction: column;
}

.page-indicator {
  text-align: center;
  padding: 8px;
  background: #409eff;
  color: white;
  border-radius: 4px;
  margin-bottom: 16px;
  font-size: 14px;
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

.timeline-items, .quiz-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.timeline-item, .quiz-option {
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

/* 滚动文字预览 */
.marquee-preview {
  overflow: hidden;
  white-space: nowrap;
}

.marquee-text {
  display: inline-block;
  animation: marquee-scroll 10s linear infinite;
}

@keyframes marquee-scroll {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}

/* 问答题预览 */
.quiz-preview {
  padding: 8px;
}

.quiz-question {
  font-weight: bold;
  margin-bottom: 12px;
}

.quiz-option-preview {
  padding: 8px;
  margin: 4px 0;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

/* 简答题预览 */
.essay-preview {
  padding: 8px;
}

.essay-question {
  font-weight: bold;
  margin-bottom: 8px;
}

.essay-textarea {
  padding: 8px;
  border: 1px dashed #e0e0e0;
  border-radius: 4px;
  color: #999;
  min-height: 60px;
}

/* 卡片预览 */
.card-preview {
  padding: 20px;
  text-align: center;
  border-radius: 12px;
}

.card-preview.reward {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.card-preview.punish {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.card-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.card-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
}

.card-content {
  font-size: 14px;
  opacity: 0.9;
}
</style>
