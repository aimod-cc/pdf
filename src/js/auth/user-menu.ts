/**
 * 用户菜单组件
 * 在导航栏显示登录按钮或用户信息
 */

import { createIcons, icons } from 'lucide';
import { 
  subscribeAuth, 
  goLogin, 
  goRegister,
  goGoogleLogin,
  getPublicSettings,
  logout, 
  type AuthState,
  type PublicSettings
} from './auth.js';

// 缓存公开设置
let cachedSettings: PublicSettings | null = null;

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
async function renderUserMenu(container: HTMLElement, state: AuthState) {
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
    // 未登录状态 - 获取公开设置后渲染
    if (!cachedSettings) {
      cachedSettings = await getPublicSettings();
    }
    renderLoginButtons(container, cachedSettings);
  }
  
  // 重新初始化图标
  createIcons({ icons });
}

/**
 * 渲染登录按钮
 */
function renderLoginButtons(container: HTMLElement, settings: PublicSettings) {
  const googleBtn = settings.allowGoogleLogin ? `
    <button id="google-login-btn" class="p-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="使用 Google 登录">
      <svg class="w-5 h-5" viewBox="0 0 24 24">
        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    </button>
  ` : '';

  const registerBtn = settings.allowRegister ? `
    <button id="register-btn" class="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
      注册
    </button>
  ` : '';

  container.innerHTML = `
    <div class="flex items-center gap-2">
      ${googleBtn}
      <button id="login-btn" class="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
        登录
      </button>
      ${registerBtn}
    </div>
  `;
  
  // 绑定事件
  container.querySelector('#login-btn')?.addEventListener('click', goLogin);
  container.querySelector('#register-btn')?.addEventListener('click', goRegister);
  container.querySelector('#google-login-btn')?.addEventListener('click', goGoogleLogin);
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
