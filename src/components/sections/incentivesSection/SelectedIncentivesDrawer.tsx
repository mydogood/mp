import React, { useState, FC } from 'react';
import { Drawer } from 'antd';
import {useMediaQuery} from "react-responsive";
import styles from "./styles.module.sass";
import {CloseOutlined} from "@ant-design/icons";


interface SelectedIncentivesDataType {
    key: string;
    incentive: string;
    moreInfo: string | JSX.Element;
    meetingsRequired: number;
    requirementsFulfilled?: string | JSX.Element;
    status?: string | JSX.Element;
    Meetings_Needed__c?: string;
    Meetings_Completed__c?: string;
    Customization__c?: string;
}

interface SelectedIncentivesDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    selectedIncentivesDetails: SelectedIncentivesDataType | null;
}



const SelectedIncentivesDrawer: FC<SelectedIncentivesDrawerProps> = ({isOpen, onClose, selectedIncentivesDetails}) => {

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
            {selectedIncentivesDetails && (
                <section className={styles.incentiveDetailsDrawerContainer}>
                    <div className={styles.drawerTitle}>
                        <h3>Incentive Details </h3>
                        <CloseOutlined onClick={onClose} />
                    </div>
                    <div>
                        <h4>{selectedIncentivesDetails.incentive}</h4>
                        <ul className={styles.incentiveDetailsList}>
                            <li className={styles.listItem}>
                                <div>Meetings Required: </div>
                                <div>{selectedIncentivesDetails.Meetings_Needed__c}</div>
                            </li>
                            <li className={styles.listItem}>
                                <div>Meetings Completed: </div>
                                <div>{selectedIncentivesDetails.Meetings_Completed__c}</div>
                            </li>
                            <li className={styles.listItem}>
                                <div>Customization Options: </div>
                                <div>{selectedIncentivesDetails.Customization__c ? selectedIncentivesDetails.Customization__c : '-' }</div>
                            </li>
                            <li className={styles.listItem}>
                                <div>Status </div>
                                {selectedIncentivesDetails.status}
                            </li>
                        </ul>
                    </div>
                </section>
            )}
        </Drawer>
    );
};

export default SelectedIncentivesDrawer;