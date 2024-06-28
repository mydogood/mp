import React, { useState, FC } from "react";
import { Button, Drawer, Input } from "antd";
import styles from "./styles.module.sass";
import { CloseOutlined } from "@ant-design/icons";
import { useMediaQuery } from "react-responsive";

interface IncentiveCustomizationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (inputValue: string) => void;
}

const IncentiveCustomizationDrawer: FC<IncentiveCustomizationDrawerProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [inputValue, setInputValue] = useState<string>("");

  const isMobile = useMediaQuery({ maxWidth: 610 });
  const isTablet = useMediaQuery({ maxWidth: 1024 });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = () => {
    onSubmit(inputValue);
    onClose();
    setInputValue("");
  };

  return (
    <Drawer
      footerStyle={{ border: "none" }}
      closeIcon={false}
      width={isMobile ? "100%" : isTablet ? "60%" : "30%"}
      onClose={() => onClose()}
      open={isOpen}
    >
      <section className={styles.incentiveDetailsDrawerContainer}>
        <div className={styles.drawerTitle}>
          <h3>Item Customizations</h3>
          <CloseOutlined onClick={() => onClose()} />
        </div>
        <Input
          placeholder="Item Customization"
          value={inputValue}
          onChange={handleInputChange}
        />

        <div className={styles.customizationBtnContainer}>
          <Button
            type="primary"
            htmlType="submit"
            disabled={!inputValue}
            className={styles.submitCustomizationBtn}
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </div>
      </section>
    </Drawer>
  );
};

export default IncentiveCustomizationDrawer;
