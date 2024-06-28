import React, { useState, FC } from 'react';
import { Button, Drawer, Tag } from 'antd';
import dayjs from "dayjs";
import {useMediaQuery} from "react-responsive";
import styles from "../styles.module.sass";
import {CloseOutlined} from "@ant-design/icons";
import AcceptRequestModal from "../../homeSection/ui/AcceptRequestModal";
import {usePartnerContext} from "../../homeSection/contexts/IncentivesContext";


interface PartnersDataType {
    key: string;
    partnerName: string;
    overview: string;
    hasRequested: boolean;
    declineReason?: string | JSX.Element;
    action?: string | JSX.Element;
    Related_Membership_Member__c: string;
    Related_Membership__c: string;
    Survey_Option_Name__c: string[];
    filterCategory?: string[];
    Client_Logo__c?: string;
}

interface DeclineMeetingsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    revertStatus: (partnerKey: string) => Promise<void>;
    declineMeetingsDetails: PartnersDataType | null;
}



const DeclineMeetingDetailsDrawer: FC<DeclineMeetingsDrawerProps> = ({isOpen, onClose, declineMeetingsDetails, revertStatus }) => {

    const [open, setOpen] = useState(false);
    const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
    const { declinedList, addRequestedPartner, requestedList, removeDeclinePartner, removeSavedDeclinePartner} = usePartnerContext();


    const isMobile = useMediaQuery({ maxWidth: 610 })
    const isTablet = useMediaQuery({ maxWidth: 1024 })

    const showDrawer = () => {
        setOpen(true);
    };


    const handleRemoveDeclineClick = () => {
        if (declineMeetingsDetails) {
            removeSavedDeclinePartner(declineMeetingsDetails);
            onClose();
        }
    };

    const handleChangeMyChoiceClick = async () => {
        if (declineMeetingsDetails && declineMeetingsDetails.key) {
            await revertStatus(declineMeetingsDetails.key);
            onClose();
        }
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
            {declineMeetingsDetails && (
                <section className={styles.meetingsDetailsDrawerContainer}>
                    <div className={styles.drawerTitle}>
                        <h3>Meeting Details </h3>
                        <CloseOutlined onClick={onClose} />
                    </div>
                    <div>
                        <h4>{declineMeetingsDetails.partnerName}</h4>
                        <ul className={styles.meetingsDetailsList}>
                            <li className={styles.listItem}>
                                <div>Decline Reason: </div>
                                <div> <Tag color={'blue'}>{declineMeetingsDetails.declineReason}</Tag> </div>
                            </li>
                            <li className={styles.listItemBtn}>
                                    <button onClick={handleChangeMyChoiceClick}>Change My Choice</button>
                            </li>
                        </ul>
                    </div>
                </section>
            )}
        </Drawer>
    );
};

export default DeclineMeetingDetailsDrawer;