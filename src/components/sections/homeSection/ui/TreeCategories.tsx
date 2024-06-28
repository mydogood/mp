import React, {useEffect, useState} from 'react';
import type { MenuProps } from 'antd';
import {Menu, Checkbox, Collapse, Tag} from 'antd';
import {useMediaQuery} from "react-responsive"
import {fetchDataFromSalesForce} from "../../../../salesforceAuth";
import {usePartnerContext} from "../contexts/IncentivesContext";
import styles from "../../meetingsSection/styles.module.sass";
const { Panel } = Collapse;

type MenuItem = {
    key: string;
    children?: MenuItem[];
    label: React.ReactNode;
    type?: 'group';
    checked?: boolean;
    text: string;
};

function getItem(
    label: React.ReactNode,
    key: string,
    text: string,
    children?: MenuItem[],
    type?: 'group',
    checked?: boolean
): MenuItem {
    return {
        key,
        children,
        label,
        type,
        checked,
        text
    } as MenuItem;
}

interface TreeCategoriesProps {
    onSelectText: (text: string, checked: boolean) => void;
    resetCheckboxes: boolean;
    setResetCheckboxes: React.Dispatch<React.SetStateAction<boolean>>;
}

export const items: MenuItem[] = [
    getItem(<span>Account Based Marketing</span>, 'sub1', '',[
        getItem(<span>Select All</span>, '1', 'Select All', [], 'group', false),
        getItem(<span>Account Based Marketing Software</span>, '2', 'Account Based Marketing Software', [], 'group', false ),
        getItem(<span>Account Based Analytics Software</span>, '3', 'Account Based Analytics Software', [], 'group', false),
        getItem(<span>Account Based Data Software</span>, '4', 'Account Based Data Software', [], 'group', false),
        getItem(<span>Buyer Intent Data Providers</span>, '5', 'Buyer Intent Data Providers', [], 'group', false),
    ]),
    getItem(<span>IT Security</span>, 'sub2', 'IT Security'),
    getItem(<span>IT Management</span>, 'sub3', 'IT Management'),
    getItem(<span>Analytics Tools & Software</span>, 'sub4', 'Analytics Tools & Software')
];


const TreeCategories: React.FC<TreeCategoriesProps> = ({ onSelectText, resetCheckboxes, setResetCheckboxes }) => {
    const [openKeys, setOpenKeys] = useState(['sub1', 'sub2', 'sub3', 'sub4']);
    const [selectedCheckboxes, setSelectedCheckboxes] = useState<Record<string, boolean>>({
        'Select All': false
    });
    const [selectAllChecked, setSelectAllChecked] = useState(false);
    const [data, setData] = useState<MenuItem[]>([]);
    const [magicQuadrantData, setMagicQuadrantData] = useState<MenuItem[]>([]);
    const { savedAcceptedList} = usePartnerContext();
    const rootSubmenuKeys = ['sub1'];
    const isMobile = useMediaQuery({ maxWidth: 610 })

    const transformData = (records: any[]): { mainItems: MenuItem[], magicQuadrantItems: MenuItem[] } => {
        const categoryMap = new Map();
        const magicQuadrantItems: MenuItem[] = [];

        const allPartnerCategories = Array.from(new Set(savedAcceptedList.flatMap(partner =>
            Array.isArray(partner.Survey_Option_Name__c) ? partner.Survey_Option_Name__c : []
        )));

        records.forEach(record => {
            const categoryName = record.Main_Category__c;
            const subCategoryName = record.Survey_Option_Copy__c;
            const subCategoryKey = record.Id;

            if (!allPartnerCategories.includes(subCategoryName)) {
                return;
            }

            const item = getItem(
                <span>{subCategoryName}</span>,
                subCategoryKey,
                subCategoryName,
                [],
                "group",
                false
            );

            if (categoryName === "Gartner Magic Quadrant") {
                magicQuadrantItems.push(item);
                return; // Пропустим оставшуюся часть цикла для этого элемента
            }

            if (!categoryMap.has(categoryName)) {
                categoryMap.set(categoryName, getItem(
                    <span>{categoryName}</span>,
                    categoryName.replace(/\s/g, "_"),
                    categoryName,
                    []
                ));
            }

            const categoryItem = categoryMap.get(categoryName);
            if (categoryItem.children) {
                categoryItem.children.push(item);
            }
        });

        return {
            mainItems: Array.from(categoryMap.values()),
            magicQuadrantItems

        };
    };



    useEffect(() => {
        async function fetchData() {
            try {
                const salesForceData = await fetchDataFromSalesForce(`query/?q=SELECT+Id,Survey_Option_Copy__c,Main_Category__c+FROM+Survey_Option__c+WHERE+Active_Count__c>0`);
                const transformedData = transformData(salesForceData.records);
                setData(transformedData.mainItems);
                setMagicQuadrantData(transformedData.magicQuadrantItems); // Предполагая, что у вас есть соответствующий useState для этого
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        }

        void fetchData();
    }, []);

    const onOpenChange: MenuProps['onOpenChange'] = (keys) => {
        const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
        if (rootSubmenuKeys.indexOf(latestOpenKey!) === -1) {
            setOpenKeys(keys);
        } else {
            setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
        }
    };

    const handleCheckboxChange = (text: string, checked: boolean) => {
        if (text === 'Select All') {
            const updatedCheckboxes: Record<string, boolean> = {};

            items.forEach(item => {
                if (item.children) {
                    item.children.forEach(child => {
                        updatedCheckboxes[child.text] = checked;
                    });
                }
            });

            setSelectedCheckboxes(updatedCheckboxes);
            setSelectAllChecked(checked);
            onSelectText(text, checked);
        } else {
            setSelectedCheckboxes(prevState => ({
                ...prevState,
                [text]: checked
            }));

            setSelectAllChecked(Object.values(selectedCheckboxes).every(checked => checked));
            onSelectText(text, checked);
        }

    };

    useEffect(() => {
        // Обработка сброса состояния чекбоксов при изменении resetCheckboxes
        if (resetCheckboxes) {
            setSelectedCheckboxes({ 'Select All': false });
            setSelectAllChecked(false);
            onSelectText('Select All', false);
            setResetCheckboxes(false); // Сбрасываем флаг сразу после сброса
        }
    }, [resetCheckboxes, setResetCheckboxes]);

    return (
        <Collapse bordered={false} expandIconPosition={'end'}>
            <Panel header="Product / Service Categories" key="1">
                <Menu
                    mode={isMobile ? 'inline' : 'vertical'}
                    openKeys={openKeys}
                    onOpenChange={onOpenChange}
                    style={{ width: 300}}
                    multiple={true}
                >
                    {data.map((item) => (
                        <Menu.SubMenu key={item.key} title={item.label}>
                            {item.children?.map((child) => (
                                <Menu.Item key={child.key}>
                                    <Checkbox
                                        checked={child.text === 'Select All' ? selectAllChecked : selectedCheckboxes[child.text]}
                                        onChange={(e) => handleCheckboxChange(child.text, e.target.checked)}
                                    >
                                        {child.label}
                                    </Checkbox>
                                </Menu.Item>
                            ))}
                        </Menu.SubMenu>
                    ))}
                </Menu>

            </Panel>
            <Panel style={{borderBottom: '1px solid lightgrey'}} header="Gather Magic Quadrant" key="3">
                <div style={{display: 'flex', flexDirection: 'column'}}>
                {magicQuadrantData.map((item) => (
                    <Checkbox
                        key={item.key}
                        checked={item.text === 'Select All' ? selectAllChecked : selectedCheckboxes[item.text]}
                        onChange={(e) => handleCheckboxChange(item.text, e.target.checked)}
                    >
                        {item.label}
                    </Checkbox>
                ))}
                </div>
            </Panel>
        </Collapse>
    );
};

export default TreeCategories;