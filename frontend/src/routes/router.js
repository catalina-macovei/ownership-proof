import React from "react"
import App from "../App"
import Welcome from "../components/Welcome"
import { createBrowserRouter} from "react-router-dom"           
import NewContent from "../components/NewContent"
import DisplayContent from "../components/DisplayContent"
import MyContent from "../components/MyContent"
import ConnectMetamask from "../components/ConnectMetamask"
import MyLicences from "../components/MyLicences"

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
        path: "connect-wallet",
        element: <ConnectMetamask />
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
      {
        path: "my-licences",
        element: <MyLicences />
      },
    ],
  },
];

const router = createBrowserRouter(routes);

export default router;