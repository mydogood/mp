import React, { FC, useState } from "react";
import { NavLink, useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, Drawer, Menu } from "antd";
import type { MenuProps } from "antd";
import styles from "./style.module.sass";
import Logo from "../logo";
import { ReactComponent as BurgerMenuSvg } from "../../images/svgIcons/burgerMenu.svg";

type MenuItem = Required<MenuProps>["items"][number];
function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode
): MenuItem {
  return { key, icon, label } as MenuItem;
}
const BurgerMenu: FC = () => {
  const [open, setOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [current, setCurrent] = useState("Home");
  const location = useLocation();
  const { clientId } = useParams<{ clientId: string }>();

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("clientId");
    navigate("/");
  };

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const itemsMenu: MenuProps["items"] = [
    getItem(<NavLink to={`/${clientId}/home`}>Home</NavLink>, "Home"),
    getItem(
      <NavLink to={`/${clientId}/meetings`}>Meetings</NavLink>,
      "Meetings"
    ),
    getItem(
      <NavLink to={`/${clientId}/incentives`}>Incentives</NavLink>,
      "Incentives"
    ),
    getItem(<NavLink to={`/${clientId}/profile`}>Profile</NavLink>, "Profile"),
  ];

  return (
    <>
      <button onClick={showDrawer} className={styles.burgerMenuBtn}>
        <BurgerMenuSvg />
      </button>
      <Drawer
        footer={
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Log Out
          </button>
        }
        footerStyle={{ border: "none" }}
        width={"100%"}
        placement="right"
        onClose={onClose}
        open={open}
      >
        <div>
          <Logo />
        </div>
        <Menu
          onClick={(e) => setCurrent(e.key)}
          mode={"vertical"}
          items={itemsMenu}
          className={styles.burgerMenu}
        />
        <NavLink
          className={styles.yourPendingMeetingsContainer}
          to={`/${clientId}/bonus`}
          //   onClick={showModal}
        >
          <p className={styles.yellowParagraph}>
            Want to earn up to 5,000 bonus points? Click here!
          </p>
        </NavLink>
      </Drawer>
    </>
  );
};

export default BurgerMenu;
