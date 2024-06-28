import React, { useState, FC, useEffect } from "react";
import { Button, Drawer, Form, Input } from "antd";
import { useMediaQuery } from "react-responsive";
import styles from "./styles.module.sass";
import { CloseOutlined, EditOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import { updateDataInSalesForce } from "../../../salesforceAuth";

interface CharityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  contactInfo: any;
}

type FieldType = {
  charityName?: string;
  charityWebsite?: string;
};

const CharityDrawer: FC<CharityDrawerProps> = ({
  isOpen,
  onClose,
  contactInfo,
}) => {
  // console.log('-- contact info: ', contactInfo)
  const { clientId } = useParams<{ clientId: string }>();
  const [form] = Form.useForm();
  const [formData, setFormData] = useState<FieldType>({
    charityName: !!contactInfo.Non_Profit_Top_Choice__c
      ? contactInfo.Charity_Name__c
      : "",
    charityWebsite: "",
  });
  const [charityNameDisabled, setCharityNameDisabled] = useState(
    !!contactInfo.Non_Profit_Top_Choice__c
  );

  const isMobile = useMediaQuery({ maxWidth: 610 });
  const isTablet = useMediaQuery({ maxWidth: 1024 });

  useEffect(() => {
    setCharityNameDisabled(!!contactInfo.Non_Profit_Top_Choice__c);
    form.setFieldsValue({
      charityName: !!contactInfo.Non_Profit_Top_Choice__c
        ? contactInfo.Charity_Name__c
        : "",
      charityWebsite: "",
    });
  }, [form, contactInfo]);

  const onSubmit = async () => {
    try {
      const endpoint = `/sobjects/Contact/${clientId}`;
      const updateData = {
        Charity_Name_MP__c: formData.charityName,
        Charity_Website_MP__c: formData.charityWebsite,
      };

      try {
        await updateDataInSalesForce(endpoint, updateData);
        onClose();
        setCharityNameDisabled(true);
      } catch (error) {
        console.error("Failed to update password:", error);
      }
    } catch (error) {
      alert("Authorization error. Please try again later.");
    }
  };

  const onConfirm = () => {
    onClose();
  };

  const onUpdate = () => {
    setCharityNameDisabled(false);
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
            <h3>Your Charity</h3>
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
                autoComplete="off"
              >
                <div className={styles.charityRowContainer}>
                  {charityNameDisabled && (
                    <p>Charity Name: {contactInfo.Charity_Name__c}</p>
                  )}
                  {!charityNameDisabled && (
                    <Form.Item
                      className={styles.formItem}
                      label="Charity Name"
                      name="charityName"
                      required
                      rules={[{ message: "Please input your charity name!" }]}
                    >
                      <Input
                        disabled={charityNameDisabled}
                        placeholder={"Enter your charity name"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            charityName: e.target.value,
                          })
                        }
                      />
                    </Form.Item>
                  )}
                  {!!contactInfo.Non_Profit_Top_Choice__c && (
                    <EditOutlined
                      onClick={() => setCharityNameDisabled(false)}
                    />
                  )}
                </div>

                {!contactInfo.Non_Profit_Top_Choice__c && (
                  <Form.Item
                    className={styles.formItem}
                    label="Charity Website"
                    name="charityWebsite"
                    required
                    rules={[{ message: "Please input your charity website!" }]}
                  >
                    <Input
                      placeholder={"Enter your charity website"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          charityWebsite: e.target.value,
                        })
                      }
                    />
                  </Form.Item>
                )}
                {!charityNameDisabled && (
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      disabled={
                        !formData.charityName ||
                        (!contactInfo.Non_Profit_Top_Choice__c &&
                          !formData.charityWebsite)
                      }
                      className={styles.btn}
                      onClick={onSubmit}
                    >
                      Submit
                    </Button>
                  </Form.Item>
                )}
                {charityNameDisabled && (
                  <Form.Item>
                    <Button
                      style={{ marginRight: 16 }}
                      className={styles.btn}
                      type="primary"
                      htmlType="submit"
                      onClick={onConfirm}
                    >
                      Confirm
                    </Button>
                    <Button
                      className={styles.btn}
                      type="primary"
                      htmlType="submit"
                      onClick={onUpdate}
                    >
                      Update
                    </Button>
                  </Form.Item>
                )}
              </Form>
            </div>
          </div>
        </section>
      )}
    </Drawer>
  );
};

export default CharityDrawer;
