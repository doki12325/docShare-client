import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import Login from "./Components/Login/Login";
import UserStore from "./Store/UserStore";
import Signup from "./Components/Signup/Signup";
import WelcomeScreen from "./Components/WelcomeScreen/WelcomeScreen";
import Editor from "./Components/Editor/Editor";

const router = createBrowserRouter([
  {
    path: "/",
    element: <WelcomeScreen />,
  },
  { path: "/document/:id", element: <Editor /> },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
]);

function App() {
  return (
    <UserStore>
      <RouterProvider router={router} />
    </UserStore>
  );
}

export default App;
