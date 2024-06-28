import { FC, lazy } from "react";
import { Outlet, RouteObject } from "react-router-dom";

import Loader from "../components/layout/Loader";
import DefaultLayout from "../components/layout/Layout";

const routes: RouteObject[] = [
  {
    Component: DefaultLayout,
    loader: () => <Loader spinning />,
    children: [
      {
        Component: lazy<FC>(() => import("./Login")),
        path: "/",
        index: true,
      },
      {
        Component: lazy<FC>(() => import("./Home")),
        path: "/:clientId/home",
        index: true,
      },
      {
        Component: lazy<FC>(() => import("./Meetings")),
        path: "/:clientId/meetings",
        index: true,
      },
      {
        Component: lazy<FC>(() => import("./Incentives")),
        path: "/:clientId/incentives",
        index: true,
      },
      {
        Component: lazy<FC>(() => import("./Profile")),
        path: "/:clientId/profile",
        index: true,
      },
      {
        Component: lazy<FC>(() => import("./Bonus")),
        path: "/:clientId/bonus",
        index: true,
      },
      // {
      //     Component: lazy<FC>(() => import("./Home")),
      //     path: "/:clientId/",
      //     index: true,
      // },
    ],
  },
];

export default routes;
