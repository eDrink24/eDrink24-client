import './App.css';
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import LoginComponent, { action as loginAction } from './pages/login/LoginComponent';
import HomeComponent from './pages/home/HomeComponent';
import CategoryComponent from './pages/category/CategoryComponent';
import SignupComponent, { action as signUpAction } from './pages/signup/SignupComponent';
import MypageComponent from './pages/mypage/MypageComponent';
import SearchComponent from './pages/search/SearchComponent';
import HistoryComponent from './pages/history/HistoryComponent';
import UpdateCustomerComponent from './pages/mypage/UpdateCustomerComponent';
import OrderComponent from './pages/order/OrderComponent';
import ListToBasketComponent, { loader as basketLoader } from './pages/basket/ListToBasketComponent';
import AllProductComponent from './pages/product/AllProductComponent';
import CategoriesProductComponent from './pages/product/CategoriesProductComponent';
import ProductDetailComponent from './pages/product/ProductDetailComponent';
import AdminOrderComponent from './pages/admin/AdminOrderComponent';
import KakaoLoginHandler from './pages/login/kakao/KakaoLoginHandler';
import KakaoSignupHandler from './pages/login/kakao/KakaoSignupHandler';

import RootLayout from './pages/rootLayout/root';
import ProtectedRoute from './components/ProtectedRouter';
import SetPlaceComponent from './pages/setPlace/SetPlaceComponent';

import { RecoilRoot } from 'recoil'; // RecoilRoot 임포트 추가
import { tokenLoader } from './util/auth';
import AdminOrderListComponent from './pages/admin/AdminOrderListComponent';
import ShowReservationPickupComponent from './pages/admin/ShowReservationPickupComponent';
import AdminComponent from './pages/admin/AdminComponent';
import ShowTodayPickupPageComponent from './pages/admin/ShowTodayPickupPageComponent';
import TodayPickupCompletedPageComponent from './pages/admin/TodayPickupCompletedPageComponent';
import PaymentApproval from './components/payment/PaymentApproval';
import PaymentCancelOrFail from './components/payment/PaymentCancelOrFail';



// test yoon
const router = createBrowserRouter([
  {
    path: "/eDrink24",
    element: <RootLayout />,
    loader: tokenLoader,
    children: [
      { path: '/eDrink24', element: <HomeComponent /> },
      { path: '/eDrink24/allproduct/:category1', element: <AllProductComponent /> },
      { path: '/eDrink24/allproduct/:category1/:category2', element: <CategoriesProductComponent /> },
      { path: '/eDrink24/allproduct/:category1/:category2/:productId', element: <ProductDetailComponent /> },
      { path: '/eDrink24/category', element: <CategoryComponent /> },
      { path: '/eDrink24/search', element: <SearchComponent /> },
      { path: '/eDrink24/history', element: <HistoryComponent /> },
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
        path: '/eDrink24/order', element: <OrderComponent />
      },
      {
        path: '/eDrink24/admin', element: <AdminComponent />
      },
      {
        path: '/eDrink24/todayPickup', element: <ShowTodayPickupPageComponent />
      },
      {
        path: '/eDrink24/admin/todayPickupCompleted', element: <TodayPickupCompletedPageComponent />
      },
      {
        path: '/eDrink24/admin/adminOrder', element: <AdminOrderComponent />
      },
      {
        path: '/eDrink24/admin/ShowReservationPickup', element: <ShowReservationPickupComponent />
      },
      {
        path: '/eDrink24/admin/adminOrderList', element: <AdminOrderListComponent />
      },
      { // 카카오 로그인 대기창
        path: '/eDrink24/login/oauth2/callback/kakao', element: <KakaoLoginHandler />,
      },
      { // 카카오 회원가입시, 추가정보 입력창
        path: '/eDrink24/kakao/signup', element: <KakaoSignupHandler />
      },

      {
        element: <ProtectedRoute />,
        children: [
          { path: "/eDrink24/mypage/updateCustomer", element: <UpdateCustomerComponent /> },
          { path: "/eDrink24/myplace_store", element: <SetPlaceComponent /> },
          { path: "/eDrink24/order/approval", element: <PaymentApproval /> }, // 결제완료처리페이지
          { path: "/eDrink24/order/cancelOrFail", element: <PaymentCancelOrFail /> } // 결제취소or오류

        ]
      }
    ]
  }
])

function App() {
  return (
    <RecoilRoot>
      <RouterProvider router={router} />
    </RecoilRoot>

  );
}

export default App;