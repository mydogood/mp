import { FC } from "react";
import { useMediaQuery } from "react-responsive";
import { Tabs } from "antd";
import styles from "./styles.module.sass";
import DeclineMeetingsTable from "./DeclineMeetingsTable";
import ClosedMeetingsTable from "./ClosedMeetingsTable";
import PendingMeetingsTable from "./PendingMeetingsTable";

const MeetingsSection: FC = () => {
  const isMobile = useMediaQuery({ maxWidth: 610 });
  const tabItems = [
    { key: "1", tab: "Pending Meetings", content: <PendingMeetingsTable /> },
    { key: "2", tab: "Closed Meetings", content: <ClosedMeetingsTable /> },
    { key: "3", tab: "Declined Meetings", content: <DeclineMeetingsTable /> },
  ];

  return (
    <section className={styles.meetingsContainer}>
      <h2 className={styles.meetingsContainerTitle}>Meetings</h2>
      <Tabs
        defaultActiveKey="1"
        tabBarStyle={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FFFFFF",
          marginLeft: "3%",
          textTransform: "uppercase",
        }}
      >
        {tabItems.map((item) => (
          <Tabs.TabPane key={item.key} tab={item.tab}>
            {item.content}
          </Tabs.TabPane>
        ))}
      </Tabs>
    </section>
  );
};

export default MeetingsSection;
