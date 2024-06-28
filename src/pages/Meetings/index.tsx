import { FC } from "react"
import {useMediaQuery} from "react-responsive"
import Header from "../../components/layout/Header";
import {IncentivesProvider, PartnerContextProvider} from "../../components/sections/homeSection/contexts/IncentivesContext";
import styles from "../Home/styles.module.sass";
import MeetingsSection from "../../components/sections/meetingsSection/MeetingsSection";


const Meetings: FC = () => {
    const isMobile = useMediaQuery({ maxWidth: 610 })
    return (
        <main style={{backgroundColor: '#FFFFFF'}}>
            <Header/>
            <MeetingsSection/>
        </main>
    )
}

export default Meetings