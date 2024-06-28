import {useState, FC, useEffect} from 'react';
import { Modal, Input, Checkbox, Empty} from 'antd';

import TreeCategories from "./ui/TreeCategories";
import styles from './styles.module.sass'
import {CloseOutlined, SearchOutlined} from "@ant-design/icons";
import {items} from './ui/TreeCategories'


interface PartnerModalProps {
    isModalOpen: boolean;
    onShowModal: () => void;
    onOk: () => void;
    OnCancel: () => void;
    onViewOnlyRequestedChange: (checked: boolean) => void;
    onApply: (searchValue: string, viewOnlyRequested: boolean, selectedCategories: string[]) => void;
}
const PartnerModal: FC<PartnerModalProps> = ({ isModalOpen, onShowModal, onOk, OnCancel, onViewOnlyRequestedChange, onApply}) => {
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


    return (
        <>
            <Modal width={'665px'} footer={null} closeIcon={false} open={isModalOpen} onOk={onOk} onCancel={OnCancel}>
               <section className={styles.modalContainer}>
                   <div className={styles.modalTitleContainer}>
                           <h3>Browse All Partner</h3>
                           <button onClick={() => {
                               onApply(inputValue, viewOnlyRequested, selectedCategories);
                               onOk();
                           }} className={styles.declineSubBtn}>Apply</button>
                           <button onClick={OnCancel} className={styles.cancelBtn}>Cancel</button>
                   </div>
                   <Input
                       size={'middle'}
                       prefix={inputValue === '' ? <SearchOutlined style={{ opacity: '40%', fontSize: '16px' }} /> : <span />}
                       bordered={false}
                       placeholder={"search by name, keywords, categories, ets"}
                       value={inputValue}
                       onChange={e => setInputValue(e.target.value)}
                   />
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
                                           <li key={category}>{category}</li>
                                       ))}
                                   </ul>
                               </>
                           ) : (
                               <Empty className={styles.empty} description={'no filter added'} image={false} />
                           )}
                       </div>
                   </div>
               </section>
            </Modal>
        </>
    );
};

export default PartnerModal;