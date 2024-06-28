import React, { useState, FC, useEffect } from "react";
import { Button, Drawer, Form, Input } from "antd";
import { useMediaQuery } from "react-responsive";
import styles from "./styles.module.sass";
import { CloseOutlined, EditOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import {
  createDataInSalesForce,
  updateDataInSalesForce,
} from "../../../salesforceAuth";
import { useIncentivesContext } from "../homeSection/contexts/IncentivesContext";

interface CheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  contactInfo: any;
  totalPoints: number;
}

type FieldType = {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
};

const CheckoutDrawer: FC<CheckoutDrawerProps> = ({
  isOpen,
  onClose,
  contactInfo,
  totalPoints,
}) => {
  const { clientId } = useParams<{ clientId: string }>();
  const [form] = Form.useForm();

  const [formData, setFormData] = useState<FieldType>({
    street: contactInfo?.Mailing_Address_Verified_Date__c
      ? contactInfo?.MailingStreet
      : "",
    city: contactInfo?.Mailing_Address_Verified_Date__c
      ? contactInfo?.MailingCity
      : "",
    state: contactInfo?.Mailing_Address_Verified_Date__c
      ? contactInfo?.MailingState
      : "",
    postalCode: contactInfo?.Mailing_Address_Verified_Date__c
      ? contactInfo?.MailingPostalCode
      : "",
    country: contactInfo?.Mailing_Address_Verified_Date__c
      ? contactInfo?.MailingCountry
      : "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const incentiveContext = useIncentivesContext();
  const cartItems = incentiveContext.cartItems || [];

  const isMobile = useMediaQuery({ maxWidth: 610 });
  const isTablet = useMediaQuery({ maxWidth: 1024 });

  useEffect(() => {
    form.setFieldsValue({
      street: contactInfo.Mailing_Address_Verified_Date__c
        ? contactInfo.MailingStreet
        : "",
      city: contactInfo.Mailing_Address_Verified_Date__c
        ? contactInfo.MailingCity
        : "",
      state: contactInfo.Mailing_Address_Verified_Date__c
        ? contactInfo.MailingState
        : "",
      postalCode: contactInfo.Mailing_Address_Verified_Date__c
        ? contactInfo.MailingPostalCode
        : "",
      country: contactInfo.Mailing_Address_Verified_Date__c
        ? contactInfo.MailingCountry
        : "",
    });
  }, [form, contactInfo]);

  const onFinish = async (values: any) => {
    try {
      setIsLoading(true);

      // Constructing incentiveData based on cartItems and customizationList
      const incentiveDataList = cartItems.map((item: any, index: number) => ({
        Incentive__c: item.incentiveId,
        Points__c: item.Points__c,
        Member_Contact__c: clientId,
        Customization__c: item.Customization__c || null, // Using null if no customization found
      }));

      console.log("incentiveDataList", incentiveDataList);

      // Update Contact data
      const endpoint = `/sobjects/Contact/${clientId}`;
      const updateData = {
        Mailing_Address_Verified_Date__c: new Date(),
        MailingStreet: values.street,
        MailingCity: values.city,
        MailingState: values.state,
        MailingPostalCode: values.postalCode,
        MailingCountry: values.country,
      };

      console.log("Data Of CheckOut", updateData); // checkout data and address
      console.log("incentiveDataList", incentiveDataList); // incentive data
      try {
        // Update Contact data in Salesforce
        await updateDataInSalesForce(endpoint, updateData);

        // Create Member_Incentive__c records in Salesforce
        for (const incentiveData of incentiveDataList) {
          await createDataInSalesForce(
            `/sobjects/Member_Incentive__c/`,
            incentiveData
          );
        }

        // Reset cart items, close modal, and reset loading state
        incentiveContext.setCartItems([]);
        onClose();
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to update password:", error);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching data from Salesforce:", error);
      alert("Authorization error. Please try again later.");
      setIsLoading(false);
    }
  };

  return (
    <Drawer
      footerStyle={{ border: "none" }}
      closeIcon={false}
      width={isMobile ? "100%" : isTablet ? "60%" : "30%"}
      placement="right"
      onClose={onClose}
      open={isOpen}
    >
      {contactInfo && (
        <section className={styles.incentiveDetailsDrawerContainer}>
          <div className={styles.drawerTitle}>
            <h3>Checkout</h3>
            <CloseOutlined onClick={onClose} />
          </div>
          <div>
            <div className={styles.formContainer}>
              <Form
                form={form}
                className={styles.form}
                name="basic"
                layout={"vertical"}
                initialValues={{ remember: true }}
                onFinish={onFinish}
                autoComplete="off"
              >
                <Form.Item
                  className={styles.formItem}
                  label="Street Address"
                  name="street"
                  required
                  rules={[
                    {
                      required: true,
                      message: "Please input your charity name!",
                    },
                  ]}
                >
                  <Input
                    placeholder={"Enter your street"}
                    onChange={(e) =>
                      setFormData({ ...formData, street: e.target.value })
                    }
                  />
                </Form.Item>
                <Form.Item
                  className={styles.formItem}
                  label="City"
                  name="city"
                  required
                  rules={[
                    { required: true, message: "Please input your city" },
                  ]}
                >
                  <Input
                    placeholder={"Enter your city"}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                  />
                </Form.Item>
                <Form.Item
                  className={styles.formItem}
                  label="State"
                  name="state"
                  required
                  rules={[
                    { required: true, message: "Please input your state" },
                  ]}
                >
                  <Input
                    placeholder={"Enter your state"}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                  />
                </Form.Item>
                <Form.Item
                  className={styles.formItem}
                  label="Zip code"
                  name="postalCode"
                  required
                  rules={[
                    { required: true, message: "Please input your zip code" },
                  ]}
                >
                  <Input
                    placeholder={"Enter your Zip code"}
                    onChange={(e) =>
                      setFormData({ ...formData, postalCode: e.target.value })
                    }
                  />
                </Form.Item>
                <Form.Item
                  className={styles.formItem}
                  label="Country"
                  name="country"
                  required
                  rules={[
                    { required: true, message: "Please input your country" },
                  ]}
                >
                  <Input
                    placeholder={"Enter your country"}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    loading={isLoading}
                    type="primary"
                    htmlType="submit"
                    disabled={
                      !formData.street ||
                      !formData.city ||
                      !formData.state ||
                      !formData.postalCode ||
                      !formData.country
                    }
                    className={styles.btn}
                  >
                    {`${
                      contactInfo?.Mailing_Address_Verified_Date__c
                        ? "Confirm"
                        : "Submit"
                    }`}
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </div>
        </section>
      )}
    </Drawer>
  );
};

export default CheckoutDrawer;
