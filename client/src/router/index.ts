import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

// Routes — add your page components here
const routes: RouteRecordRaw[] = [
  // { path: '/', name: 'home', component: () => import('@/pages/HomePage.vue') },
  // { path: '/shop', name: 'shop', component: () => import('@/pages/ShopPage.vue') },
  // { path: '/games', name: 'games', component: () => import('@/pages/GamesPage.vue') },
  // { path: '/tasks', name: 'tasks', component: () => import('@/pages/TasksPage.vue') },
  // { path: '/friends', name: 'friends', component: () => import('@/pages/FriendsPage.vue') },
  // { path: '/wallet', name: 'wallet', component: () => import('@/pages/WalletPage.vue') },
  // { path: '/boosters', name: 'boosters', component: () => import('@/pages/BoostersPage.vue') },
  // { path: '/daily-combo', name: 'daily-combo', component: () => import('@/pages/DailyComboPage.vue') },
  // { path: '/daily-reward', name: 'daily-reward', component: () => import('@/pages/DailyRewardPage.vue') },
  // { path: '/spin', name: 'spin', component: () => import('@/pages/SpinPage.vue') },
  // { path: '/roulette', name: 'roulette', component: () => import('@/pages/RoulettePage.vue') },
  // { path: '/ride', name: 'ride', component: () => import('@/pages/RidePage.vue') },
  // { path: '/leaderboard', name: 'leaderboard', component: () => import('@/pages/LeaderboardPage.vue') },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
