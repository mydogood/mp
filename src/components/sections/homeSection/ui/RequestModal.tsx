import { useState, FC } from "react";
import { Modal, Checkbox, Drawer } from "antd";
import { useMediaQuery } from "react-responsive";

import styles from "../styles.module.sass";

interface RequestModalProps {
  isDeclineModalOpen: boolean;
  onDeclineShowModal: () => void;
  onDecline: () => void;
  OnDeclineCancel: () => void;
  selectedCheckbox: string | null;
  onCheckboxChange: (value: string) => void;
}
const RequestModal: FC<RequestModalProps> = ({
  isDeclineModalOpen,
  onDeclineShowModal,
  onDecline,
  OnDeclineCancel,
  selectedCheckbox,
  onCheckboxChange,
}) => {
  const isMobile = useMediaQuery({ maxWidth: 610 });

  const handleCheckboxChange = (value: string) => {
    onCheckboxChange(value); // Call a function from the props when the checkbox changes
  };

  return (
    <>
      {isMobile ? (
        <Drawer
          height={"600px"}
          style={{ borderTopLeftRadius: "5%", borderTopRightRadius: "5%" }}
          placement={"bottom"}
          closeIcon={false}
          push={false}
          onClose={OnDeclineCancel}
          open={isDeclineModalOpen}
        >
          <section className={styles.mobileModalContainer}>
            <div className={styles.modalTitleContainer}>
              <h3>Decline request</h3>
            </div>
            <small>Please share why you would like to decline a request:</small>
            <div className={styles.checkboxContainer}>
              <Checkbox
                className={styles.reqCheck}
                checked={selectedCheckbox === "None"}
                onChange={() => handleCheckboxChange("None")}
              >
                None
              </Checkbox>
              <Checkbox
                className={styles.reqCheck}
                checked={selectedCheckbox === "Timing"}
                onChange={() => handleCheckboxChange("Timing")}
              >
                No time
              </Checkbox>
              <Checkbox
                className={styles.reqCheck}
                checked={selectedCheckbox === "No interest"}
                onChange={() => handleCheckboxChange("No interest")}
              >
                No interest
              </Checkbox>
              <Checkbox
                className={styles.reqCheck}
                checked={selectedCheckbox === "Existing Customer"}
                onChange={() => handleCheckboxChange("Existing Customer")}
              >
                Existing Customer
              </Checkbox>
              <Checkbox
                className={styles.reqCheck}
                checked={selectedCheckbox === "Job Function/Role"}
                onChange={() => handleCheckboxChange("Job Function/Role")}
              >
                Does not align w/ role
              </Checkbox>
              <Checkbox
                className={styles.reqCheck}
                checked={selectedCheckbox === "Met Already"}
                onChange={() => handleCheckboxChange("Met Already")}
              >
                Met Already
              </Checkbox>
              <Checkbox
                className={styles.reqCheck}
                checked={selectedCheckbox === "No Need"}
                onChange={() => handleCheckboxChange("No Need")}
              >
                No Need
              </Checkbox>
              <Checkbox
                className={styles.reqCheck}
                checked={selectedCheckbox === "Use Competitor/Alternative"}
                onChange={() =>
                  handleCheckboxChange("Use Competitor/Alternative")
                }
              >
                Use Competitor/Alternative
              </Checkbox>
              <Checkbox
                className={styles.reqCheck}
                checked={selectedCheckbox === "Other"}
                onChange={() => handleCheckboxChange("Other")}
              >
                Other
              </Checkbox>
            </div>
            <div className={styles.controlContainer}>
              <button onClick={onDecline} className={styles.declineBtn}>
                Decline
              </button>
              <button onClick={OnDeclineCancel} className={styles.cancelBtn}>
                Cancel
              </button>
            </div>
          </section>
        </Drawer>
      ) : (
        <Modal
          centered={true}
          width={"665px"}
          footer={null}
          closeIcon={false}
          open={isDeclineModalOpen}
          onOk={onDeclineShowModal}
          onCancel={OnDeclineCancel}
        >
          <section className={styles.modalContainer}>
            <div className={styles.modalTitleContainer}>
              <h3>Decline request</h3>
              <button onClick={onDecline} className={styles.declineSubBtn}>
                Decline
              </button>
              <button onClick={OnDeclineCancel} className={styles.cancelBtn}>
                Cancel
              </button>
            </div>
            <small>Please share why you would like to decline a request:</small>
            <div>
              <div className={styles.checkboxContainer}>
                <Checkbox
                  className={styles.reqCheck}
                  checked={selectedCheckbox === "None"}
                  onChange={() => handleCheckboxChange("None")}
                >
                  None
                </Checkbox>
                <Checkbox
                  className={styles.reqCheck}
                  checked={selectedCheckbox === "Timing"}
                  onChange={() => handleCheckboxChange("Timing")}
                >
                  No time
                </Checkbox>
                <Checkbox
                  className={styles.reqCheck}
                  checked={selectedCheckbox === "No interest"}
                  onChange={() => handleCheckboxChange("No interest")}
                >
                  No interest
                </Checkbox>
                <Checkbox
                  className={styles.reqCheck}
                  checked={selectedCheckbox === "Existing Customer"}
                  onChange={() => handleCheckboxChange("Existing Customer")}
                >
                  Existing Customer
                </Checkbox>
                <Checkbox
                  className={styles.reqCheck}
                  checked={selectedCheckbox === "Job Function/Role"}
                  onChange={() => handleCheckboxChange("Job Function/Role")}
                >
                  Does not align w/ role
                </Checkbox>
                <Checkbox
                  className={styles.reqCheck}
                  checked={selectedCheckbox === "Met Already"}
                  onChange={() => handleCheckboxChange("Met Already")}
                >
                  Met Already
                </Checkbox>
                <Checkbox
                  className={styles.reqCheck}
                  checked={selectedCheckbox === "No Need"}
                  onChange={() => handleCheckboxChange("No Need")}
                >
                  No Need
                </Checkbox>
                <Checkbox
                  className={styles.reqCheck}
                  checked={selectedCheckbox === "Use Competitor/Alternative"}
                  onChange={() =>
                    handleCheckboxChange("Use Competitor/Alternative")
                  }
                >
                  Use Competitor/Alternative
                </Checkbox>
                <Checkbox
                  className={styles.reqCheck}
                  checked={selectedCheckbox === "Other"}
                  onChange={() => handleCheckboxChange("Other")}
                >
                  Other
                </Checkbox>
              </div>
            </div>
          </section>
        </Modal>
      )}
    </>
  );
};

export default RequestModal;
