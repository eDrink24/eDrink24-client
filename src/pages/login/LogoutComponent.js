export function logout() {
    localStorage.removeItem("jwtAuthToken");
    localStorage.removeItem("userid");
    localStorage.removeItem("loginId")

    window.location.reload();;
}
