import React, { useEffect, useState } from "react";
import { message, Tabs } from "antd";
import type { TabsProps } from "antd";
import MobilePartnersSection from "./MobilePartnersSection";
import OverviewSection from "../OverviewSection";
import MobileIncentivesSection from "./MobileIncentivesSection";
import MatchesSection from "../MatchesSection";
import { useParams } from "react-router-dom";
import { getMemberInfoFromContact } from "../../../../getSalesForceData";

const { TabPane } = Tabs;

interface ContactInfo {
  Id: string;
  Member__c: string;
  Points_Balance__c: string;
  Pending_Points__c: string;
  Member_Survey_Link__c: string;
  Non_Profit_Top_Choice__c?: string;
  Charity_Name__c?: string;
  MailingStreet?: string;
  MailingCity?: string;
  MailingState?: string;
  MailingPostalCode?: string;
  MailingCountry?: string;
  Mailing_Address_Verified_Date__c?: string;
  AccountId: string;
  Partner_Referral_Link__c: string;
  Shortened_PR_Link__c: string;
  Email: string;
}
const MobileHomeSections: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  return (
    <Tabs
      centered
      defaultActiveKey="1"
      tabBarStyle={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
      }}
    >
      <TabPane tab="PARTNERS" key="1">
        <MobilePartnersSection />
      </TabPane>
      <TabPane tab="PARTNER MATCHES" key="2">
        <MatchesSection />
      </TabPane>
      <TabPane tab="OVERVIEW" key="3">
        <OverviewSection showModal={showModal} />
      </TabPane>
    </Tabs>
  );
};

export default MobileHomeSections;
