import React, { FC, useEffect, useState } from 'react';
import { Space, Table, Pagination, Menu, Checkbox } from 'antd';
import type { ColumnsType, SorterResult } from 'antd/es/table/interface';
import { useGetPartnersAndIncentivesContext, useIncentivesContext, GetIncentiveDataType } from "./contexts/IncentivesContext";
import styles from './styles.module.sass'
import { fetchDataFromSalesForce } from '../../../salesforceAuth';
import { useParams } from 'react-router-dom';
import { getMemberInfoFromContact } from '../../../getSalesForceData';
import Link from 'antd/es/typography/Link';
import MatchPartnerDrawer, { MatchPartnersDataType } from './MatchPartnerDrawer';


const MatchesSection: FC = () => {
	const [currentPage, setCurrentPage] = useState(1);
	const [sortedInfo, setSortedInfo] = useState<SorterResult<GetIncentiveDataType>>({
		columnKey: 'incentive',
		order: 'ascend'
	});
	const { addSelectedIncentive } = useIncentivesContext();
	const { incentiveFromSalesForce } = useGetPartnersAndIncentivesContext();
	const [activeCheckboxes, setActiveCheckboxes] = useState<string[]>(['All']);
	const [data, setData] = useState<MatchPartnersDataType[]>([]);
	const { clientId } = useParams<{ clientId: string }>();
	const [matchData, setMatchData] = useState([])
	const [suveryLink, setSurveyLink] = useState<string>();
	const [richMerge, setRichMerge] = useState('');
	const [selectedPartner, setSelectedPartner] = useState<MatchPartnersDataType | null>(null);
	const [open, setOpen] = useState(false);

	const menuValues = Array.from(new Set(incentiveFromSalesForce.map(item => item.Product_Type__c)));
	const menuItems = ['All', ...menuValues];
	const menu = (
		<Menu style={{ maxHeight: '250px', overflowY: 'auto' }}>
			{menuItems.map((item, index) => (
				<Menu.Item key={index}>
					<Checkbox
						checked={activeCheckboxes.includes(item)}
						onClick={(e) => handleFilterChange(e, item)}
					>
						{item}
					</Checkbox>
				</Menu.Item>
			))}
		</Menu>
	);

	const handleFilterChange = (event: React.MouseEvent, category: string) => {
		event.stopPropagation(); // Останавливаем распространение события

		let updatedCheckboxes = [...activeCheckboxes];

		if (category === 'All') {
			updatedCheckboxes = ['All'];
		} else {
			if (updatedCheckboxes.includes('All')) {
				updatedCheckboxes = [];
			}
			if (updatedCheckboxes.includes(category)) {
				updatedCheckboxes = updatedCheckboxes.filter(item => item !== category);
			} else {
				updatedCheckboxes.push(category);
			}
		}

		setActiveCheckboxes(updatedCheckboxes);
	};

	const handleAddClick = (record: GetIncentiveDataType) => {
		addSelectedIncentive(record);
	};

	const handleChangePage = (page: number) => {
		setCurrentPage(page);
	};

	let filteredData = [...matchData];

	const showDrawer = async (partner: MatchPartnersDataType) => {
		setSelectedPartner(partner);
		try {
			const response = await fetchDataFromSalesForce(`query/?q=SELECT+Rich_Merge__c+FROM+Client_Pitch__c+WHERE+Active__c=true+AND+Custom_Outreach__c=true+AND+Client_Id__c='${partner.Partner_ID__c}'`);

			if (response && response.records && response.records[0] && response.records[0].Rich_Merge__c) {
				setSelectedPartner(prev => ({
					...prev!,
					richMerge: response.records[0].Rich_Merge__c
				}));
			} else {
				console.error("Invalid data format:", response);
			}
		} catch (error) {
			console.error("Error fetching partner details:", error);
		} finally {
		}

		setOpen(true);
	};

	const onCloseDrawer = () => {
		setSelectedPartner(null);
		setOpen(false);
		setTimeout(() => {
			fetchData();
		}, 5000);
	};

	useEffect(() => {
		let processedData = [...matchData];

		processedData.sort((a: any, b: any) => a.Partner_Name__c.localeCompare(b.Partner_Name__c));

		const startIndex = (currentPage - 1) * 10;
		const endIndex = startIndex + 10;
		const paginatedData = processedData.slice(startIndex, endIndex);
		setData(paginatedData);
	}, [sortedInfo, currentPage, matchData, activeCheckboxes]);

	async function fetchData() {
		try {
			const salesForceData = await fetchDataFromSalesForce(`query/?q=SELECT+Id,Partner_Name__c,Matching_Topic_Partner__c,Member_Contact__c,Client_Campaign_ID__c,Account_ID__c,Partner_Id__c,Portal_Email__c,Removed_by_Member__c,Member_Responded__c+FROM+Survey_Match__c+WHERE+Member_Contact__c='${clientId}'+AND+Removed_by_Member__c=false+AND+Portal_Email__c=true+AND+Member_Responded__c=false`);
			setMatchData(salesForceData.records)
			const contactInfo = await getMemberInfoFromContact(`${clientId}`);
			if (contactInfo) {
				setSurveyLink(contactInfo?.Member_Survey_Link__c);
			}
		} catch (error) {
			console.error('Failed to fetch data:', error);
		}
	}
	useEffect(() => {
		void fetchData();
	}, []);


	const columns: ColumnsType<MatchPartnersDataType> = [
		{
			title: 'Partner Name',
			dataIndex: 'Partner_Name__c',
			key: 'Partner_Name__c',
		},
		{
			title: 'Matching Priorities/Projects',
			dataIndex: 'Matching_Topic_Partner__c',
			key: 'Matching_Topic_Partner__c',
		}
	];
	return (

		<section className={styles.incentivesContainer}>
			<div className={styles.incentivesTitleContainer}>
				<div className={styles.incentivesTitle}>
					<h2>Partners Matching your Priorities/Projects</h2>
					{data.length > 0 && <Link target='_blank' href={suveryLink}><p>Click here to update your survey responses</p></Link>}
					{data.length == 0 && <Link target='_blank' href={suveryLink}><p>Fill out our member survey to see matches below</p></Link>}
				</div>
			</div>
			<Space style={{ marginBottom: 16 }}>
			</Space>
			{data.length > 0 &&
				<>
					<Table
						columns={columns}
						pagination={false}
						size={"middle"}
						dataSource={data}
						className={`${styles.table}`}
						onRow={(record) => ({
							onClick: () => showDrawer(record)
						})}
						bordered
					/>
					<Pagination showSizeChanger={false} defaultPageSize={10} className={styles.paginationIncentives} defaultCurrent={currentPage} total={filteredData.length} onChange={handleChangePage} />
					<MatchPartnerDrawer
						isOpen={open}
						onClose={onCloseDrawer}
						partnerDetails={selectedPartner}
					/>
				</>
			}
		</section>
	);
}

export default MatchesSection
