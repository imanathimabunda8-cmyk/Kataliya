// Auto transition from loading to sign in after 3 seconds
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const loading = document.getElementById('loading-screen');
    const signin = document.getElementById('signin-screen');
    loading.classList.add('hidden');
    signin.classList.remove('hidden');
  }, 3000);
});