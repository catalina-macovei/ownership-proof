import React from "react"

import Path from "./path"
import Content from "../components/Content"
import Layout from "../components/Header"
import App from "../App"
import Welcome from "../components/Welcome"

const routes = [
    {
      element: <App />,
      children: [
        {
          path: "/",
          element: <Welcome />
        },
        {
            path: "/add-content",
            element: <Content />
        },
      ],
    },
  ]


export default routes