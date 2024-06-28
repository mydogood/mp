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
              <h3>Request to meet</h3>
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
                  <p>Provide some availability:</p>
                  <div>
                    <div className={styles.checkboxContainer}>
                      <Input
                        bordered={false}
                        placeholder={"Provide some availability"}
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
            <div className={styles.modalTitleContainer}>
              <h3>
                Please answer the following question before moving forward with
                this acceptance:
              </h3>
              <div className={styles.modalButtonsContainer}>
                <button onClick={onAccept} className={styles.declineSubBtn}>
                  Submit
                </button>
                <button onClick={OnAcceptCancel} className={styles.cancelBtn}>
                  Cancel
                </button>
              </div>
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
                  <p>Provide some availability:</p>
                  <div>
                    <div className={styles.checkboxContainer}>
                      <Input
                        bordered={false}
                        placeholder={"Provide some availability"}
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
        </Modal>
      )}
    </>
  );
};

export default AcceptRequestModal;
