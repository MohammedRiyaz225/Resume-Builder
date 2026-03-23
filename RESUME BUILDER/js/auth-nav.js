/* =============================================
   AUTH-NAV.JS – Dynamic Navbar Login State
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
    const navActions = document.querySelector('.nav__actions');
    if (!navActions) return;

    const session = JSON.parse(localStorage.getItem('rm_session'));

    if (session && session.email) {
        // User is logged in
        navActions.innerHTML = `
            <div class="nav__user-info" style="display: flex; align-items: center; gap: 1rem;">
                <span class="user-greeting" style="font-size: 0.9rem; font-weight: 600; color: var(--color-white);">
                    Hi, ${session.name.split(' ')[0]} 👋
                </span>
                <button id="logout-btn" class="btn btn-primary-sm" style="padding: 0.5rem 1rem; font-size: 0.8rem;">
                    <i class="uil uil-signout"></i> Logout
                </button>
            </div>
        `;

        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('rm_session');
            window.location.reload();
        });
    } else {
        // User is not logged in (keep default Login/Sign Up)
        navActions.innerHTML = `
            <a href="login.html" class="btn btn-outline-sm">Login</a>
            <a href="registratin.html" class="btn btn-primary-sm">Sign Up</a>
        `;
    }
});
