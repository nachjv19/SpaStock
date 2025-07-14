const KEY = 'session';

export function setSession(user) {
    localStorage.setItem(KEY, JSON.stringify(user));
 }

 export function getSession() {
    return JSON.parse(localStorage.getItem(KEY));
 }

 export function clearSession() {
    localStorage.removeItem(KEY);
 }

 export function Uautenticado() {
    return !!getSession();
 }

 export function getUserRole() {
    const session = getSession();
    return session?.role || null;
 }

 export function getUsername() {
    const session = getSession();
    return session?.username || null;
 }