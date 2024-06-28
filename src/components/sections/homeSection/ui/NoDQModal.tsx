import { Drawer, Input, Modal } from "antd";
import styles from "../styles.module.sass";
import { FC } from "react";
import { useMediaQuery } from "react-responsive";

interface NoDQModalProps {
  noDQModalState: boolean;
  showNoDQModal: () => void;
  OnDQModalCancel: () => void;
  setInterestTextAvailability: (value: string) => void;
  interestTextAvailability: string;
  onRequest: () => void;
}

const NoDQModal: FC<NoDQModalProps> = ({
  noDQModalState,
  showNoDQModal,
  OnDQModalCancel,
  interestTextAvailability,
  setInterestTextAvailability,
  onRequest,
}) => {
  const isMobile = useMediaQuery({ maxWidth: 610 });
  return (
    <>
      {isMobile ? (
        <Drawer
          style={{ borderTopLeftRadius: "5%", borderTopRightRadius: "5%" }}
          placement={"bottom"}
          closeIcon={false}
          push={false}
        >
          <section className={styles.modalContainer}>
            <div className={styles.modalTitleContainer}>
              <h3>Double Qualification Question</h3>
              <button onClick={onRequest} className={styles.declineSubBtn}>
                Submit
              </button>
              <button onClick={OnDQModalCancel} className={styles.cancelBtn}>
                Cancel
              </button>
            </div>
            <small>Provide some availability:</small>
            <div>
              <div className={styles.checkboxContainer}>
                <Input
                  bordered={false}
                  placeholder={"Provide some availability"}
                  value={interestTextAvailability}
                  onChange={(e) => setInterestTextAvailability(e.target.value)}
                />
              </div>
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
          open={noDQModalState}
        >
          <section className={styles.modalContainer}>
            <div className={styles.modalTitleContainer}>
              <h3>Double Qualification Question</h3>
              <button onClick={onRequest} className={styles.declineSubBtn}>
                Submit
              </button>
              <button onClick={OnDQModalCancel} className={styles.cancelBtn}>
                Cancel
              </button>
            </div>
            <small>Provide some availability:</small>
            <div>
              <div className={styles.checkboxContainer}>
                <Input
                  bordered={false}
                  placeholder={"Provide some availability"}
                  value={interestTextAvailability}
                  onChange={(e) => setInterestTextAvailability(e.target.value)}
                />
              </div>
            </div>
          </section>
        </Modal>
      )}
    </>
  );
};

export default NoDQModal;
