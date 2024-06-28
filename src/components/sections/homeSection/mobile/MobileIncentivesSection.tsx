import React, {FC, useEffect, useState} from 'react';
import {List, Checkbox, InputNumber, Button, Tooltip, Pagination, Menu, Dropdown} from 'antd';
import styles from "./styles.module.sass";

import {
    GetIncentiveDataType,
    useGetPartnersAndIncentivesContext,
    useIncentivesContext
} from "../contexts/IncentivesContext";
import {ReactComponent as Filter } from '../../../../images/svgIcons/filter.svg'
import {ReactComponent as ArrowUp} from '../../../../images/svgIcons/arrowUp.svg'
import {ReactComponent as ArrowDown} from '../../../../images/svgIcons/arrowDown.svg'
import {SorterResult} from "antd/es/table/interface";


const MobileIncentivesSection: FC = () => {
    const { addSelectedIncentive } = useIncentivesContext();
    const [currentPage, setCurrentPage] = useState(1);
    const [sortedInfo, setSortedInfo] = useState<SorterResult<GetIncentiveDataType>>({});
    const {incentiveFromSalesForce} = useGetPartnersAndIncentivesContext();
    const [filterCategory, setFilterCategory] = useState<string | null>(null);
    const [activeCheckboxes, setActiveCheckboxes] = useState<string[]>(['All']);
    const [data, setData] = useState<GetIncentiveDataType[]>([]);

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

    const handleAddClick = (item: GetIncentiveDataType) => {
        addSelectedIncentive(item);
    };

    const handleChangePage = (page: number) => {
        setCurrentPage(page);
    };


    let filteredData = [...incentiveFromSalesForce];

    if (activeCheckboxes.length && !activeCheckboxes.includes('All')) {
        filteredData = filteredData.filter(item => activeCheckboxes.includes(item.Product_Type__c));
    }

    useEffect(() => {

        incentiveFromSalesForce.sort((a, b) => a.incentive.localeCompare(b.incentive));

        let processedData = [...incentiveFromSalesForce];

        if (activeCheckboxes.length && !activeCheckboxes.includes('All')) {
            processedData = processedData.filter(item => activeCheckboxes.includes(item.Product_Type__c));
        }

        if (sortedInfo.columnKey) {
            processedData.sort((a, b) => {
                if (sortedInfo.columnKey === 'incentive') {
                    return sortedInfo.order === 'ascend'
                        ? a.incentive.localeCompare(b.incentive)
                        : b.incentive.localeCompare(a.incentive);
                }
                if (sortedInfo.columnKey === 'meetingsRequired') {
                    return sortedInfo.order === 'ascend'
                        ? a.meetingsRequired - b.meetingsRequired
                        : b.meetingsRequired - a.meetingsRequired;
                }
                return 0;
            });
        }

        const startIndex = (currentPage - 1) * 5;
        const endIndex = startIndex + 5;
        const paginatedData = processedData.slice(startIndex, endIndex);
        setData(paginatedData);
    }, [sortedInfo, currentPage, incentiveFromSalesForce, activeCheckboxes]);

    return (
        <section className={styles.incentivesContainer}>
            <Dropdown overlay={menu} trigger={['click']}>
                <button className={styles.filterBtn}>
                    <Filter />  Filter
                </button>
            </Dropdown>
            <List
                itemLayout="horizontal"
                dataSource={data}
                pagination={false}
                renderItem={(item) => (
                    <List.Item className={styles.listItemContainer}>
                        <div className={styles.listFirstColumn}>
                            <span>{item.incentive}</span>
                            <p>More Info</p>
                            <p>Meetings Required</p>
                            <Tooltip placement="right" title={'Click here to add an incentive. Click again to add more than one incentive '}><Button onClick={() => handleAddClick(item)} className={styles.addBtn} type="primary">Add</Button></Tooltip>
                        </div>
                        <div className={styles.listSecondColumn}>
                            <p>{item.moreInfo}</p>
                            <p>{item.meetingsRequired}</p>

                        </div>
                    </List.Item>
                )}
            />
            <Pagination defaultPageSize={5} className={styles.paginationIncentivesMobile} defaultCurrent={currentPage} total={filteredData.length} onChange={handleChangePage} />
        </section>
    );
}

export default MobileIncentivesSection;