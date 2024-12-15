import React from "react"
import App from "../App"
import Welcome from "../components/Welcome"
import { createBrowserRouter} from "react-router-dom"           
import NewContent from "../components/NewContent"
import DisplayContent from "../components/DisplayContent"

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
    ],
  },
];

const router = createBrowserRouter(routes);

export default router;