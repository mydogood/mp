import React, { FC, useState } from 'react';
import {useMediaQuery} from "react-responsive";
import styles from './styles.module.sass'
import UserForm from "./ui/UserForm";


const ProfileSection: FC = () => {
    const [avatarInitials, setAvatarInitials] = useState<string | null>(null);
    const isMobile = useMediaQuery({ maxWidth: 610 })
    const isTablet = useMediaQuery({ maxWidth: 1024 })

    return (
        <section className={styles.profileSection}>
                <UserForm setAvatarInitials={setAvatarInitials}/>
        </section>
    );
};

export default ProfileSection;