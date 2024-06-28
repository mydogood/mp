import React, {FC, useState, ChangeEvent} from 'react';
import {useMediaQuery} from "react-responsive"
import {Checkbox, Drawer, Empty, Input} from 'antd';
import styles from './styles.module.sass'
import {CloseOutlined, SearchOutlined} from "@ant-design/icons";

import TreeCategories, {items} from "../ui/TreeCategories";


interface PartnerDrawerProps {
    isOpenFilter: boolean;
    onCloseFilter: () => void;
    onViewOnlyRequestedChange: (checked: boolean) => void;
    onApply: (searchValue: string, viewOnlyRequested: boolean, selectedCategories: string[]) => void;
}
const PartnerDrawer: FC<PartnerDrawerProps> = ({ isOpenFilter, onCloseFilter, onViewOnlyRequestedChange, onApply }) => {
    const [inputPrefix, setInputPrefix] = useState<string>('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [checkboxStates, setCheckboxStates] = useState<Record<string, boolean>>({});
    const [viewOnlyRequested, setViewOnlyRequested] = useState(true);
    const [resetCheckboxes, setResetCheckboxes] = useState(false);
    const [inputValue, setInputValue] = useState('');

    const handleClearAll = () => {
        setSelectedCategories([]);
        setResetCheckboxes(true);
    };

    const handleSelectText = (text: string, checked: boolean) => {
        setCheckboxStates(prevState => ({
            ...prevState,
            [text]: checked
        }));

        if (text === 'Select All') {
            if (checked) {
                setSelectedCategories(
                    items
                        .flatMap(item => (item.children || []).map(child => child.text))
                        .filter(category => category !== 'Select All')
                );
            } else {
                setSelectedCategories([]);
            }
        } else {
            setSelectedCategories(prevSelected =>
                checked
                    ? [...prevSelected, text]
                    : prevSelected.filter(category => category !== text)
            );
        }
    };
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setInputPrefix(e.target.value);
    };


    return (
        <Drawer
            footerStyle={{ border: 'none' }}
            closeIcon={false}
            width={'100%'}
            placement="right"
            onClose={onCloseFilter}
            open={isOpenFilter}
        >
            <section className={styles.modalContainer}>
                <div className={styles.modalTitleContainer}>
                    <h3>Browse All Partner</h3>
                </div>
                <div className={styles.inputContainer}>
                <Input onChange={e => setInputValue(e.target.value)} prefix={inputValue === '' ? <SearchOutlined style={{ opacity: '40%', fontSize: '16px' }} /> : <span />} bordered={false} placeholder={"search by name, keywords, categories, ets"} value={inputValue}  />
                </div>
                <div className={styles.filterContainer}>
                    <div className={styles.dropdownContainer}>
                        <TreeCategories onSelectText={handleSelectText} resetCheckboxes={resetCheckboxes} setResetCheckboxes={setResetCheckboxes} />
                        <Checkbox onChange={(e) => {
                            setViewOnlyRequested(e.target.checked);
                            onViewOnlyRequestedChange(e.target.checked);
                        }} defaultChecked={true} className={styles.reqCheck}>View only partners who have requested to meet</Checkbox>
                    </div>
                    <div className={styles.filterListContainer}>
                        {selectedCategories.length > 0 ? (
                            <>
                                <div className={styles.controlFilterList}>
                                    <p>Added filters:</p>
                                    <button onClick={handleClearAll}>Clear all</button>
                                </div>
                                <ul className={styles.filterList}>
                                    {selectedCategories.map((category) => (
                                        <li key={category}>{category} <CloseOutlined
                                            className={styles.listCloseIcon}/></li>
                                    ))}
                                </ul>
                            </>
                        ) : (
                            <Empty className={styles.empty} description={'no filter added'} image={false} />
                        )}
                    </div>
                    <div className={styles.btnContainer}>
                        <button onClick={onCloseFilter} className={styles.cancelBtn}>Cancel</button>
                        <button onClick={() => {
                            onApply(inputValue, viewOnlyRequested, selectedCategories);
                            onCloseFilter();
                        }} className={styles.applyBtn}>Apply</button>
                    </div>
                </div>
            </section>
        </Drawer>
    );
};

export default PartnerDrawer;