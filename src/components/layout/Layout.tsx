import { Layout } from "antd"
import { FC, PropsWithChildren, Suspense, useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"
import Header from "./Header";
import Loader from "./Loader";
import ClientIdManager from "./ClientIdManager";

const DefaultLayout: FC = () => {
    const { pathname } = useLocation()
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [pathname])

    return (
        <Layout>
            <ClientIdManager />
            <Suspense fallback={<Loader spinning/>}>
                <Outlet />
            </Suspense>
        </Layout>
    )
}

export default DefaultLayout
