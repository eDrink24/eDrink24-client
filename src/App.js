import './App.css';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginComponent from './pages/login/LoginComponent';
import HomeComponent from './pages/home/HomeComponent';
import RootLayout from './pages/rootLayout/root';


const router = createBrowserRouter([
  {
    path: "/eDrink24",
    element: <RootLayout />,
    children: [
      { path: '/eDrink24', element: <HomeComponent /> },
      { path: '/eDrink24/login', element: <LoginComponent /> }
    ]
  }
])

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;