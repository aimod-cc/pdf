/**
 * 认证模块入口
 */

export { 
  initAuth, 
  checkAuthStatus, 
  goLogin, 
  goRegister,
  goGoogleLogin,
  getPublicSettings,
  logout,
  getAuthState,
  subscribeAuth,
  type User,
  type AuthState,
  type PublicSettings
} from './auth.js';

export { 
  createUserMenu, 
  injectUserMenu 
} from './user-menu.js';
