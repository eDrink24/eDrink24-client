import './App.css';
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import LoginComponent, { action as loginAction } from './pages/login/LoginComponent';
import HomeComponent from './pages/home/HomeComponent';
import SignupComponent, { action as signUpAction } from './pages/signup/SignupComponent';
import RootLayout from './pages/rootLayout/root';
import { tokenLoader } from './util/auth';


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
      { path: "*", element: <Navigate to="/eDrink24" /> }
    ]
  }
])

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;