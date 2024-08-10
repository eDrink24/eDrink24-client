import './App.css';
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import LoginComponent, { action as loginAction } from './pages/login/LoginComponent';
import HomeComponent from './pages/home/HomeComponent';
import CategoryComponent from './pages/category/CategoryComponent';
import SignupComponent, { action as signUpAction } from './pages/signup/SignupComponent';
import MypageComponent from './pages/mypage/MypageComponent';
import UpdateCustomerComponent from './pages/mypage/UpdateCustomerComponent';
import OrderComponent from './pages/order/OrderComponent';
import ListToBasketComponent, { loader as basketLoader } from './pages/basket/ListToBasketComponent';
import AllProductComponent from './pages/product/AllProductComponet';
import ProductDetailComponent from './pages/product/ProductDetailComponent';

import KakaoLoginHandler from './pages/login/kakao/KakaoLoginHandler';
import KakaoSignupHandler from './pages/login/kakao/KakaoSignupHandler';

import RootLayout from './pages/rootLayout/root';
import ProtectedRoute from './components/ProtectedRouter';

import { tokenLoader } from './util/auth';

// test yoon
const router = createBrowserRouter([
  {
    path: "/eDrink24",
    element: <RootLayout />,
    loader: tokenLoader,
    children: [
      { path: '/eDrink24', element: <HomeComponent /> },
      { path: '/eDrink24/allproduct', element: <AllProductComponent /> },
      { path: '/eDrink24/allproduct/:productId', element: <ProductDetailComponent /> },
      { path: '/eDrink24/category', element: <CategoryComponent /> },
      {
        path: '/eDrink24/login', element: <LoginComponent />,
        action: loginAction
      },
      {
        path: '/eDrink24/signup', element: <SignupComponent />,
        action: signUpAction
      },
      { path: "/eDrink24/mypage", element: <MypageComponent /> },
      {
        path: '/eDrink24/basket', element: <ListToBasketComponent />,
        loader: basketLoader
      },
      {
        path: '/eDrink24/order/:userId/:loginId/:basketIds', element: <OrderComponent />

      },

      { // 카카오 로그인 대기창
        path: '/eDrink24/login/oauth2/callback/kakao', element: <KakaoLoginHandler />,
      },
      { // 카카오 회원가입시, 추가정보 입력창
        path: '/eDrink24/kakao/signup', element : <KakaoSignupHandler/>
      },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/eDrink24/mypage/updateCustomer", element: <UpdateCustomerComponent /> }
        ]
      }
    ]
  }
])
// test/test2
function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;