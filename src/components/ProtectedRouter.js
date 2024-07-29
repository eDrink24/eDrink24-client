import { Navigate, Outlet } from 'react-router-dom';
import { getAuthToken } from '../util/auth';

// 로그인되지 않은 상태로 접근하는 페이지엔 redirect
const ProtectedRoute = () => {
    const token = localStorage.getItem("jwtAuthToken")

    if (!token) {
        alert("로그인이 필요한 서비스입니다.")
        return <Navigate to="/eDrink24/login" />
    } else {
        return <Outlet />;

    }
};

export default ProtectedRoute;