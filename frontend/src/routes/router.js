import React from "react"
import Content from "../components/Content"
import App from "../App"
import Welcome from "../components/Welcome"
import { createBrowserRouter} from "react-router-dom"           

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
        element: <Content />
      },
    ],
  },
];

const router = createBrowserRouter(routes);

export default router;