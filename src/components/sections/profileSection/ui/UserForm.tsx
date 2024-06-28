import React, {useState, useEffect} from 'react';
import {useForm, Controller, SubmitHandler, UseFormRegister, useFormContext} from 'react-hook-form';
import {Modal, Drawer, Tag, message, Result} from 'antd';
import styles from '../styles.module.sass'
import {useMediaQuery} from "react-responsive";
import {fetchDataFromSalesForce} from "../../../../salesforceAuth";
import {NavLink, useParams} from "react-router-dom";
import {updateDataInSalesForce} from "../../../../salesforceAuth";


type FormData = {
    fullName?: string;
    email?: string;
    password: string;
    confirmPassword: string;
    memberPassword: string;
};

const UserForm: React.FC<{ setAvatarInitials: React.Dispatch<React.SetStateAction<string | null>> }> = ({ setAvatarInitials }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { register, handleSubmit, formState: { errors, isValid }, control, watch, reset} = useForm<FormData>({mode: "onChange"});
    const [data, setData] = useState<FormData []>([]);
    const [messageApi, contextHolder] = message.useMessage();
    const isMobile = useMediaQuery({ maxWidth: 610 })
    const { clientId } = useParams<{ clientId: string }>();
    const [error, setError] = useState<string | null>(null);

    const success = () => {
        messageApi.open({
            type: 'success',
            content: 'Password updated successfully!',
        });
    };

    const decline = () => {
        messageApi.open({
            type: 'success',
            content: 'Failed to update password. Please try again later.',
        });
    };

    useEffect(() => {
        async function fetchData() {
            try {
                const salesForceData = await fetchDataFromSalesForce(`query/?q=SELECT+Id,Member_Portal_Password__c,Full_Name__c,Email+FROM+Contact+WHERE+(Membership_Status__c = \'Active\'+OR+Membership_Status__c = \'Testing\')+AND+RecordTypeId = \'01236000000yGps\'+AND+Id='${clientId}'`);

                const transformedData = salesForceData.records.map((record: any) => ({
                    key: record.Id,
                    fullName: record.Full_Name__c,
                    email: record.Email,
                    memberPassword: record.Member_Portal_Password__c,
                }));
                setData(transformedData);
            } catch (error) {
                console.log(error)
                setError('Failed')

            }
        }

        void fetchData();
    }, [clientId]);


    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        reset();
        setIsModalOpen(false);
    };

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        const endpoint = `/sobjects/Contact/${clientId}`;
        const updateData = {
            Member_Portal_Password__c: data.password
        };

        try {
            await updateDataInSalesForce(endpoint, updateData);
            handleOk();
            success()
        } catch (error) {
            console.error('Failed to update password:', error);
            decline()
        }
    };

    const password = watch('password', '');
    const confirmPassword = watch('confirmPassword', '');


    return (
        <div className={styles.formContainer}>
            {contextHolder}
            <h2 className={styles.formContainerTitle}>My account</h2>
            <hr/>
            <h4 className={styles.formContainerSubTitle}>Personal information</h4>

                <div className={styles.inputContainer}>
                    <small className={styles.inputLabel}>Full Name</small>
                    <p className={styles.input}>{data[0]?.fullName || 'Loading...'}</p>
                </div>
                <div className={styles.inputContainer}>
                    <small className={styles.inputLabel}>Email</small>
                    <p className={styles.input}>{data[0]?.email || 'Loading...'}</p>
                </div>
                <hr style={{opacity: '50%'}}/>
                <h4 className={styles.formContainerSubTitle}>Account changes</h4>
                <p>Password</p>
                {data[0]?.memberPassword ? (
                    <p className={styles.passwordDescription}>You can change password</p>

                ) : (
                    <p className={styles.passwordDescription}>You can set a permanent password if you don't want to use temporary login codes.</p>
                )}
                <button onClick={showModal} className={styles.setPasswordBtn}>{data[0]?.memberPassword ? "Change Password" : "Set Password"}</button>
                <hr style={{opacity: '50%'}}/>
                {isMobile ? (
                    <Drawer
                        footerStyle={{ border: 'none' }}
                        closeIcon={false}
                        width={'100%'}
                        placement="right"
                        onClose={handleCancel}
                        open={isModalOpen}
                    >
                        <section className={styles.setPasswordDrawer}>
                            <form>
                                <div className={styles.setPasswordDrawerTitle}>
                                    <h3>{data[0]?.memberPassword ? "Change Password" : "Set Password"}</h3>
                                </div>
                                <div className={styles.setPasswordDrawerForm}>
                                    <div className={styles.passwordInputContainer}>
                                        <label className={styles.inputLabel}>Create Password</label>
                                        <input
                                            placeholder={'Enter your password'}
                                            className={styles.input}
                                            type="password"
                                            {...register('password', {
                                                minLength: {
                                                    value: 8,
                                                    message: 'Password must be at least 8 characters',
                                                },
                                            })}
                                        />
                                        <div>{errors?.password && <p>{errors.password.message}</p>}</div>
                                    </div>
                                    <div className={styles.passwordInputContainer}>
                                        <label className={styles.inputLabel}>Confirm Password</label>
                                        <input
                                            placeholder={'Enter your password'}
                                            className={styles.input}
                                            type="password"
                                            {...register('confirmPassword', {
                                                validate: (value) =>
                                                    value === password || 'Passwords do not match',
                                            })}
                                        />
                                        <div>{errors?.confirmPassword && (
                                            <p>{errors.confirmPassword.message}</p>
                                        )}</div>
                                    </div>
                                    <div className={styles.setPasswordDrawerBtnContainer}>
                                        <button type={"button"} onClick={handleCancel} className={styles.cancelBtn}>Cancel</button>
                                        <button onClick={handleSubmit(onSubmit)} disabled={!password || password !== confirmPassword || !isValid} className={styles.saveBtn}>Save</button>
                                    </div>
                                </div>
                            </form>
                        </section>
                    </Drawer>
                ) : (
                    <Modal width={'665px'} centered={true} closeIcon={false} footer={null} open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                        <section className={styles.setPasswordModal}>
                            <form >
                                <div className={styles.setPasswordModalTitle}>
                                    <h3>{data[0]?.memberPassword ? "Change Password" : "Set Password"}</h3>
                                    <button type={"button"} onClick={handleCancel} className={styles.cancelBtn}>Cancel</button>
                                    <button onClick={handleSubmit(onSubmit)} disabled={!password || password !== confirmPassword || !isValid} className={styles.saveBtn}>Save</button>
                                </div>

                                <div className={styles.setPasswordModalForm}>
                                    <div className={styles.passwordInputContainer}>
                                        <label className={styles.inputLabel}>Create Password</label>
                                        <input
                                            placeholder={'Enter your password'}
                                            className={styles.input}
                                            type="password"
                                            {...register('password', {
                                                minLength: {
                                                    value: 8,
                                                    message: 'Password must be at least 8 characters',
                                                },
                                            })}
                                        />
                                        <div>{errors?.password && <p>{errors.password.message}</p>}</div>
                                    </div>
                                    <div className={styles.passwordInputContainer}>
                                        <label className={styles.inputLabel}>Confirm Password</label>
                                        <input
                                            placeholder={'Enter your password'}
                                            className={styles.input}
                                            type="password"
                                            {...register('confirmPassword', {
                                                validate: (value) =>
                                                    value === password || 'Passwords do not match',
                                            })}
                                        />
                                        <div>{errors?.confirmPassword && (
                                            <p>{errors.confirmPassword.message}</p>
                                        )}</div>
                                    </div>
                                </div>
                            </form>
                        </section>
                    </Modal>
                )}
        </div>
    );

}

export default UserForm;