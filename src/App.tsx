import { ConfigProvider } from "antd"
import {  memo,  type FC } from "react"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import routes from "./pages/index"



const router = createBrowserRouter(routes)

const App: FC = memo(() => (
        <ConfigProvider renderEmpty={() => 'No records'} theme={{
            components: {
                Checkbox: {
                    colorPrimary: '#FAAC4E',
                    colorPrimaryHover: '#FAAC4E',
                },
                Pagination: {
                    colorPrimary: '#111F33',
                    lineType: 'none',
                    itemActiveColorDisabled: '#111F33',
                    colorBgTextHover: 'none',
                    colorPrimaryHover: '#111F33'
                },
                InputNumber: {
                    colorPrimary: 'none',
                    lineType: 'none',
                    controlOutline: 'none',
                    handleVisible: true,
                    controlItemBgHover: 'none',
                    motionDurationMid: '100000s'
                },
                List: {
                    colorSplit: '#111F33',
                    colorTextDescription: '#111F33',
                },
                Tabs: {
                    inkBarColor: '#FAAC4E',
                    itemSelectedColor: '#111F33',
                    colorFillAlter: '#FFFFFF',
                    itemHoverColor: 'none',
                    itemActiveColor: 'none'
                },
                Button: {
                    colorPrimaryHover: '#FAAC4E',
                    colorPrimaryActive: '#FAAC4E',
                },
                Collapse: {
                    colorBgContainer: 'white',
                    colorFillAlter: 'white',
                },
                Menu: {
                    colorBgContainer: 'white',
                    colorFillAlter: 'white',
                    margin: 18,
                    itemActiveBg: 'white',
                    itemSelectedBg: 'white',
                    itemSelectedColor: '#111F33',
                    horizontalItemSelectedColor: '#FAAC4E',
                    colorText: '#111F33'
                },
                Table: {
                    colorBgContainer: '#f8f7f2',
                    colorFillContent: '#F8F7F2',
                    controlItemBgHover: '#F8F7F2',
                    colorFillAlter: '#F8F7F2',
                    colorFillSecondary: '#F8F7F2',
                },
                Tag: {
                    borderRadiusSM: 15,
                },
                Input: {
                    controlOutline: 'none'
                },
            },
        }}>
          <RouterProvider router={router} />
        </ConfigProvider>
))

export default App
