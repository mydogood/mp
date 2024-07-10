import React, { useState, FC, ChangeEvent } from "react";
import { Button, Modal, Input, Checkbox, Empty, Drawer } from "antd";
import { useMediaQuery } from "react-responsive";

import styles from "../styles.module.sass";
import { SearchOutlined } from "@ant-design/icons";
interface partnerQuestion {
  question: string;
}

interface AcceptModalProps {
  isAcceptModalOpen: boolean;
  onAcceptShowModal: () => void;
  onAccept: () => void;
  OnAcceptCancel: () => void;
  setInterestTextAvailability: (value: string) => void;
  interestTextAvailability: string;
  interestText: string;
  setInterestText: (value: string) => void;
  onCheckboxChange: (value: string) => void;
  selectedCheckbox: string | null;
  acceptMeetings: partnerQuestion | null;
}

const AcceptRequestModal: FC<AcceptModalProps> = ({
  isAcceptModalOpen,
  onAcceptShowModal,
  onAccept,
  OnAcceptCancel,
  interestTextAvailability,
  setInterestTextAvailability,
  setInterestText,
  interestText,
  onCheckboxChange,
  selectedCheckbox,
  acceptMeetings,
}) => {
  const [inputValue, setInputValue] = useState("");
  const isMobile = useMediaQuery({ maxWidth: 610 });
  const isSubmitDisabled = interestTextAvailability.trim() === "";
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleCheckboxChange = (value: string) => {
    onCheckboxChange(value); // Call a function from the props when the checkbox changes
  };

  return (
    <>
      {isMobile ? (
        <Drawer
          style={{ borderTopLeftRadius: "5%", borderTopRightRadius: "5%" }}
          placement={"bottom"}
          closeIcon={false}
          push={false}
          onClose={onAccept}
          open={isAcceptModalOpen}
        >
          <section className={styles.mobileRequestModalContainer}>
            <div className={styles.modalTitleContainer}>
              <h3>Please answer the following before moving forward with
              this acceptance:</h3>
            </div>
            <div className={styles.modalButtonsContainer}>
                <button onClick={onAccept} className={styles.declineSubBtn}>
                  Submit
                </button>
                <button onClick={OnAcceptCancel} className={styles.cancelBtn}>
                  Cancel
                </button>
              </div>
            <small>{acceptMeetings?.question}</small>
            <div>
              <div className={styles.checkboxContainer}>
                <Checkbox
                  className={styles.reqCheck}
                  checked={selectedCheckbox === "Yes"}
                  onChange={() => handleCheckboxChange("Yes")}
                >
                  Yes
                </Checkbox>
                <Checkbox
                  className={styles.reqCheck}
                  checked={selectedCheckbox === "No"}
                  onChange={() => handleCheckboxChange("No")}
                >
                  No
                </Checkbox>
              </div>
            </div>
            <div>
              <small>
                Please note: if you answer "No", this meeting will be declined.
              </small>
            </div>
            <div>
              {selectedCheckbox === "Yes" && (
                <>
                  <div>
              <small>Please share why you would like to meet with this partner:</small>
              <div className={styles.mobileInputContainer}>
              <Input
                bordered={false}
                placeholder={" "}
                value={interestText}
                onChange={(e) => setInterestText(e.target.value)}
              />
            </div>
            </div>
                  <div>
                  <small><b>Share your upcoming availability below or just click Submit.</b></small>
                    <div className={styles.checkboxContainer}>
                      <Input
                        bordered={false}
                        placeholder={"Enter availability here"}
                        value={interestTextAvailability}
                        onChange={(e) =>
                          setInterestTextAvailability(e.target.value)
                        }
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
        </Drawer>
      ) : (
        <Modal
          maskClosable={false}
          centered={true}
          width={"665px"}
          footer={null}
          closeIcon={false}
          open={isAcceptModalOpen}
          onOk={onAcceptShowModal}
          onCancel={onAccept}
        >
          <section className={styles.modalContainer}>
            
            <div>
            <h4>
                Please answer the following before moving forward with this acceptance:</h4></div>
                <section className={styles.modalContainer}>
            <small>{acceptMeetings?.question}</small>
            <div>
              <div className={styles.checkboxContainer}>
                <Checkbox
                  className={styles.reqCheck}
                  checked={selectedCheckbox === "Yes"}
                  onChange={() => handleCheckboxChange("Yes")}
                >
                  Yes
                </Checkbox>
                <Checkbox
                  className={styles.reqCheck}
                  checked={selectedCheckbox === "No"}
                  onChange={() => handleCheckboxChange("No")}
                >
                  No
                </Checkbox>
              </div>
            </div><div>&nbsp;</div>
            <div>
              <small>
                Please note: if you answer "No", this meeting will be declined.
              </small>
            </div></section></section>
            <section className={styles.modalContainer}>
              <div>
              {selectedCheckbox === "Yes" && (
                <>
                <section className={styles.modalContainer}><div>
                <h4>
              Please share why you would like to meet with this partner:</h4> </div>
            
              <div className={styles.checkboxContainer}>
                <Input
                  bordered={false}
                  placeholder={"Enter here"}
                  value={interestText}
                  onChange={(e) => setInterestText(e.target.value)}
                />
              </div></section>
              <section className={styles.modalContainer}><div>
                  <h4>Share your upcoming availability below or just click Submit:</h4> </div>
                    <div className={styles.checkboxContainer}>
                      <Input
                        bordered={false}
                        placeholder={"Enter here"}
                        value={interestTextAvailability}
                        onChange={(e) =>
                          setInterestTextAvailability(e.target.value)
                        }
                      />
                    </div></section>
                 
                </>
              )}
            </div></section>
         <div>&nbsp;</div><section className={styles.modalContainer}><div className={styles.modalTitleContainer}>
            
              <div className={styles.modalButtonsContainer}>
                <button onClick={onAccept} className={styles.declineSubBtn}>
                  Submit
                </button>
                <button onClick={OnAcceptCancel} className={styles.cancelBtn}>
                  Cancel
                </button>
              </div>
            </div>
          </section>
        </Modal>
      )}
    </>
  );
};

export default AcceptRequestModal;
