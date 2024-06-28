import { Drawer, Input, Modal } from "antd";
import { FC } from "react";
import { useMediaQuery } from "react-responsive";

import styles from "../styles.module.sass";

interface RequestModalProps {
  isRequestModalOpen: boolean;
  onRequestShowModal: () => void;
  onRequest: () => void;
  OnRequestCancel: () => void;
  interestText: string;
  setInterestText: (value: string) => void;
}

const RequestTextModal: FC<RequestModalProps> = ({
  isRequestModalOpen,
  onRequestShowModal,
  onRequest,
  OnRequestCancel,
  setInterestText,
  interestText,
}) => {
  const isMobile = useMediaQuery({ maxWidth: 610 });

  const isSubmitDisabled = interestText.trim() === "";

  return (
    <>
      {isMobile ? (
        <Drawer
          style={{ borderTopLeftRadius: "5%", borderTopRightRadius: "5%" }}
          placement={"bottom"}
          closeIcon={false}
          push={false}
          onClose={onRequest}
          open={isRequestModalOpen}
        >
          <section className={styles.mobileRequestModalContainer}>
            <div className={styles.modalTitleContainer}>
              <h3>Request to meet</h3>
            </div>
            <small>
              Please share why you would like to meet with this partner:
            </small>

            <div className={styles.mobileInputContainer}>
              <small>Your thoughts</small>
              <Input
                bordered={false}
                placeholder={"Enter your thoughts here"}
                value={interestText}
                onChange={(e) => setInterestText(e.target.value)}
              />
            </div>

            <div className={styles.controlRequestContainer}>
              <button onClick={OnRequestCancel} className={styles.cancelBtn}>
                Cancel
              </button>
              <button
                onClick={onRequest}
                className={styles.submitBtn}
                disabled={isSubmitDisabled}
              >
                Submit
              </button>
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
          open={isRequestModalOpen}
          onOk={onRequestShowModal}
          onCancel={onRequest}
        >
          <section className={styles.modalContainer}>
            <div className={styles.modalTitleContainer}>
              <h3>Request to meet</h3>
              <button
                onClick={onRequest}
                className={styles.declineSubBtn}
                disabled={isSubmitDisabled}
              >
                Submit
              </button>
              <button
                onClick={() => {
                  OnRequestCancel();
                  setInterestText("");
                }}
                className={styles.cancelBtn}
              >
                Cancel
              </button>
            </div>
            <small>
              Please share why you would like to meet with this partner:
            </small>
            <div>
              <div className={styles.checkboxContainer}>
                <Input
                  bordered={false}
                  placeholder={"Enter your thoughts here"}
                  value={interestText}
                  onChange={(e) => setInterestText(e.target.value)}
                />
              </div>
            </div>
          </section>
        </Modal>
      )}
    </>
  );
};

export default RequestTextModal;
