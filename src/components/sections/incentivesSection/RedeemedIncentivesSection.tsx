import React, { FC, useEffect, useState } from 'react';
import { Space, Table, Pagination, Menu, Checkbox, List, Row, Col } from 'antd';
import type { ColumnsType, SorterResult } from 'antd/es/table/interface';
import styles from './styles.module.sass'
import { fetchDataFromSalesForce } from '../../../salesforceAuth';
import { useParams } from 'react-router-dom';
import { getMemberInfoFromContact } from '../../../getSalesForceData';
import Link from 'antd/es/typography/Link';


const RedeemedIncentivesSection: FC = () => {
	const [currentPage, setCurrentPage] = useState(1);
	const [activeCheckboxes, setActiveCheckboxes] = useState<string[]>(['All']);
	const [data, setData] = useState<any[]>([]);
	const { clientId } = useParams<{ clientId: string }>();
	const [matchData, setMatchData] = useState([])
	const [suveryLink, setSurveyLink] = useState<string>();
	const [richMerge, setRichMerge] = useState('');
	const [selectedPartner, setSelectedPartner] = useState<any | null>(null);
	const [open, setOpen] = useState(false);

	const handleChangePage = (page: number) => {
		setCurrentPage(page);
	};

	let filteredData = [...matchData];

	const onCloseDrawer = () => {
		setSelectedPartner(null);
		setOpen(false);
		setTimeout(() => {
			fetchData();
		}, 5000);
	};

	useEffect(() => {
		let processedData = [...matchData];

		processedData.sort((a: any, b: any) => a.Incentive_Copy__c.localeCompare(b.Incentive_Copy__c));

		const startIndex = (currentPage - 1) * 10;
		const endIndex = startIndex + 10;
		const paginatedData = processedData.slice(startIndex, endIndex);
		setData(paginatedData);
	}, [currentPage, matchData, activeCheckboxes]);

	async function fetchData() {
		try {
			const salesForceData = await fetchDataFromSalesForce(`query/?q=SELECT+Incentive_Copy__c,Points__c,CreatedDate,Shipment_Status__c,Favorite__c,Incentive__c+FROM+Member_Incentive__c+WHERE+Member_Contact__c='${clientId}'+AND+Requirements_Fulfilled__c=true`);
			setMatchData(salesForceData.records)
		} catch (error) {
			console.error('Failed to fetch data:', error);
		}
	}
	useEffect(() => {
		void fetchData();
	}, []);

	function formatDate(date: any) {
		return (new Date(date)).toISOString().split('T')[0]; // YYYY-MM-DD format
	}

	const columns: ColumnsType<any> = [
		{
			title: 'Incentive Name',
			dataIndex: 'Incentive_Copy__c',
			key: 'Incentive_Copy__c',
		},
		{
			title: 'Status',
			dataIndex: 'Shipment_Status__c',
			key: 'Shipment_Status__c',
		}
	];
	return (

		<section className={styles.incentivesContainer}>
			{data.length > 0 &&
				<>
					{/* <Table
						columns={columns}
						pagination={false}
						size={"middle"}
						dataSource={data}
						className={`${styles.table}`}
						bordered
					/>
					<Pagination showSizeChanger={false} defaultPageSize={10} className={styles.paginationIncentives} defaultCurrent={currentPage} total={filteredData.length} onChange={handleChangePage} /> */}
					<section className={styles.redeemIncentivesListContainer}>
						<List
							itemLayout="horizontal"
							dataSource={data}
							pagination={false}
							renderItem={(item) => (
								<List.Item>
									<div className={styles.redeemListItemContainer}>
										<Row>
											<Col span={24}>
												<h3>{item.Incentive_Copy__c}</h3>
											</Col>
											<Col span={15}>
												<p>Status</p>
											</Col>
											<Col span={9}>
												<p>{item.Shipment_Status__c}</p>
											</Col>
											<Col span={15}>
												<p>Points</p>
											</Col>
											<Col span={9}>
												<p>{item.Points__c}</p>
											</Col>
											<Col span={15}>
												<p>Sent Date</p>
											</Col>
											<Col span={9}>
												<p>{formatDate(item.CreatedDate)}</p>
											</Col>
										</Row>

									</div>
								</List.Item>
							)}
						/>
					</section>
				</>
			}
		</section>
	);
}

export default RedeemedIncentivesSection