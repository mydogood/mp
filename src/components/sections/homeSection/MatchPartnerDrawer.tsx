import React, { FC, useEffect, useState } from 'react';
import { useMediaQuery } from "react-responsive"
import { Drawer, Avatar, message } from 'antd';
import styles from './styles.module.sass'
import { CloseOutlined } from "@ant-design/icons";
import { UserOutlined } from '@ant-design/icons';
import { marked } from 'marked';
import { updateDataInSalesForce } from '../../../salesforceAuth';
import { getMemberInfoFromContact } from '../../../getSalesForceData';
import { useParams } from 'react-router-dom';

export interface MatchPartnersDataType {
	Account_ID__c: string,
	Client_Campaign_ID__c: string
	Id: string,
	Matching_Topic_Partner__c: string,
	Member_Contact__c: string,
	Partner_ID__c: string,
	Partner_Name__c: string,
	richMerge?: string;
	Client_Logo__c?: string;
	partnerName: string;
	website?: string;
	Member_Account_ID__c: string;
}
interface MatchPartnerDrawerProps {
	isOpen: boolean;
	onClose: () => void;
	partnerDetails: MatchPartnersDataType | null;
}
const MatchPartnerDrawer: FC<MatchPartnerDrawerProps> = ({ isOpen, onClose, partnerDetails }) => {
	const [messageApi] = message.useMessage();
	const { clientId } = useParams<{ clientId: string }>();
	const isMobile = useMediaQuery({ maxWidth: 610 })
	const isTablet = useMediaQuery({ maxWidth: 1024 })

	useEffect(() => {
		if (partnerDetails) {
		}
	}, [partnerDetails]);


	const success = () => {
		messageApi.open({
			type: 'success',
			content: 'Data sent successfully',
		});
	};

	const handleRemoveClick = () => {
		if (partnerDetails) {
			updatePartnerInSalesForce(partnerDetails, 'Removed')
			onClose();
		}
	};

	const handleRequestClick = () => {
		if (partnerDetails) {
			updatePartnerInSalesForce(partnerDetails, 'Requested')
			onClose();
		}
	};

	const getDisplayLink = (url: string | undefined) => {
		if (!url) {
			return "";
		}
		try {
			const parsedUrl = new URL(url);
			const path = parsedUrl.pathname === '/' ? '' : parsedUrl.pathname;
			return `${parsedUrl.hostname}${path}`;
		} catch (e) {
			return url;
		}
	};

	function stripStyles(html: string) {
		const domParser = new DOMParser();
		const document = domParser.parseFromString(html, 'text/html');
		const allElements = document.querySelectorAll('*');
		allElements.forEach(element => element.removeAttribute('style'));
		return document.body.innerHTML;
	}

	const renderAvatar = () => {
		if (!partnerDetails || !partnerDetails.Client_Logo__c) {
			return <Avatar shape="square" size={48} icon={<UserOutlined />} />;
		}

		const isLink = partnerDetails.Client_Logo__c.startsWith('http://') || partnerDetails.Client_Logo__c.startsWith('https://');

		if (isLink) {
			return <Avatar shape="square" size={48} src={partnerDetails.Client_Logo__c} />;
		}

		if (partnerDetails.Client_Logo__c.startsWith('<img')) {
			return <div style={{ width: '48px', height: '48px' }} dangerouslySetInnerHTML={{ __html: partnerDetails.Client_Logo__c }} />;
		}

		return <Avatar shape="square" size={48} icon={<UserOutlined />} />;
	};

	const updatePartnerInSalesForce = async (partner: MatchPartnersDataType, status: string) => {
		let updatedFields = {};
		let endpoint = '';

		switch (status) {
			case "Removed":
				updatedFields = {
					Removed_by_Member__c: true,
				};
				endpoint = `sobjects/Survey_Match__c/${partner.Id}`;
				break;
			case "Requested":
				updatedFields = {
					Member_Responded__c: true,
				};
				endpoint = `sobjects/Survey_Match__c/${partner.Id}`;
				break;
		}

		try {
			if (status === "Requested") {
				await updateDataInSalesForce(endpoint, updatedFields);
				success();
			} else {
				await updateDataInSalesForce(endpoint, updatedFields);
				success();
			}

		} catch (error) {
			console.error(`Error processing partner with ID ${partner.Partner_ID__c}:`, error);
		}
	};

	return (
		<Drawer
			footerStyle={{ border: 'none' }}
			closeIcon={false}
			width={isMobile ? '100%' : (isTablet ? '60%' : '40%')}
			placement="right"
			onClose={onClose}
			open={isOpen}
		>
			{partnerDetails && (
				<section className={styles.drawerContainer}>
					<div className={styles.closeBtn}>
						<h2>Request details</h2>
						<CloseOutlined onClick={onClose} />
					</div>
										<div className={styles.drawerBtnContainer}>
						<button onClick={handleRequestClick} className={styles.drawerBtn}>Request to Meet</button>
						<button onClick={handleRemoveClick} className={styles.drawerBtn}>Remove from Matches</button>
					</div><br></br>
					<article className={styles.drawerArticle}>
						<h4 className={styles.drawerArticleTitle}>Details</h4>
						<p style={{ fontSize: '14px' }} className={styles.drawerArticleDescription} dangerouslySetInnerHTML={{ __html: stripStyles(marked(partnerDetails.richMerge || "")) }}></p>
					</article>
				</section>
			)}
		</Drawer>
	);
};

export default MatchPartnerDrawer;