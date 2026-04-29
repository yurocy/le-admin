<template>
  <div class="page-container">
    <div class="table-actions">
      <el-button type="primary" @click="handleAdd">添加描述包</el-button>
      <el-button type="success" @click="imageDrawerVisible = true; fetchImages()">图片库管理</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="描述包名称" min-width="200" />
      <el-table-column label="标题数" width="100" align="center">
        <template #default="{ row }">
          <el-tag>{{ row.title_count || 0 }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="条目数" width="100" align="center">
        <template #default="{ row }">
          {{ row.option_count || 0 }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleManage(row)">管理</el-button>
          <el-button type="primary" link @click="handleRename(row)">重命名</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrap">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchData"
        @current-change="fetchData"
      />
    </div>

    <!-- 重命名对话框 -->
    <el-dialog v-model="renameVisible" title="重命名描述包" width="400px" destroy-on-close>
      <el-form label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="renameName" placeholder="描述包名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="renameVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitRename">确定</el-button>
      </template>
    </el-dialog>

    <!-- 3层树形管理对话框 -->
    <el-dialog
      v-model="manageVisible"
      :title="`管理描述包 - ${currentDesc.name}`"
      width="85%"
      top="3vh"
      destroy-on-close
      class="desc-manage-dialog"
    >
      <div class="manage-header">
        <el-alert
          :title="`共 ${currentDesc.titles?.length || 0} 个标题，${totalOptions(currentDesc)} 个条目`"
          type="info"
          :closable="false"
          show-icon
        />
      </div>

      <div class="desc-titles">
        <el-collapse v-model="expandedTitles" accordion>
          <el-collapse-item
            v-for="(title, tIdx) in currentDesc.titles"
            :key="title.id || tIdx"
            :name="tIdx"
          >
            <template #title>
              <div class="collapse-title-header">
                <span class="title-badge">{{ title.type === 1 ? '单选' : '多选' }}</span>
                <span class="title-name">{{ title.title || '未命名标题' }}</span>
                <span class="title-meta">排序: {{ title.sort }} | {{ title.options?.length || 0 }} 个条目</span>
                <el-button type="primary" link size="small" @click.stop="editTitleTitle(tIdx)">编辑</el-button>
              </div>
            </template>

            <div class="options-area">
              <!-- 条目表格 -->
              <el-table :data="title.options || []" size="small" border>
                <el-table-column label="条目文本" min-width="150">
                  <template #default="{ row }">
                    <el-input v-if="row._editing" v-model="row.text" size="small" />
                    <span v-else>{{ row.text }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="说明" min-width="120">
                  <template #default="{ row }">
                    <el-input v-if="row._editing" v-model="row.info" size="small" />
                    <span v-else>{{ row.info || '-' }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="图片" width="120" align="center">
                  <template #default="{ row }">
                    <el-image
                      v-if="getOptImage(row.image_id)"
                      :src="getOptImage(row.image_id).image"
                      style="width: 40px; height: 40px"
                      fit="cover"
                      :preview-src-list="[getOptImage(row.image_id).image]"
                    />
                    <el-select
                      v-if="row._editing"
                      v-model="row.image_id"
                      placeholder="选图片"
                      size="small"
                      clearable
                      style="width: 100%"
                    >
                      <el-option
                        v-for="img in imageList"
                        :key="img.id"
                        :label="img.name"
                        :value="img.id"
                      />
                    </el-select>
                    <span v-else-if="getOptImage(row.image_id)">{{ getOptImage(row.image_id).name }}</span>
                    <span v-else>-</span>
                  </template>
                </el-table-column>
                <el-table-column label="排序" width="80" align="center">
                  <template #default="{ row }">
                    <el-input-number v-if="row._editing" v-model="row.sort" :min="0" size="small" controls-position="right" style="width: 70px" />
                    <span v-else>{{ row.sort }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="扣费%" width="80" align="center">
                  <template #default="{ row }">
                    <el-input-number v-if="row._editing" v-model="row.ratio" :min="0" :max="100" size="small" controls-position="right" style="width: 70px" />
                    <span v-else>{{ row.ratio }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120" align="center">
                  <template #default="{ row, $index }">
                    <template v-if="row._editing">
                      <el-button type="success" link size="small" @click="saveOption(tIdx, $index)">保存</el-button>
                      <el-button type="info" link size="small" @click="cancelEditOption(row)">取消</el-button>
                    </template>
                    <template v-else>
                      <el-button type="primary" link size="small" @click="editOption(tIdx, $index)">编辑</el-button>
                      <el-button type="danger" link size="small" @click="deleteOption(tIdx, $index)">删除</el-button>
                    </template>
                  </template>
                </el-table-column>
              </el-table>
              <div class="add-option-bar">
                <el-button size="small" type="primary" plain @click="addOption(tIdx)">+ 添加条目</el-button>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>

        <el-button
          v-if="!currentDesc.titles?.length"
          type="info"
          plain
          style="width: 100%; margin-top: 12px"
          @click="addTitle"
        >
          暂无标题，点击添加
        </el-button>
      </div>

      <div class="manage-footer">
        <el-button type="primary" plain @click="addTitle">+ 添加标题</el-button>
        <div style="flex: 1" />
        <el-button type="primary" :loading="submitLoading" @click="saveAll">保存全部</el-button>
        <el-button @click="manageVisible = false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 编辑标题对话框 -->
    <el-dialog v-model="titleEditVisible" title="编辑标题" width="450px" destroy-on-close append-to-body>
      <el-form label-width="80px">
        <el-form-item label="标题名称">
          <el-input v-model="titleEditForm.title" placeholder="如：外观、功能、屏幕等" />
        </el-form-item>
        <el-form-item label="选择方式">
          <el-radio-group v-model="titleEditForm.type">
            <el-radio :value="1">单选</el-radio>
            <el-radio :value="2">多选</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="titleEditForm.sort" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="titleEditVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmEditTitle">确定</el-button>
      </template>
    </el-dialog>

    <!-- 图片库抽屉 -->
    <el-drawer v-model="imageDrawerVisible" title="描述图片库" size="500px" destroy-on-close>
      <div class="image-actions">
        <el-button type="primary" size="small" @click="showAddImage = true">添加图片</el-button>
      </div>
      <el-table :data="imageList" size="small" border>
        <el-table-column label="图片" width="80">
          <template #default="{ row }">
            <el-image
              v-if="row.image"
              :src="row.image"
              style="width: 50px; height: 50px"
              fit="cover"
              :preview-src-list="[row.image]"
            />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" min-width="120" />
        <el-table-column prop="textinfo" label="说明" min-width="100" show-overflow-tooltip />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="editImage(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDeleteImage(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 添加/编辑图片表单 -->
      <el-dialog v-model="showAddImage" :title="editingImage.id ? '编辑图片' : '添加图片'" width="400px" append-to-body destroy-on-close>
        <el-form label-width="80px">
          <el-form-item label="名称">
            <el-input v-model="editingImage.name" placeholder="图片名称" />
          </el-form-item>
          <el-form-item label="图片">
            <el-upload
              class="desc-image-uploader"
              action="/api/uploadFile"
              name="file"
              :show-file-list="false"
              :on-success="onImageUploadSuccess"
              accept="image/*"
            >
              <el-image
                v-if="editingImage.image"
                :src="editingImage.image"
                style="width: 100px; height: 100px"
                fit="cover"
              />
              <el-icon v-else class="desc-upload-icon"><Plus /></el-icon>
            </el-upload>
          </el-form-item>
          <el-form-item label="说明">
            <el-input v-model="editingImage.textinfo" placeholder="图片说明" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showAddImage = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="saveImage">确定</el-button>
        </template>
      </el-dialog>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { productApi } from '@/api/business'

interface DescOptionItem {
  id: number
  text: string
  info: string
  sort: number
  ratio: number
  image_id: number | null
  title_id: number
  _editing?: boolean
  _backup?: any
}

interface DescTitleItem {
  id: number
  type: number
  title: string
  sort: number
  desc_id: number
  options: DescOptionItem[]
}

interface DescPackage {
  id: number
  name: string
  title_count?: number
  option_count?: number
  titles?: DescTitleItem[]
}

// State
const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref<DescPackage[]>([])
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
const imageList = ref<any[]>([])

// Rename
const renameVisible = ref(false)
const renameName = ref('')
const renameId = ref(0)

// Manage
const manageVisible = ref(false)
const currentDesc = reactive<DescPackage>({ id: 0, name: '', titles: [] })
const expandedTitles = ref<number[]>([])

// Title edit
const titleEditVisible = ref(false)
const titleEditIdx = ref(-1)
const titleEditForm = reactive({ title: '', type: 1, sort: 0 })

// Image drawer
const imageDrawerVisible = ref(false)
const showAddImage = ref(false)
const editingImage = reactive({ id: 0, name: '', image: '', textinfo: '' })

function totalOptions(desc: DescPackage): number {
  return (desc.option_count || 0) || (desc.titles || []).reduce((sum, t) => sum + (t.options?.length || 0), 0)
}

function getOptImage(imageId: number | null | undefined) {
  if (!imageId) return null
  return imageList.value.find((img: any) => img.id === imageId)
}

// ==================== Desc Package CRUD ====================

async function fetchData() {
  loading.value = true
  try {
    const res: any = await productApi.listDesc({ page: pagination.page, page_size: pagination.pageSize })
    tableData.value = res.data?.list || res.data || res || []
    pagination.total = res.data?.total || 0
  } catch {
    ElMessage.error('获取描述包列表失败')
  } finally {
    loading.value = false
  }
}

function handleAdd() {
  ElMessageBox.prompt('请输入描述包名称', '添加描述包', { confirmButtonText: '确定', cancelButtonText: '取消' })
    .then(async ({ value }) => {
      if (!value) return
      submitLoading.value = true
      try {
        await productApi.createDesc({ name: value, titles: [] })
        ElMessage.success('创建成功')
        fetchData()
      } catch { ElMessage.error('操作失败') }
      finally { submitLoading.value = false }
    }).catch(() => {})
}

function handleRename(row: DescPackage) {
  renameId.value = row.id
  renameName.value = row.name
  renameVisible.value = true
}

async function submitRename() {
  submitLoading.value = true
  try {
    await productApi.updateDesc(renameId.value, { name: renameName.value })
    ElMessage.success('重命名成功')
    renameVisible.value = false
    fetchData()
  } catch { ElMessage.error('操作失败') }
  finally { submitLoading.value = false }
}

async function handleDelete(row: DescPackage) {
  try {
    await ElMessageBox.confirm(
      `确定删除描述包「${row.name}」吗？包含 ${row.title_count || 0} 个标题、${row.option_count || 0} 个条目，将全部删除。`,
      '删除确认', { type: 'warning' }
    )
    await productApi.deleteDesc(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch { /* cancelled */ }
}

// ==================== 3层管理 ====================

async function handleManage(row: DescPackage) {
  currentDesc.id = row.id
  currentDesc.name = row.name
  // 管理时再加载完整3层数据
  try {
    const res: any = await productApi.getDesc(row.id)
    const data = res.data || res
    currentDesc.titles = data.titles || []
  } catch {
    currentDesc.titles = []
  }
  manageVisible.value = true
  expandedTitles.value = []
  await fetchImages()
}

function addTitle() {
  currentDesc.titles.push({
    id: 0,
    type: 1,
    title: '新标题',
    sort: (currentDesc.titles.length + 1) * 100,
    desc_id: currentDesc.id,
    options: [],
  })
  expandedTitles.value = [currentDesc.titles.length - 1]
}

function editTitleTitle(tIdx: number) {
  const t = currentDesc.titles[tIdx]
  titleEditIdx.value = tIdx
  titleEditForm.title = t.title
  titleEditForm.type = t.type
  titleEditForm.sort = t.sort
  titleEditVisible.value = true
}

function confirmEditTitle() {
  const t = currentDesc.titles[titleEditIdx.value]
  t.title = titleEditForm.title
  t.type = titleEditForm.type
  t.sort = titleEditForm.sort
  titleEditVisible.value = false
}

// ==================== Option CRUD ====================

function addOption(tIdx: number) {
  currentDesc.titles[tIdx].options.push({
    id: 0,
    text: '',
    info: '',
    sort: (currentDesc.titles[tIdx].options.length + 1) * 100,
    ratio: 0,
    image_id: null,
    title_id: currentDesc.titles[tIdx].id,
    _editing: true,
  })
}

function editOption(tIdx: number, oIdx: number) {
  const opt = currentDesc.titles[tIdx].options[oIdx]
  opt._backup = { ...opt, _backup: undefined }
  opt._editing = true
}

function saveOption(tIdx: number, oIdx: number) {
  const opt = currentDesc.titles[tIdx].options[oIdx]
  opt._editing = false
  delete opt._backup
}

function cancelEditOption(opt: DescOptionItem) {
  if (opt._backup) {
    Object.assign(opt, opt._backup)
    delete opt._backup
  }
  opt._editing = false
}

function deleteOption(tIdx: number, oIdx: number) {
  currentDesc.titles[tIdx].options.splice(oIdx, 1)
}

// ==================== Save All ====================

async function saveAll() {
  submitLoading.value = true
  try {
    const payload = {
      name: currentDesc.name,
      titles: currentDesc.titles.map((t) => ({
        id: t.id,
        type: t.type,
        title: t.title,
        sort: t.sort,
        options: t.options.map((o) => ({
          id: o.id,
          text: o.text,
          info: o.info,
          sort: o.sort,
          ratio: o.ratio,
          image_id: o.image_id,
        })),
      })),
    }
    await productApi.updateDesc(currentDesc.id, payload)
    ElMessage.success('保存成功')
    manageVisible.value = false
    fetchData()
  } catch { ElMessage.error('保存失败') }
  finally { submitLoading.value = false }
}

// ==================== Image CRUD ====================

async function fetchImages() {
  try {
    const res: any = await productApi.listDescImage()
    imageList.value = res.data || res || []
  } catch { /* ignore */ }
}

function editImage(row: any) {
  editingImage.id = row.id
  editingImage.name = row.name
  editingImage.image = row.image
  editingImage.textinfo = row.textinfo
  showAddImage.value = true
}

function onImageUploadSuccess(res: any) {
  if (res.code === 0 && res.data?.url) {
    editingImage.image = res.data.url
    ElMessage.success('上传成功')
  } else {
    ElMessage.error(res.message || '上传失败')
  }
}

async function saveImage() {
  submitLoading.value = true
  try {
    if (editingImage.id) {
      await productApi.updateDescImage(editingImage.id, { ...editingImage })
      ElMessage.success('更新成功')
    } else {
      await productApi.createDescImage({ ...editingImage })
      ElMessage.success('添加成功')
    }
    showAddImage.value = false
    editingImage.id = 0
    editingImage.name = ''
    editingImage.image = ''
    editingImage.textinfo = ''
    fetchImages()
  } catch { ElMessage.error('操作失败') }
  finally { submitLoading.value = false }
}

async function handleDeleteImage(row: any) {
  try {
    await ElMessageBox.confirm(`确定删除图片「${row.name}」吗？`, '提示', { type: 'warning' })
    await productApi.deleteDescImage(row.id)
    ElMessage.success('删除成功')
    fetchImages()
  } catch { /* cancelled */ }
}

onMounted(() => { fetchData() })
</script>

<style lang="scss" scoped>
.desc-manage-dialog {
  :deep(.el-dialog__body) {
    padding: 12px 20px;
    max-height: 75vh;
    overflow-y: auto;
  }
}

.manage-header {
  margin-bottom: 16px;
}

.desc-titles {
  .collapse-title-header {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
  }
  .title-badge {
    display: inline-block;
    padding: 0 6px;
    height: 20px;
    line-height: 20px;
    font-size: 12px;
    border-radius: 4px;
    background: #409eff;
    color: #fff;
    flex-shrink: 0;
  }
  .title-name {
    font-weight: bold;
    font-size: 14px;
  }
  .title-meta {
    font-size: 12px;
    color: #909399;
  }
}

.options-area {
  padding: 0 20px 8px;
}

.add-option-bar {
  padding: 8px 0;
  text-align: center;
}

.manage-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0 0;
  border-top: 1px solid #ebeef5;
  margin-top: 16px;
}

.image-actions {
  margin-bottom: 12px;
}

.desc-image-uploader {
  :deep(.el-upload) {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    overflow: hidden;
    width: 100px;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.2s;
    &:hover {
      border-color: #409eff;
    }
  }
  .desc-upload-icon {
    font-size: 28px;
    color: #8c939d;
  }
}
</style>
