
import React, {useRef, useState} from 'react';
import styles from '../styles.module.sass'
import { UserOutlined } from '@ant-design/icons'


const UploadAvatar: React.FC<{ initials: string | null }> = ({ initials }) => {
    const [avatar, setAvatar] = useState<string | null>(null);

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setAvatar(imageUrl);
        }
    };

    const handleEditClick = () => {
        const inputAvatar = document.querySelector<HTMLInputElement>('.inputAvatar');
        if (inputAvatar) {
            inputAvatar.click();
        }
    };

    const removeAvatar = () => {
        setAvatar(null);
    };


    return (

            <div className={styles.avatarContainer}>
                <div className={styles.defaultAvatar}>
                    {avatar ? <img className={styles.userAvatar} src={avatar} alt="Avatar" /> : <div className={styles.graySquare}>{initials ? initials : (<UserOutlined style={{fontSize: '100px'}}/>)}</div>}
                </div>
                <div className={styles.avatarButtons}>
                    {avatar ? (
                        <button className={styles.removeAvatarBtn} onClick={removeAvatar}>Delete photo</button>
                    ) : (
                        <div className={styles.inputContainer}>
                            <label className={styles.inputLabel}>
                                <input className={styles.inputAvatar} type="file" accept="image/*" onChange={handleAvatarChange} />
                                <span onClick={handleEditClick} className={styles.inputTitle}>Edit photo</span>
                            </label>
                        </div>
                    )}
                </div>
            </div>

    );
};

export default UploadAvatar;
