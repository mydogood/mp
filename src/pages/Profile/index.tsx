import { FC } from "react"
import {useMediaQuery} from "react-responsive"
import Header from "../../components/layout/Header";
import ProfileSection from "../../components/sections/profileSection/ProfileSection";


const Profile: FC = () => {
    const isMobile = useMediaQuery({ maxWidth: 610 })
    return (
        <main style={{backgroundColor: '#FFFFFF', height: '100vh'}}>
            <Header/>
            <ProfileSection/>
        </main>
    )
}

export default Profile