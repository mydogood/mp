import React, { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { Drawer, Avatar, message } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { CloseOutlined } from "@ant-design/icons";
import { marked } from "marked";

import RequestModal from "./ui/RequestModal";
import AcceptRequestModal from "./ui/AcceptRequestModal";

import styles from "./styles.module.sass";
import { usePartnerContext } from "./contexts/IncentivesContext";
import {
  createDataInSalesForce,
  fetchDataFromSalesForce,
  updateDataInSalesForce,
} from "../../../salesforceAuth";
import { getMemberInfoFromContact } from "../../../getSalesForceData";
import RequestTextModal from "./ui/RequestTextModal";
import NoDQModal from "./ui/NoDQModal";

interface partnerQuestion {
  question: string;
}
interface partner {
  partner: boolean;
}

interface PartnersDataType {
  DQ_Response__c?: string;
  key: string;
  partnerName: string;
  overview: string;
  hasRequested: boolean;
  website?: string;
  richMerge?: string;
  surveyOptionName?: string[];
  Related_Membership_Member__c: string;
  Related_Membership__c: string;
  Survey_Option_Name__c: string[];
  filterCategory?: string[];
  Client_Logo__c?: string;
  Stage_M__c?: string;
  Stage_MP__c?: string;
  Sweepstakes_Type__c?: string;
  Client_Campaign_ID__c?: string;
  Interest_in_Partner__c?: string;
  RecordTypeId?: string;
  Client_Campaign__c?: string;
  Meeting_Source__c?: string;
  Intro_Type__c?: string;
  Request_Submitted_Date_M__c?: string;
  declineReason?: string | JSX.Element;
  Client_Decline_Reason__c?: string;
  clientKey?: string;
}
interface PartnerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  partnerDetails: PartnersDataType | null;
}
const PartnerDrawer: FC<PartnerDrawerProps> = ({
  isOpen,
  onClose,
  partnerDetails,
}) => {
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedCheckbox, setSelectedCheckbox] = useState<string | null>(
    "No interest"
  );
  const [acceptMeetings, setAcceptMeetings] = useState<partnerQuestion | null>(
    null
  );
  const [isDQpartner, setIsDQpartner] = useState<partner | null>(null);
  const [noDQModalState, setNoDQModalState] = useState(false);

  const {
    addAcceptedPartner,
    addRequestedPartner,
    addDeclinedPartner,
    declinedList,
    acceptedList,
    requestedList,
    removeAcceptedPartner,
    removeDeclinePartner,
  } = usePartnerContext();
  const [isAccepted, setIsAccepted] = useState(false);
  const [isDeclined, setIsDeclined] = useState(false);
  const [interestText, setInterestText] = useState("");
  const [interestTextAvailability, setInterestTextAvailability] = useState("");
  const [messageApi, contextHolder] = message.useMessage();
  const { clientId } = useParams<{ clientId: string }>();

  const isMobile = useMediaQuery({ maxWidth: 610 });
  const isTablet = useMediaQuery({ maxWidth: 1024 });

  const isPartnerAccepted = acceptedList.some(
    (item) => item.key === partnerDetails?.key
  );
  const isPartnerRequested = requestedList.some(
    (item) => item.key === partnerDetails?.key
  );
  const isPartnerDeclined = declinedList.some(
    (item) => item.key === partnerDetails?.key
  );

  const showAcceptAnswerModal = async () => {
    try {
      if (partnerDetails) {
        const salesForceData = await fetchDataFromSalesForce(
          `query/?q=SELECT+Id,Client_Name__c,Stage_MP__c,DQ_Partner__c,DQ_Question__c+FROM+Meeting__c+WHERE+DQ_Partner__c=true+AND+MemberC__c='${clientId}'+AND+(Client_Id__c='${partnerDetails.clientKey}'+OR+Client_Id__c='${partnerDetails.key}')`
        );
        if (
          salesForceData &&
          salesForceData.records &&
          salesForceData.records[0] &&
          salesForceData.records[0].DQ_Question__c
        ) {
          setAcceptMeetings((prev) => ({
            ...prev!,
            question: salesForceData.records[0].DQ_Question__c,
          }));
        } else {
          console.error("Invalid data format:", salesForceData);
        }
      }

      if (partnerDetails) {
        const DQPartnerData = await fetchDataFromSalesForce(
          `query/?q=SELECT+DQ_Partner__c+FROM+Meeting__c+WHERE+MemberC__c='${clientId}'+AND+(Client_Id__c='${partnerDetails.clientKey}'+OR+Client_Id__c='${partnerDetails.key}')`
        );
        if (
          DQPartnerData &&
          DQPartnerData.records &&
          DQPartnerData.records[0] &&
          DQPartnerData.records[0].DQ_Partner__c
        ) {
          setIsDQpartner((prev) => ({
            ...prev!,
            partner: DQPartnerData.records[0].DQ_Partner__c,
          }));
          setIsAcceptModalOpen(true);
        } else {
          console.log("no DQ Modal");
          showNoDQModal();
        }
      }
    } catch (error) {
      console.error("Error fetching partner details:", error);
    } finally {
      // setLoadingPartnerDetails(false);
    }
  };

  useEffect(() => {
    if (partnerDetails) {
      setIsAccepted(
        acceptedList.some((item) => item.key === partnerDetails.key)
      );
      setIsDeclined(
        declinedList.some((item) => item.key === partnerDetails.key)
      );
    }
  }, [partnerDetails, acceptedList, declinedList]);

  const success = () => {
    messageApi.open({
      type: "success",
      content: "Data sent successfully",
    });
  };

  const handleAcceptClick = () => {
    showAcceptAnswerModal();
  };

  const showRequestModal = () => {
    setIsRequestModalOpen(true);
  };

  const handleCheckboxSelect = (checkboxValue: string) => {
    setSelectedCheckbox(checkboxValue);
  };

  const handleRequestClick = () => {
    if (partnerDetails) {
      if (selectedCheckbox === "Yes") {
        const partnerWithInterest = {
          ...partnerDetails,
          DQ_Response__c: selectedCheckbox,
          Available_Dates_Times__c: interestTextAvailability,
        };
        console.log({ partnerWithInterest });
        updatePartnerInSalesForce(partnerWithInterest, "Accepted");
        onClose();
        setInterestTextAvailability("");
        setIsAcceptModalOpen(false);
      } else if (selectedCheckbox === "No") {
        const partnerWithInterest = {
          ...partnerDetails,
          DQ_Response__c: selectedCheckbox,
        };
        console.log({ partnerWithInterest });
        updatePartnerInSalesForce(partnerWithInterest, "Client-Declined");
        onClose();
        setInterestTextAvailability("");
        setIsAcceptModalOpen(false);
      }
    }
  };

  const handleRequestTextClick = () => {
    if (partnerDetails) {
      const partnerWithInterest = {
        ...partnerDetails,
        Interest_in_Partner__c: interestText,
      };
      updatePartnerInSalesForce(partnerWithInterest, "Requested");
      onClose();
      setInterestTextAvailability("");
      setIsAcceptModalOpen(false);
    }
  };

  const handleNoDQClick = () => {
    if (partnerDetails) {
      const partnerWithInterest = {
        ...partnerDetails,
        Available_Dates_Times__c: interestTextAvailability,
      };
      updatePartnerInSalesForce(partnerWithInterest, "Accepted");
      onClose();
      setInterestTextAvailability("");
      setIsAcceptModalOpen(false);
    }
  };

  const handleDeclineClick = () => {
    if (partnerDetails && selectedCheckbox) {
      if (!isDeclined) {
        const declinedPartnerWithReason = {
          ...partnerDetails,
          declineReason: selectedCheckbox,
        };
        updatePartnerInSalesForce(declinedPartnerWithReason, "Declined");
        onClose();
        setIsDeclineModalOpen(false);
      }
      const declinedPartnerWithReason = {
        ...partnerDetails,
        declineReason: selectedCheckbox,
      };
      updatePartnerInSalesForce(declinedPartnerWithReason, "Declined");
      onClose();
      setIsDeclineModalOpen(false);
    }
  };

  const showDeclineModal = () => {
    setIsDeclineModalOpen(true);
  };

  const onDeclined = () => {
    setIsDeclineModalOpen(false);
  };

  const handleCancelDeclined = () => {
    setIsDeclineModalOpen(false);
  };

  const showAcceptModal = () => {
    setIsAcceptModalOpen(true);
  };

  const showNoDQModal = () => {
    setNoDQModalState(true);
  };

  const OnDQModalCancel = () => {
    setNoDQModalState(false);
  };

  const onAccept = () => {
    setIsAcceptModalOpen(false);
  };

  const handleCancelAccept = () => {
    setIsAcceptModalOpen(false);
  };

  const handleCancelRequest = () => {
    setIsRequestModalOpen(false);
  };

  const getDisplayLink = (url: string | undefined) => {
    if (!url) {
      return "";
    }
    try {
      const parsedUrl = new URL(url);
      const path = parsedUrl.pathname === "/" ? "" : parsedUrl.pathname;
      return `${parsedUrl.hostname}${path}`;
    } catch (e) {
      return url;
    }
  };

  function stripStyles(html: string) {
    const domParser = new DOMParser();
    const document = domParser.parseFromString(html, "text/html");
    const allElements = document.querySelectorAll("*");
    allElements.forEach((element) => element.removeAttribute("style"));
    return document.body.innerHTML;
  }

  const renderAvatar = () => {
    if (!partnerDetails || !partnerDetails.Client_Logo__c) {
      return <Avatar shape="square" size={48} icon={<UserOutlined />} />;
    }

    const isLink =
      partnerDetails.Client_Logo__c.startsWith("http://") ||
      partnerDetails.Client_Logo__c.startsWith("https://");

    if (isLink) {
      return (
        <Avatar shape="square" size={48} src={partnerDetails.Client_Logo__c} />
      );
    }

    if (partnerDetails.Client_Logo__c.startsWith("<img")) {
      return (
        <div
          style={{ width: "48px", height: "48px" }}
          dangerouslySetInnerHTML={{ __html: partnerDetails.Client_Logo__c }}
        />
      );
    }

    return <Avatar shape="square" size={48} icon={<UserOutlined />} />;
  };

  const updatePartnerInSalesForce = async (
    partner: PartnersDataType,
    status: string
  ) => {
    let updatedFields = {};
    let endpoint = ""; // Мы установим это значение ниже

    // const incentiveName = selectedIncentives.length > 0 ? selectedIncentives[0].incentive : null;

    switch (status) {
      case "Accepted":
        updatedFields = {
          Stage_M__c: "Member Accepted",
          // Sweepstakes_Type__c: partner
          DQ_Response__c: partner.DQ_Response__c,
          Available_Dates_Times__c: interestTextAvailability,
        };
        endpoint = `sobjects/Meeting__c/${partner.key}`;
        break;

      case "Declined":
        updatedFields = {
          Stage_M__c: "Member Declined",
          Decline_Reason__c: partner.declineReason,
        };
        endpoint = `sobjects/Meeting__c/${partner.key}`;
        break;

      case "Client-Declined":
        updatedFields = {
          Stage_M__c: "Client Declined",
          Client_Decline_Reason__c: "No to DQ Question",
          DQ_Response__c: partner.DQ_Response__c,
        };
        endpoint = `sobjects/Meeting__c/${partner.key}`;
        break;

      case "Requested":
        const today = new Date();
        const formattedToday = `${today.getFullYear()}-${String(
          today.getMonth() + 1
        ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

        const memberId = await getMemberInfoFromContact(`${clientId}`);
        if (!memberId) {
          console.error("Cannot find Member ID.");
          return;
        }

        updatedFields = {
          RecordTypeId: "01236000000OoHj",
          // RecordTypeId: "a0EHq00000yjyO4",
          Stage_M__c: "Requested by Member",
          Member1__c: memberId.Member__c,
          Member_Account__c: memberId.AccountId,
          MemberC__c: memberId.Id,
          Client_Campaign__c: partner.Client_Campaign_ID__c,
          Meeting_Source__c: "Member Portal",
          Intro_Type__c: "Bulk",
          Request_Submitted_Date_M__c: formattedToday,
          Interest_in_Partner__c: partner.Interest_in_Partner__c || "",
        };
        endpoint = `sobjects/Meeting__c/`;
        break;
    }

    try {
      if (status === "Requested") {
        await createDataInSalesForce(endpoint, updatedFields);
        success();
      } else {
        await updateDataInSalesForce(endpoint, updatedFields);
        success();
      }
    } catch (error) {
      console.error(`Error processing partner with ID ${partner.key}:`, error);
    }
  };

  return (
    <Drawer
      footerStyle={{ border: "none" }}
      closeIcon={false}
      width={isMobile ? "100%" : isTablet ? "60%" : "40%"}
      placement="right"
      onClose={onClose}
      open={isOpen}
    >
      {partnerDetails && (
        <section className={styles.drawerContainer}>
          <NoDQModal
            noDQModalState={noDQModalState}
            showNoDQModal={showNoDQModal}
            OnDQModalCancel={OnDQModalCancel}
            interestTextAvailability={interestTextAvailability}
            setInterestTextAvailability={setInterestTextAvailability}
            onRequest={handleNoDQClick}
          />
          <AcceptRequestModal
            isAcceptModalOpen={isAcceptModalOpen}
            onAcceptShowModal={showAcceptModal}
            onAccept={handleRequestClick}
            OnAcceptCancel={handleCancelAccept}
            interestTextAvailability={interestTextAvailability}
            setInterestTextAvailability={setInterestTextAvailability}
            onCheckboxChange={handleCheckboxSelect}
            selectedCheckbox={selectedCheckbox}
            acceptMeetings={acceptMeetings}
          />
          <RequestModal
            selectedCheckbox={selectedCheckbox}
            onCheckboxChange={handleCheckboxSelect}
            isDeclineModalOpen={isDeclineModalOpen}
            onDeclineShowModal={showDeclineModal}
            onDecline={handleDeclineClick}
            OnDeclineCancel={handleCancelDeclined}
          />
          <RequestTextModal
            isRequestModalOpen={isRequestModalOpen}
            onRequestShowModal={showRequestModal}
            onRequest={handleRequestTextClick}
            OnRequestCancel={handleCancelRequest}
            interestText={interestText}
            setInterestText={setInterestText}
          />
          <div className={styles.closeBtn}>
            <h2>Request details</h2>
            <CloseOutlined onClick={onClose} />
          </div>
          <div className={styles.drawerTitleContainer}>
            <div>{renderAvatar()}</div>
            <div>
              <h3>{partnerDetails.partnerName}</h3>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={partnerDetails.website}
              >
                {getDisplayLink(partnerDetails.website)}
              </a>
            </div>
          </div>
          <div className={styles.drawerBtnContainer}>
            {partnerDetails.hasRequested ? (
              <>
                <button
                  disabled={isPartnerAccepted}
                  onClick={handleAcceptClick}
                  className={styles.drawerBtn}
                >
                  Accept
                </button>
                <button
                  disabled={isPartnerDeclined}
                  onClick={showDeclineModal}
                  className={styles.drawerBtn}
                >
                  Decline
                </button>
              </>
            ) : (
              <>
                <button
                  disabled={isPartnerRequested}
                  onClick={showRequestModal}
                  className={styles.requestMeetBtn}
                >
                  Request to Meet
                </button>
              </>
            )}
          </div>
          <br></br>
          <article className={styles.drawerArticle}>
            <h4 className={styles.drawerArticleTitle}>
              Please review and ensure alignment with your role/interests before
              accepting this meeting. If not aligned, kindly decline the
              invitation.
            </h4>
            <p
              style={{ fontSize: "14px" }}
              className={styles.drawerArticleDescription}
              dangerouslySetInnerHTML={{
                __html: stripStyles(marked(partnerDetails.richMerge || "")),
              }}
            ></p>
          </article>
          <br></br>
          <article className={styles.drawerArticle}>
            <h4 className={styles.drawerArticleTitle}>
              {partnerDetails.filterCategory ? "Matching Priority areas" : ""}
            </h4>
            <p className={styles.drawerArticleDescription}>
              {" "}
              {partnerDetails?.filterCategory?.join(", ")}{" "}
            </p>
          </article>
        </section>
      )}
    </Drawer>
  );
};

export default PartnerDrawer;
