/**
 * 用户菜单组件
 * 在导航栏显示登录按钮或用户信息
 */

import { createIcons, icons } from 'lucide';
import { 
  subscribeAuth, 
  goLogin, 
  goRegister, 
  logout, 
  type AuthState 
} from './auth.js';

/**
 * 创建用户菜单 DOM 元素
 */
export function createUserMenu(): HTMLElement {
  const container = document.createElement('div');
  container.id = 'user-menu-container';
  container.className = 'relative';
  
  // 初始显示加载状态
  container.innerHTML = `
    <div class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
  `;
  
  // 订阅认证状态变化
  subscribeAuth((state) => {
    renderUserMenu(container, state);
  });
  
  return container;
}

/**
 * 根据认证状态渲染用户菜单
 */
function renderUserMenu(container: HTMLElement, state: AuthState) {
  if (state.loading && !state.initialized) {
    // 加载中状态
    container.innerHTML = `
      <div class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
    `;
    return;
  }
  
  if (state.user) {
    // 已登录状态
    renderLoggedInMenu(container, state.user);
  } else {
    // 未登录状态
    renderLoginButtons(container);
  }
  
  // 重新初始化图标
  createIcons({ icons });
}

/**
 * 渲染登录按钮
 */
function renderLoginButtons(container: HTMLElement) {
  container.innerHTML = `
    <div class="flex items-center gap-2">
      <button id="login-btn" class="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
        登录
      </button>
      <button id="register-btn" class="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
        注册
      </button>
    </div>
  `;
  
  // 绑定事件
  container.querySelector('#login-btn')?.addEventListener('click', goLogin);
  container.querySelector('#register-btn')?.addEventListener('click', goRegister);
}

/**
 * 渲染已登录用户菜单
 */
function renderLoggedInMenu(container: HTMLElement, user: { id: number; username: string; name?: string; avatar?: string; email?: string }) {
  const displayName = user.name || user.username;
  const avatarUrl = user.avatar || generateDefaultAvatar(displayName);
  
  container.innerHTML = `
    <button id="user-menu-btn" class="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
      <img src="${avatarUrl}" alt="${displayName}" class="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600" onerror="this.src='${generateDefaultAvatar(displayName)}'">
      <span class="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:inline max-w-[100px] truncate">${displayName}</span>
      <i data-lucide="chevron-down" class="w-4 h-4 text-gray-500 dark:text-gray-400"></i>
    </button>
    <div id="user-dropdown" class="hidden absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50">
      <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <p class="text-sm font-medium text-gray-900 dark:text-white truncate">${displayName}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 truncate">${user.email || user.username}</p>
      </div>
      <div class="py-1">
        <a href="https://auth.aimod.cc/profile" class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
          <i data-lucide="user" class="w-4 h-4"></i>
          个人中心
        </a>
        <button id="logout-btn" class="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700">
          <i data-lucide="log-out" class="w-4 h-4"></i>
          退出登录
        </button>
      </div>
    </div>
  `;
  
  // 绑定下拉菜单事件
  const menuBtn = container.querySelector('#user-menu-btn');
  const dropdown = container.querySelector('#user-dropdown');
  
  menuBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown?.classList.toggle('hidden');
  });
  
  // 点击外部关闭下拉菜单
  document.addEventListener('click', () => {
    dropdown?.classList.add('hidden');
  });
  
  // 绑定登出事件
  container.querySelector('#logout-btn')?.addEventListener('click', async () => {
    const success = await logout();
    if (success) {
      window.location.reload();
    }
  });
}

/**
 * 生成默认头像 URL（使用 UI Avatars 服务）
 */
function generateDefaultAvatar(name: string): string {
  const encodedName = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encodedName}&background=6366f1&color=fff&size=64`;
}

/**
 * 将用户菜单注入到导航栏
 */
export function injectUserMenu() {
  // 查找导航栏中的合适位置
  const nav = document.querySelector('nav .container > .flex');
  if (!nav) return;
  
  // 查找主题切换和语言切换的容器
  const rightSection = nav.querySelector('.flex.items-center.gap-2');
  if (!rightSection) return;
  
  // 创建用户菜单并插入
  const userMenu = createUserMenu();
  rightSection.insertBefore(userMenu, rightSection.firstChild);
}
