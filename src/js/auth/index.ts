/**
 * 认证模块入口
 */

export { 
  initAuth, 
  checkAuthStatus, 
  goLogin, 
  goRegister, 
  logout,
  getAuthState,
  subscribeAuth,
  type User,
  type AuthState 
} from './auth.js';

export { 
  createUserMenu, 
  injectUserMenu 
} from './user-menu.js';
