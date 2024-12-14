import React from "react"
import App from "../App"
import Welcome from "../components/Welcome"
import { createBrowserRouter} from "react-router-dom"           
import NewContent from "../components/NewContent"
import AllContent from "../components/AllContent"

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
        path: "all-content",
        element: <AllContent />
      },
    ],
  },
];

const router = createBrowserRouter(routes);

export default router;