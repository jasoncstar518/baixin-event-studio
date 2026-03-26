<template>
  <div class="editor">
    <!-- 顶部工具栏 -->
    <header class="toolbar">
      <div class="left">
        <el-button @click="$router.push('/dashboard')">← 返回</el-button>
        <h2>{{ eventTitle }}</h2>
      </div>
      <div class="right">
        <el-button @click="preview">预览</el-button>
        <el-button type="primary" @click="save">保存</el-button>
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
          <el-form-item label="内容" v-if="selectedComponent.type === 'text'">
            <el-input v-model="selectedComponent.props.content" type="textarea" />
          </el-form-item>
          <el-form-item label="字体大小" v-if="selectedComponent.type === 'text'">
            <el-input-number v-model="selectedComponent.props.fontSize" :min="12" :max="72" />
          </el-form-item>
          <el-form-item label="颜色" v-if="selectedComponent.type === 'text'">
            <el-color-picker v-model="selectedComponent.props.color" />
          </el-form-item>
        </el-form>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import draggable from 'vuedraggable'

const eventTitle = ref('未命名活动')
const components = ref([])
const selectedId = ref(null)
const draggedType = ref(null)

const selectedComponent = computed(() => {
  return components.value.find(c => c.id === selectedId.value)
})

const dragComponent = (type) => {
  draggedType.value = type
}

const dropComponent = (event) => {
  if (!draggedType.value) return
  
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
      return { url: '', alt: '图片' }
    case 'timeline':
      return { items: [] }
    case 'countdown':
      return { targetDate: new Date().toISOString() }
    default:
      return {}
  }
}

const selectComponent = (component) => {
  selectedId.value = component.id
}

const removeComponent = (id) => {
  components.value = components.value.filter(c => c.id !== id)
  if (selectedId.value === id) selectedId.value = null
}

const moveUp = (id) => {
  const index = components.value.findIndex(c => c.id === id)
  if (index > 0) {
    [components.value[index - 1], components.value[index]] = 
    [components.value[index], components.value[index - 1]]
  }
}

const moveDown = (id) => {
  const index = components.value.findIndex(c => c.id === id)
  if (index < components.value.length - 1) {
    [components.value[index], components.value[index + 1]] = 
    [components.value[index + 1], components.value[index]]
  }
}

const save = () => {
  // TODO: 调用保存 API
  ElMessage.success('保存成功')
}

const preview = () => {
  // TODO: 打开预览窗口
  ElMessage.info('预览功能开发中')
}

const publish = () => {
  // TODO: 调用发布 API
  ElMessage.success('发布成功')
}

// 组件预览子组件
const ComponentPreview = {
  props: ['component'],
  template: `
    <div class="preview">
      <div v-if="component.type === 'text'" :style="{ fontSize: component.props.fontSize + 'px', color: component.props.color, textAlign: component.props.textAlign }">
        {{ component.props.content }}
      </div>
      <div v-else-if="component.type === 'image'">
        <img :src="component.props.url" :alt="component.props.alt" style="max-width: 100%" />
      </div>
      <div v-else>[{{ component.type }} 组件]</div>
    </div>
  `
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
  width: 280px;
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
</style>
