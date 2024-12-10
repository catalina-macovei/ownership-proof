import React from "react"

import Path from "./path"
import Content from "../components/Content"
import Layout from "../components/Layout"

const routes = [
    { path: Path.WELCOME, element: <Layout /> },
    { path: Path.CONTENT, element: <Content /> },
    { path: Path.HOME, element: <Content /> },

]

export default routes