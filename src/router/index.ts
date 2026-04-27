import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
import Layout from '@/layout/index.vue'

NProgress.configure({ showSpinner: false })

// Public routes
const loginRoute: RouteRecordRaw = {
  path: '/login',
  name: 'Login',
  component: () => import('@/views/login/index.vue'),
  meta: { title: '登录', hidden: true },
}

// Main layout with children
const layoutRoute: RouteRecordRaw = {
  path: '/',
  component: Layout,
  redirect: '/dashboard',
  children: [
    {
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index.vue'),
      meta: { title: '仪表盘', icon: 'Odometer', affix: true },
    },
  ],
}

// Static routes (system management)
const systemRoutes: RouteRecordRaw = {
  path: '/system',
  component: Layout,
  redirect: '/system/user',
  meta: { title: '系统管理', icon: 'Setting' },
  children: [
    {
      path: 'user',
      name: 'SystemUser',
      component: () => import('@/views/system/user/index.vue'),
      meta: { title: '管理员管理', icon: 'User' },
    },
    {
      path: 'role',
      name: 'SystemRole',
      component: () => import('@/views/system/role/index.vue'),
      meta: { title: '角色管理', icon: 'UserFilled' },
    },
    {
      path: 'menu',
      name: 'SystemMenu',
      component: () => import('@/views/system/menu/index.vue'),
      meta: { title: '菜单管理', icon: 'Menu' },
    },
    {
      path: 'log',
      name: 'SystemLog',
      component: () => import('@/views/system/log/index.vue'),
      meta: { title: '操作日志', icon: 'Document' },
    },
  ],
}

// Business routes
const productRoutes: RouteRecordRaw = {
  path: '/product',
  component: Layout,
  redirect: '/product/category',
  meta: { title: '产品管理', icon: 'Goods' },
  children: [
    { path: 'category', name: 'ProductCategory', component: () => import('@/views/product/category/index.vue'), meta: { title: '分类管理', icon: 'Files' } },
    { path: 'brand', name: 'ProductBrand', component: () => import('@/views/product/brand/index.vue'), meta: { title: '品牌管理', icon: 'PriceTag' } },
    { path: 'list', name: 'ProductList', component: () => import('@/views/product/product/index.vue'), meta: { title: '产品列表', icon: 'List' } },
    { path: 'order', name: 'ProductOrder', component: () => import('@/views/product/order/index.vue'), meta: { title: '订单管理', icon: 'ShoppingCart' } },
    { path: 'desc', name: 'ProductDesc', component: () => import('@/views/product/desc/index.vue'), meta: { title: '描述包管理', icon: 'DocumentCopy' } },
    { path: 'coupon', name: 'ProductCoupon', component: () => import('@/views/product/coupon/index.vue'), meta: { title: '优惠券管理', icon: 'Ticket' } },
  ],
}

const stockRoutes: RouteRecordRaw = {
  path: '/stock',
  component: Layout,
  redirect: '/stock/goods',
  meta: { title: '库存管理', icon: 'Box' },
  children: [
    { path: 'goods', name: 'StockGoods', component: () => import('@/views/stock/index.vue'), meta: { title: '库存商品', icon: 'Goods' } },
    { path: 'statistics', name: 'StockStatistics', component: () => import('@/views/stock/statistics.vue'), meta: { title: '库存统计', icon: 'DataAnalysis' } },
  ],
}

const saleRoutes: RouteRecordRaw = {
  path: '/sale',
  component: Layout,
  redirect: '/sale/level',
  meta: { title: '分销管理', icon: 'Sell' },
  children: [
    { path: 'level', name: 'SaleLevel', component: () => import('@/views/sale/level.vue'), meta: { title: '等级管理', icon: 'Medal' } },
    { path: 'goods', name: 'SaleGoods', component: () => import('@/views/sale/goods.vue'), meta: { title: '分销商品', icon: 'Goods' } },
    { path: 'user', name: 'SaleUser', component: () => import('@/views/sale/user.vue'), meta: { title: '分销商管理', icon: 'Avatar' } },
    { path: 'order', name: 'SaleOrder', component: () => import('@/views/sale/order.vue'), meta: { title: '分销订单', icon: 'ShoppingCart' } },
  ],
}

const partnerRoutes: RouteRecordRaw = {
  path: '/partner',
  component: Layout,
  redirect: '/partner/agent',
  meta: { title: '合作商管理', icon: 'Connection' },
  children: [
    { path: 'agent', name: 'PartnerAgent', component: () => import('@/views/partner/agent.vue'), meta: { title: '代理商管理', icon: 'OfficeBuilding' } },
    { path: 'list', name: 'PartnerList', component: () => import('@/views/partner/list.vue'), meta: { title: '商家管理', icon: 'Shop' } },
    { path: 'store', name: 'PartnerStore', component: () => import('@/views/partner/store.vue'), meta: { title: '门店管理', icon: 'House' } },
    { path: 'joinin', name: 'PartnerJoinIn', component: () => import('@/views/partner/joinin.vue'), meta: { title: '入驻申请', icon: 'Promotion' } },
    { path: 'subweb', name: 'PartnerSubWeb', component: () => import('@/views/partner/subweb.vue'), meta: { title: '子网站管理', icon: 'Monitor' } },
  ],
}

const pricingRoutes: RouteRecordRaw = {
  path: '/pricing',
  component: Layout,
  redirect: '/pricing/category',
  meta: { title: '报价管理', icon: 'Money' },
  children: [
    { path: 'category', name: 'PricingCategory', component: () => import('@/views/pricing/category.vue'), meta: { title: '报价分类', icon: 'Files' } },
    { path: 'brand', name: 'PricingBrand', component: () => import('@/views/pricing/brand.vue'), meta: { title: '报价品牌', icon: 'PriceTag' } },
    { path: 'user', name: 'PricingUser', component: () => import('@/views/pricing/user.vue'), meta: { title: '报价员管理', icon: 'User' } },
    { path: 'list', name: 'PricingList', component: () => import('@/views/pricing/list.vue'), meta: { title: '报价列表', icon: 'List' } },
  ],
}

const biddingRoutes: RouteRecordRaw = {
  path: '/bidding',
  component: Layout,
  redirect: '/bidding/category',
  meta: { title: '竞拍管理', icon: 'Trophy' },
  children: [
    { path: 'category', name: 'BiddingCategory', component: () => import('@/views/bidding/category.vue'), meta: { title: '竞拍分类', icon: 'Files' } },
    { path: 'product', name: 'BiddingProduct', component: () => import('@/views/bidding/product.vue'), meta: { title: '竞拍商品', icon: 'Goods' } },
    { path: 'order', name: 'BiddingOrder', component: () => import('@/views/bidding/order.vue'), meta: { title: '竞拍订单', icon: 'ShoppingCart' } },
  ],
}

const articleRoutes: RouteRecordRaw = {
  path: '/article',
  component: Layout,
  redirect: '/article/category',
  meta: { title: '文章管理', icon: 'Reading' },
  children: [
    { path: 'category', name: 'ArticleCategory', component: () => import('@/views/article/category.vue'), meta: { title: '文章分类', icon: 'Files' } },
    { path: 'list', name: 'ArticleList', component: () => import('@/views/article/list.vue'), meta: { title: '文章列表', icon: 'Document' } },
    { path: 'comment', name: 'ArticleComment', component: () => import('@/views/article/comment.vue'), meta: { title: '评论管理', icon: 'ChatLineSquare' } },
  ],
}

const webRoutes: RouteRecordRaw = {
  path: '/web',
  component: Layout,
  redirect: '/web/config',
  meta: { title: '网站管理', icon: 'Platform' },
  children: [
    { path: 'config', name: 'WebConfig', component: () => import('@/views/web/config.vue'), meta: { title: '网站配置', icon: 'Setting' } },
    { path: 'indexpic', name: 'WebIndexPic', component: () => import('@/views/web/indexpic.vue'), meta: { title: '轮播图管理', icon: 'Picture' } },
    { path: 'bank', name: 'WebBank', component: () => import('@/views/web/bank.vue'), meta: { title: '收款银行', icon: 'CreditCard' } },
    { path: 'member', name: 'WebMember', component: () => import('@/views/web/member.vue'), meta: { title: '会员管理', icon: 'UserFilled' } },
    { path: 'express', name: 'WebExpress', component: () => import('@/views/web/express.vue'), meta: { title: '快递管理', icon: 'Van' } },
  ],
}

const staticRoutes: RouteRecordRaw[] = [
  loginRoute,
  layoutRoute,
  systemRoutes,
  productRoutes,
  stockRoutes,
  saleRoutes,
  partnerRoutes,
  pricingRoutes,
  biddingRoutes,
  articleRoutes,
  webRoutes,
]

const router = createRouter({
  history: createWebHistory(),
  routes: staticRoutes,
  scrollBehavior: () => ({ top: 0 }),
})

// Navigation guards
const whiteList = ['/login']
router.beforeEach(async (_to, _from, next) => {
  NProgress.start()
  const tk = getToken()
  if (tk) {
    if (_to.path === '/login') {
      next({ path: '/' })
    } else {
      next()
    }
  } else {
    if (whiteList.includes(_to.path)) {
      next()
    } else {
      next(`/login?redirect=${_to.path}`)
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})

export default router
