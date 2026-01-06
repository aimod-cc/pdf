/**
 * Auth Center 认证服务
 * 对接 https://auth.aimod.cc 统一认证中心
 */

const AUTH_CENTER_URL = 'https://auth.aimod.cc';

export interface User {
  id: number;
  username: string;
  email?: string;
  name?: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
}

export interface PublicSettings {
  allowRegister: boolean;
  allowGoogleLogin: boolean;
  allowGithubLogin: boolean;
}

// 公开设置缓存
let publicSettings: PublicSettings | null = null;

// 全局认证状态
let authState: AuthState = {
  user: null,
  loading: true,
  initialized: false,
};

// 状态变化监听器
type AuthListener = (state: AuthState) => void;
const listeners: Set<AuthListener> = new Set();

/**
 * 订阅认证状态变化
 */
export function subscribeAuth(listener: AuthListener): () => void {
  listeners.add(listener);
  // 立即通知当前状态
  listener(authState);
  return () => listeners.delete(listener);
}

/**
 * 通知所有监听器
 */
function notifyListeners() {
  listeners.forEach(listener => listener(authState));
}

/**
 * 更新认证状态
 */
function updateAuthState(partial: Partial<AuthState>) {
  authState = { ...authState, ...partial };
  notifyListeners();
}

/**
 * 获取当前认证状态
 */
export function getAuthState(): AuthState {
  return authState;
}

/**
 * 检查登录状态
 */
export async function checkAuthStatus(): Promise<User | null> {
  try {
    updateAuthState({ loading: true });
    
    const res = await fetch(`${AUTH_CENTER_URL}/api/auth/status`, {
      credentials: 'include',
    });
    
    const data = await res.json();
    
    if (data.success && data.data?.loggedIn) {
      updateAuthState({ 
        user: data.data.user, 
        loading: false, 
        initialized: true 
      });
      return data.data.user;
    }
    
    updateAuthState({ user: null, loading: false, initialized: true });
    return null;
  } catch (error) {
    console.error('检查登录状态失败:', error);
    updateAuthState({ user: null, loading: false, initialized: true });
    return null;
  }
}

/**
 * 跳转到登录页
 */
export function goLogin() {
  const returnUrl = encodeURIComponent(window.location.href);
  window.location.href = `${AUTH_CENTER_URL}/auth/login?redirect=${returnUrl}`;
}

/**
 * 跳转到注册页
 */
export function goRegister() {
  const returnUrl = encodeURIComponent(window.location.href);
  window.location.href = `${AUTH_CENTER_URL}/auth/register?redirect=${returnUrl}`;
}

/**
 * 跳转到 Google 登录
 */
export function goGoogleLogin() {
  const returnUrl = encodeURIComponent(window.location.href);
  window.location.href = `${AUTH_CENTER_URL}/api/auth/oauth/google?redirect=${returnUrl}`;
}

/**
 * 获取公开设置（是否允许注册、第三方登录等）
 */
export async function getPublicSettings(): Promise<PublicSettings> {
  if (publicSettings) return publicSettings;
  
  try {
    const res = await fetch(`${AUTH_CENTER_URL}/api/auth/public-settings`, {
      credentials: 'include',
    });
    
    const data = await res.json();
    
    if (data.success) {
      publicSettings = {
        allowRegister: data.data.allow_register === '1',
        allowGoogleLogin: data.data.allow_google_login === '1',
        allowGithubLogin: data.data.allow_github_login === '1',
      };
      return publicSettings;
    }
  } catch (error) {
    console.error('获取公开设置失败:', error);
  }
  
  // 默认值
  return {
    allowRegister: true,
    allowGoogleLogin: false,
    allowGithubLogin: false,
  };
}

/**
 * 登出
 */
export async function logout(): Promise<boolean> {
  try {
    const res = await fetch(`${AUTH_CENTER_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    
    const data = await res.json();
    
    if (data.success) {
      updateAuthState({ user: null });
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('登出失败:', error);
    return false;
  }
}

/**
 * 初始化认证模块
 */
export async function initAuth(): Promise<void> {
  if (authState.initialized) return;
  await checkAuthStatus();
}
