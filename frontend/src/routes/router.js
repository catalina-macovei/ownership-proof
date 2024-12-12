import React from "react"

import Path from "./path"
import Content from "../components/Content"
import Layout from "../components/Header"
import App from "../App"
import Welcome from "../components/Welcome"
import { createBrowserRouter, RouterProvider} from "react-router-dom"           

const routes = [
  {
    path: "/", // Explicitly define the root path
    element: <App />,
    children: [
      {
        index: true, // This tells react-router this is the index route
        element: <Welcome />
      },
      {
        path: "add-content", // Remove the leading slash
        element: <Content />
      },
    ],
  },
];

const router = createBrowserRouter(routes);

export default router;