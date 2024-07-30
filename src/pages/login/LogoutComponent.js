export function logout() {
    localStorage.removeItem('jwtAuthToken');
    localStorage.removeItem('userid');

    window.location.reload();;
}
