import {Space} from "antd"
import {FC} from "react"

import AvatarImg from '../../images/svgIcons/avatar.svg'

const Avatar: FC = () => {

    return (
        <Space direction={"horizontal"} align={"end"}>
            <img src={AvatarImg} alt="Avatar" />
        </Space>
    )
}

export default Avatar