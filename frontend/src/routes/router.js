import React from "react"
import App from "../App"
import Welcome from "../components/Welcome"
import { createBrowserRouter} from "react-router-dom"           
import NewContent from "../components/NewContent"
import DisplayContent from "../components/DisplayContent"
import MyContent from "../components/MyContent"

const routes = [
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Welcome />
      },
      {
        path: "add-content",
        element: <NewContent />
      },
      {
        path: "content",
        element: <DisplayContent />
      },
      {
        path: "my-content",
        element: <MyContent />
      },
    ],
  },
];

const router = createBrowserRouter(routes);

export default router;