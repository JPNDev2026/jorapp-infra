// auth.js — Gestion du mot de passe partagé (vérification, stockage du token, redirections)

(function () {
  var TOKEN_KEY = 'stock_auth_token';
  var LOGIN_PAGE = '/login.html';
  var HOME_PAGE = '/index.html';

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function isAuthenticated() {
    return !!getToken();
  }

  // À appeler en haut de chaque page protégée (toutes sauf login.html)
  function checkAuth() {
    if (!isAuthenticated()) {
      window.location.href = LOGIN_PAGE;
      return false;
    }
    return true;
  }

  // Affiche l'erreur dans #login-error si présent (convention utilisée par login.html)
  function showError(message) {
    var el = document.getElementById('login-error');
    if (el) {
      el.textContent = message;
      el.hidden = false;
    } else {
      console.error('[Auth]', message);
    }
  }

  function login(password) {
    return fetch('/api/check-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: password })
    })
      .then(function (res) {
        if (!res.ok) {
          throw new Error('unauthorized');
        }
        return res.json();
      })
      .then(function (data) {
        localStorage.setItem(TOKEN_KEY, data.token);
        window.location.href = HOME_PAGE;
        return true;
      })
      .catch(function () {
        showError('Mot de passe incorrect.');
        return false;
      });
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = LOGIN_PAGE;
  }

  window.StockAuth = {
    checkAuth: checkAuth,
    login: login,
    logout: logout,
    getToken: getToken,
    isAuthenticated: isAuthenticated
  };
})();
