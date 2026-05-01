<template>
  <div class="page-container">
    <div class="search-bar">
      <el-input v-model="searchForm.keyword" placeholder="关键词" clearable style="width: 180px" />
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="username" label="用户名" min-width="120" />
      <el-table-column prop="usertel" label="手机号" width="130" />
      <el-table-column prop="idcard" label="身份证" width="180" show-overflow-tooltip />
      <el-table-column prop="banknum" label="银行卡号" width="180" show-overflow-tooltip />
      <el-table-column prop="bankuser" label="持卡人" width="120" />
      <el-table-column prop="bank_name" label="开户银行" width="120" />
      <el-table-column prop="city_name" label="城市" width="100" />
      <el-table-column prop="pay_meth" label="支付方式" width="100" />
      <el-table-column prop="address" label="地址" min-width="180" show-overflow-tooltip />
      <el-table-column prop="regtime" label="注册时间" width="170" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
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

    <el-dialog v-model="dialogVisible" title="编辑会员" width="500px" destroy-on-close>
      <el-form ref="formRef" :model="form" label-width="80px">
        <el-form-item label="手机号">
          <el-input v-model="form.usertel" placeholder="手机号码" />
        </el-form-item>
        <el-form-item label="身份证">
          <el-input v-model="form.idcard" placeholder="身份证号" />
        </el-form-item>
        <el-form-item label="银行卡号">
          <el-input v-model="form.banknum" placeholder="银行卡号" />
        </el-form-item>
        <el-form-item label="持卡人">
          <el-input v-model="form.bankuser" placeholder="持卡人姓名" />
        </el-form-item>
        <el-form-item label="开户银行">
          <el-input v-model="form.bank_name" placeholder="开户银行" />
        </el-form-item>
        <el-form-item label="城市">
          <el-input v-model="form.city_name" placeholder="城市" />
        </el-form-item>
        <el-form-item label="支付方式">
          <el-input v-model="form.pay_meth" placeholder="支付方式" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="form.address" placeholder="详细地址" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { webApi } from '@/api/business'

const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref<any[]>([])
const dialogVisible = ref(false)
const editId = ref<number>(0)
const formRef = ref<FormInstance>()

const searchForm = reactive({ keyword: '' })
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
const form = reactive({ usertel: '', idcard: '', banknum: '', bankuser: '', city_name: '', bank_name: '', pay_meth: '', address: '' })

async function fetchData() {
  loading.value = true
  try {
    const params: any = { page: pagination.page, pageSize: pagination.pageSize }
    if (searchForm.keyword) params.keyword = searchForm.keyword
    const res: any = await webApi.listMember(params)
    tableData.value = res.data?.list || res.data || res || []
    pagination.total = res.data?.total || 0
  } catch { ElMessage.error('获取会员列表失败') } finally { loading.value = false }
}

function handleSearch() { pagination.page = 1; fetchData() }
function handleReset() { searchForm.keyword = ''; pagination.page = 1; fetchData() }

function handleEdit(row: any) { editId.value = row.id; Object.assign(form, { usertel: row.usertel, idcard: row.idcard, banknum: row.banknum, bankuser: row.bankuser, city_name: row.city_name, bank_name: row.bank_name, pay_meth: row.pay_meth, address: row.address }); dialogVisible.value = true }

async function handleSubmit() {
  submitLoading.value = true
  try { await webApi.updateMember(editId.value, { ...form }); ElMessage.success('更新成功'); dialogVisible.value = false; fetchData() }
  catch { ElMessage.error('操作失败') } finally { submitLoading.value = false }
}

async function handleDelete(row: any) {
  try { await ElMessageBox.confirm('确定删除该会员吗？', '提示', { type: 'warning' }); await webApi.deleteMember(row.id); ElMessage.success('删除成功'); fetchData() } catch { /* cancelled */ }
}

onMounted(() => { fetchData() })
</script>
