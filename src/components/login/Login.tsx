import React, {FC, useEffect, useState} from 'react';
import { Button, Checkbox, Form, Input, message } from 'antd';
import {useNavigate, useParams} from "react-router-dom";
import {useMediaQuery} from "react-responsive";
import {ReactComponent as LogoImg} from '../../images/svgIcons/do_good_logo_login.svg'
import styles from './style.module.sass'
import {fetchDataFromSalesForce} from "../../salesforceAuth";


const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
};

type FieldType = {
    email?: string;
    password?: string;
};

interface Login {
    key: string
}

const Login: FC = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [messageApi, contextHolder] = message.useMessage();
    const [emailData, setEmailData] = useState({
        to: 'scoakley@mydogood.com',
        subject: 'Need help logging into member portal',
        body: 'I need help logging into the DoGood member portal.',
    });

    const error = () => {
        messageApi.open({
            type: 'error',
            content: 'Click the "Need help logging in?',
        });
    };

    const navigate = useNavigate();

    useEffect(() => {
        const storedClientId = localStorage.getItem('clientId');

        if (storedClientId) {
            navigate(`/${storedClientId}/profile`, { replace: true });
        }
    }, []);


    const onFinish = async (values: any) => {
        try {
            const query = `query/?q=SELECT+Id,Email,Member_Portal_Password__c+FROM+Contact+WHERE+RecordTypeId='01236000000yGps'+AND+(Membership_Status__c='Active'+OR+Membership_Status__c='Testing')+AND+Email='${formData.email}'+AND+Member_Portal_Password__c='${formData.password}'`;
            const salesForceData = await fetchDataFromSalesForce(`${query}`);

            if (salesForceData.records.length === 1) {
                const clientId = salesForceData.records[0].Id;
                localStorage.setItem('clientId', clientId);
                navigate(`/${clientId}/home`, {replace: true});
            } else {
                error()
            }
        } catch (error) {
            alert('Authorization error. Please try again later.');
        }
    };

    return (
        <section className={styles.loginSection}>
            {contextHolder}
            <article className={styles.formSection}>
                <LogoImg/>
                <h1 className={styles.title}>Log in</h1>
                <div className={styles.formContainer}>
                    <Form
                        className={styles.form}
                        name="basic"
                        layout={'vertical'}
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                    >
                        <Form.Item<FieldType>
                            className={styles.formItem}
                            label="Email"
                            name="email"
                            rules={[{ message: 'Please input your username!' }]}
                        >
                            <Input placeholder={'Enter your email associated with DoGood'} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        </Form.Item>

                        <Form.Item<FieldType>
                            className={styles.formItem}
                            label="Password"
                            name="password"
                            rules={[{ message: 'Please input your password!' }]}
                        >
                            <Input.Password placeholder={'Enter your password'} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                        </Form.Item >
                        <a
                            className={styles.helpLink}
                            href={`mailto:${emailData.to}?subject=${emailData.subject}&body=${emailData.body}`}
                            target="_blank"
                        >
                            Need help logging in?
                        </a>
                        <Form.Item>
                            <Button className={styles.btn} type="primary" htmlType="submit">
                                Log in
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </article>
        </section>
    );
};

export default Login;