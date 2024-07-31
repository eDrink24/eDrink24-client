import './App.css';
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import LoginComponent, { action as loginAction } from './pages/login/LoginComponent';
import HomeComponent from './pages/home/HomeComponent';
import SignupComponent, { action as signUpAction } from './pages/signup/SignupComponent';
import MypageComponent from './pages/mypage/MypageComponent';
import UpdateCustomerComponent from './pages/mypage/UpdateCustomerComponent';

import RootLayout from './pages/rootLayout/root';

import { tokenLoader } from './util/auth';
import ProtectedRoute from './components/ProtectedRouter';
import ListToBasketComponent,{loader as basketLoader}  from './pages/basket/ListToBasketComponent';


const router = createBrowserRouter([
  {
    path: "/eDrink24",
    element: <RootLayout />,
    loader: tokenLoader,
    children: [
      { path: '/eDrink24', element: <HomeComponent /> },
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
        element: <ProtectedRoute />,
        children: [
          { path: "/eDrink24/mypage/updateCustomer", element: <UpdateCustomerComponent /> }
        ]
      }
    ]
  }
])

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;