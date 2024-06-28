import React, { useState, FC } from 'react';
import { Button, Drawer } from 'antd';
import dayjs from "dayjs";
import {useMediaQuery} from "react-responsive";
import styles from "../styles.module.sass";
import {CloseOutlined} from "@ant-design/icons";


interface AcceptedMeetingsTableDataType {
    key: string;
    partnerName: string;
    overview?: string;
    hasRequested?: boolean;
    incentive?: string;
    moreInfo?: string;
    meetingsRequired?: number;
    stage?: string | JSX.Element;
    meetingDate?: string | JSX.Element;
    scheduleMeeting?: string | JSX.Element;
    feedbackLink?: string | JSX.Element;
}

interface AcceptedMeetingsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    acceptedMeetingsDetails: AcceptedMeetingsTableDataType | null;
}



const AcceptMeetingDetailsDrawer: FC<AcceptedMeetingsDrawerProps> = ({isOpen, onClose, acceptedMeetingsDetails}) => {

    const [open, setOpen] = useState(false);


    const isMobile = useMediaQuery({ maxWidth: 610 })
    const isTablet = useMediaQuery({ maxWidth: 1024 })

    const showDrawer = () => {
        setOpen(true);
    };


    return (
        <Drawer
            footerStyle={{ border: 'none' }}
            closeIcon={false}
            width={isMobile ? '100%' : (isTablet ? '60%' : '30%')}
            placement="right"
            onClose={onClose}
            open={isOpen}
        >
            {acceptedMeetingsDetails && (
                <section className={styles.meetingsDetailsDrawerContainer}>
                    <div className={styles.drawerTitle}>
                        <h3>Meeting Details </h3>
                        <CloseOutlined onClick={onClose} />
                    </div>
                    <div>
                        <h4>{acceptedMeetingsDetails.partnerName}</h4>
                        <ul className={styles.meetingsDetailsList}>
                            <li className={styles.listItem}>
                                <div>Stage: </div>
                                <div>{acceptedMeetingsDetails.stage}</div>
                            </li>
                            <li className={styles.listItem}>
                                <div>Incentive: </div>
                                <div>{acceptedMeetingsDetails.incentive}</div>
                            </li>
                            <li className={styles.listItem}>
                                <div>Meeting Date: </div>
                                <div>{acceptedMeetingsDetails.meetingDate || '-'}</div>
                            </li>
                            <li className={styles.listItem}>
                                <div>Feedback Link: </div>
                                <div className={styles.submitLink}>{acceptedMeetingsDetails.feedbackLink}</div>
                            </li>
                            <li className={styles.listItemBtn}>
                                {acceptedMeetingsDetails.scheduleMeeting === '-' ? (' '): (acceptedMeetingsDetails.scheduleMeeting)}
                            </li>
                        </ul>
                    </div>
                </section>
            )}
        </Drawer>
    );
};

export default AcceptMeetingDetailsDrawer;