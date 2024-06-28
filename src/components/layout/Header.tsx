import { Menu } from "antd";
import React, { FC, useState } from "react";
import { NavLink, useLocation, useNavigate, useParams } from "react-router-dom";
import type { MenuProps } from "antd";
import { useMediaQuery } from "react-responsive";

import BurgerMenu from "./BurgerMenu";
import Logo from "../logo/index";
import styles from "./style.module.sass";

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode
): MenuItem {
  return { key, icon, label } as MenuItem;
}

const Header: FC = () => {
  const location = useLocation();
  const isMobile = useMediaQuery({ maxWidth: 610 });
  const { clientId } = useParams<{ clientId: string }>();

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("clientId");
    navigate("/");
  };

  const itemsMenu = [
    { label: "Home", path: `/${clientId}/home` },
    { label: "Meetings", path: `/${clientId}/meetings` },
    { label: "Incentives", path: `/${clientId}/incentives` },
    { label: "Profile", path: `/${clientId}/profile` },
  ];

  return (
    <header className={styles.header}>
      <div>
        <Logo />
      </div>
      {isMobile ? (
        <BurgerMenu />
      ) : (
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          className={styles.menu}
        >
          {itemsMenu.map((item) => (
            <Menu.Item key={item.path}>
              <NavLink to={item.path}>{item.label}</NavLink>
            </Menu.Item>
          ))}
          <Menu.Item key="/logout" onClick={handleLogout}>
            Log Out
          </Menu.Item>
        </Menu>
      )}
    </header>
  );
};

export default Header;
