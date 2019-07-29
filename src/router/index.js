import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from '@/components/Home'
import Notice from '@/components/notice/notice'
import NocusNews from '@/components/focus_news/focus_news'
import Archives from '@/components/archives/archives'
import ArchivesCard from '@/components/archives-card/archives-card'
import NewsDetail from '@/components/news-detail/news-detail'
import FightingCorruption from '@/components/fighting-corruption/fighting-corruption'
import InnerPartyPublicity from '@/components/inner-party-publicity/inner-party-publicity'
import ThematicEducation from '@/components/thematic-education/thematic-education'
import PolicyRegulations from '@/components/policy-regulations/policy-regulations'
import My from '@/components/my/my'
import MyIntegral from '@/components/my-integral/my-integral'
import BranchIntegralDetail from '@/components/branch-integral-detail/branch-integral-detail'
import MyIntegralDetail from '@/components/my-integral-detail/my-integral-detail'
import MyCollection from '@/components/my-collection/my-collection'
import MyRanking from '@/components/my-ranking/my-ranking'
import partyCourse from '@/components/party-course/party-course'
import courseCategroy from '@/components/course-categroy/course-categroy'
import courseList from '@/components/course-list/course-list'
import myCourse from '@/components/myCourse/myCourse'
import latestCourse from '@/components/course-list/latestCourse'
import courseDetail from '@/components/course-detail/course-detail'
import Pdf from '@/components/pdf/pdf'
//import Play from '@/components/play/play'
import stady from '@/components/pdf/index'
import text from '@/components/pdf/text'
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      keepAlive: true,
      totop: false,
      title: '首页'
    }
  },
  {
    path: '/notice',
    name: 'Notice',
    component: Notice,
    meta: {
      keepAlive: true,
      totop: false,
      title: '通知公告'
    }
  },
  {
    path: '/focus_news',
    name: 'focus_news',
    component: NocusNews,
    meta: {
      keepAlive: true,
      totop: false,
      title: '党建要闻'
    }
  },
  {
    path: '/fighting_corruption',
    name: 'fighting_corruption',
    component: FightingCorruption,
    meta: {
      keepAlive: true,
      totop: false,
      title: '反腐倡廉'
    }
  },  
  {
    path:'/inner_party_publicity',
    name: 'inner_party_publicity',
    component: InnerPartyPublicity,
    meta: {
      keepAlive: true,
      totop: false,
      title: '党内公示'
    }
  },
  {
    path:'/thematic_education',
    name: 'thematic_education',
    component: ThematicEducation,
    meta: {
      keepAlive: true,
      totop: false,
      title: '专题教育'
    }
  },
  {
    path:'/policy_regulations',
    name: 'policy_regulations',
    component: PolicyRegulations,
    meta: {
      keepAlive: true,
      totop: false,
      title: '政策法规'
    }

  }, 
  {
    path: '/archives',
    name: 'Archives',
    component: Archives,
    meta: {
      keepAlive: true,
      totop: false,
      title: '党员档案'
    },
  },
  {
    path: '/archives-card',
    name: 'ArchivesCard',
    component: ArchivesCard,
    meta: {
      keepAlive: false,
      totop: false,
      title: '我的名片'
    }
  },
  {
    path: '/news-detail/:id',
    name: 'NewsDetail',
    component: NewsDetail,
    meta: {
      keepAlive: true,
      totop: false,
      title: '新闻详情'
    }
  },
  {
    path: '/my',
    name: 'My',
    component: My,
    meta: {
      keepAlive: true,
      totop: false,
      title: '个人'
    }
  },
  {
    path: '/my-integral',
    name: 'MyIntegral',
    component: MyIntegral,
    meta: {
      keepAlive: false,
      totop: false,
      title: '我的积分'
    }
  },
  {
    path: '/branch-integral-detail',
    name: 'BranchIntegralDetail',
    component: BranchIntegralDetail,
    meta: {
      keepAlive: true,
      totop: false,
      title: '党支部积分明细'
    }
  },
  {
    path: '/my-integral-detail',
    name: 'MyIntegralDetail',
    component: MyIntegralDetail,
    meta: {
      keepAlive: true,
      totop: false,
      title: '个人积分明细'
    }
  },
  {
    path: '/my-collection',
    name: 'MyCollection',
    component: MyCollection,
    meta: {
      keepAlive: true,
      totop: false,
      title: '我的收藏'
    }
  },
  {
    path: '/my-ranking',
    name: 'MyRanking',
    component: MyRanking,
    meta: {
      keepAlive: false,
      totop: false,
      title: '积分排行榜'
    }
  },
  {
    path: '/partyCourse',
    name: 'partyCourse',
    component: partyCourse,
    meta: {
      keepAlive: true,
      totop: false,
      title: '微党课'
    }
  },
  {
    path: '/courseCategroy',
    name: 'courseCategroy',
    component: courseCategroy,
    meta: {
      keepAlive: true,
      totop: false,
      title: '微党课分类'
    }
  },
  {
    path: '/courseList/:categoryId',
    name: 'courseList',
    component: courseList,
    meta: {
      keepAlive: true,
      totop: false,
      title: '分类课程列表'
    }
  },
  {
    path: '/latestCourse',
    name: 'latestCourse',
    component: latestCourse,
    meta: {
      keepAlive: true,
      totop: false,
      title: '最新课程列表'
    }
  },
  {
    path: '/myCourse',
    name: 'myCourse',
    component: myCourse,
    meta: {
      keepAlive: true,
      totop: false,
      title: '我的'
    }
  },
  {
    path: '/courseDetail/:id',
    name: 'courseDetail',
    component: courseDetail,
    meta: {
      keepAlive: false,
      totop: false,
      title: '课程详情'
    }
  },
  {
    path: '/pdf/:id',
    name: 'pdf',
    component: Pdf,
    meta: {
      keepAlive: true,
      totop: false,
      title: '课程详情'
    }
  },
  {
    path: '/pdf/index/:link',
    name: 'stady',
    component: stady,
    meta: {
      keepAlive: true,
      totop: false,
      title: '课程详情'
    }
  },
  {
    path: '/text/:id',
    name: 'text',
    component: text,
    meta: {
      keepAlive: true,
      totop: false,
      title: '课程详情'
    }
  },
  // {
  //   path: '/play/:id',
  //   name: 'play',
  //   component: Play,
  //   meta: {
  //     keepAlive: true,
  //     totop: false,
  //     title: '课程详情'
  //   }
  // },
  // {
  //   path: '/customInfo',
  //   name: 'customInfo',
  //   component: CustomInfo,
  //   // redirect: '/customInfo/custom_genjin',
  //   children: [
  //     {
  //       path: 'custom_genjin',
  //       name: 'custom_genjin',
  //       component: CustomInfoGenjin,
  //       meta: {
  //         keepAlive: true,
  //         title: '客户详情'
  //       }
  //     },
  //     {
  //       path: 'custom_ai',
  //       name: 'custom_ai',
  //       component: CustomAi,
  //       meta: {
  //         keepAlive: true,
  //         title: '客户详情'
  //       }
  //     },
  //     {
  //       path: 'customFrom',
  //       name: 'customFrom',
  //       component: CustomFrom,
  //       meta: {
  //         keepAlive: true,
  //         title: '客户表单'
  //       }
  //     }
  //   ]
  // },
  // 未匹配到路由重定向首页（***放最后***）
  {
    path: '*',
    redirect: '/'
  }
]
Vue.use(VueRouter)
export default new VueRouter({
  routes,
  base: '/found_party/',
  strict: process.env.NODE_ENV !== 'production',
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      const position = {}
      if (to.hash) {
        position.selector = to.hash
      }
      if (to.matched.some(m => m.meta.totop)) {
        position.x = 0
        position.y = 0
      }
      return position
    }
  }
})
