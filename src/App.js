import './App.css';
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import LoginComponent, { action as loginAction } from './pages/login/LoginComponent';
import HomeComponent from './pages/home/HomeComponent';
import CategoryComponent from './pages/category/CategoryComponent';
import SignupComponent, { action as signUpAction } from './pages/signup/SignupComponent';
import MypageComponent from './pages/mypage/MypageComponent';
import UpdateCustomerComponent from './pages/mypage/UpdateCustomerComponent';
import OrderComponent from './pages/order/OrderComponent';

import RootLayout from './pages/rootLayout/root';

import { tokenLoader } from './util/auth';
import ProtectedRoute from './components/ProtectedRouter';
import ListToBasketComponent, { loader as basketLoader } from './pages/basket/ListToBasketComponent';
import AllProductComponent from './pages/product/AllProductComponet';
import ProductDetailComponent from './pages/product/ProductDetailComponent';

//
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
        path: '/eDrink24/order/:userId/:loginId', element: <OrderComponent />

      },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/eDrink24/mypage/updateCustomer", element: <UpdateCustomerComponent /> },
          {
            path: '/eDrink24/basket', element: <ListToBasketComponent />,
            loader: basketLoader
          },
        ]
      }
    ]
  }
])
// test
function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;