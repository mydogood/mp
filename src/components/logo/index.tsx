import {Space} from "antd"
import {FC} from "react"
import {useNavigate, useParams} from "react-router-dom"

import LogoImage from "../../images/svgIcons/do_good_logo_small.svg"

const Logo: FC = () => {
    const { clientId } = useParams<{ clientId: string }>();
    const navigate = useNavigate()
    return (
        <Space direction={"horizontal"} align={"start"}>
            <img src={LogoImage} alt="Logo" onClick={() => navigate(`/${clientId}/home`)} />
        </Space>
    )
}






export default Logo