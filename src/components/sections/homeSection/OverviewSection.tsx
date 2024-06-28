import { FC, useState, useEffect, useContext } from "react";
import { List, message } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useMediaQuery } from "react-responsive";

import {
  useIncentivesContext,
  usePartnerContext,
} from "./contexts/IncentivesContext";
import styles from "./styles.module.sass";
import { ReactComponent as DeleteIcon } from "../../../images/svgIcons/deleteIcon.svg";
import {
  createDataInSalesForce,
  fetchDataFromSalesForce,
  updateDataInSalesForce,
} from "../../../salesforceAuth";
import { getMemberInfoFromContact } from "../../../getSalesForceData";

interface DataType {
  key: string;
  incentive: string;
  moreInfo: string | JSX.Element;
  meetingsRequired: number;
}

const NumberWithCommas = (x: number) => {
  return x?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

interface OverviewProps {
  showModal: () => void;
}

const OverviewSection: FC<OverviewProps> = ({ showModal }) => {
  const {
    selectedIncentives,
    removeSelectedIncentive,
    totalMeetingsRequired,
    incentiveCounts,
    setSelectedIncentives,
    setIncentiveCounts,
    savedIncentiveCounts,
    setSavedIncentiveCounts,
    savedSelectedIncentives,
    setSavedSelectedIncentives,
  } = useIncentivesContext();
  const {
    acceptedList,
    requestedList,
    declinedList,
    removeAcceptedPartner,
    removeRequestedPartner,
    removeDeclinePartner,
    setSavedAcceptedList,
    setSavedRequestedList,
    setSavedDeclinedList,
    setAcceptedList,
    setDeclinedList,
    setRequestedList,
    savedAcceptedList,
  } = usePartnerContext();
  const partnerContext = usePartnerContext();
  const incentivesContext = useIncentivesContext();
  const { clientId } = useParams<{ clientId: string }>();
  const [contact, setContact] = useState<any>();
  const [pendingMeetings, setPendingMeetings] = useState([]);
  const navigate = useNavigate();

  const isMobile = useMediaQuery({ maxWidth: 610 });
  const isTablet = useMediaQuery({ maxWidth: 1024 });

  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (
      acceptedList.length > 0 ||
      requestedList.length > 0 ||
      declinedList.length > 0
    ) {
      e.preventDefault();
      e.returnValue = "Unsaved changes will be lost.";
    }
  };

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);
    getMemberInfoFromContact(`${clientId}`).then((res) => {
      setContact(res);
    });

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [acceptedList, requestedList, declinedList]);

  useEffect(() => {
    async function fetchData() {
      try {
        // Запрашиваем данные из Salesforce. В вашем случае, это данные о партнерах.
        const salesForceData = await fetchDataFromSalesForce(
          `query/?q=SELECT+Id,Client_Name__c,Stage_MP__c,DQ_Partner__c,DQ_Question__c+FROM+Meeting__c+WHERE+(Stage_MP__c!=\'N/A\'+AND+Stage_MP__c!=\'Canceled by Client\'+AND+Stage_MP__c!=\'Canceled by Member\'+AND+Stage_MP__c!=\'Meeting Completed\')+AND+MemberC__c='${clientId}'`
        );
        const transformedData = salesForceData.records.map((record: any) => ({
          key: record.Id,
          partnerName: record.Client_Name__c,
          stage: record.Stage_MP__c || "",
          incentive: record.Incentive_Copy1__c || "",
          meetingDate: record.Meeting_Date_M__c || "",
          scheduleMeeting: record.Stage_M__c,
          calendarLink: record.CMT_Calendar_Link__c,
          showFeedbackLink:
            record.Member_Feedback_Date__c === null &&
            record.Meeting_Date_M__c &&
            new Date(record.Meeting_Date_M__c) <= new Date(),
          memberFeedbackDate: record.Member_Feedback_Date__c,
          memberFeedbackLink: record.Member_Feedback_Link__c,
          meetingCompletedDate: record.Meeting_Completed_Date__c,
        }));
        setPendingMeetings(transformedData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    }

    void fetchData();
  }, []);

  const updatedSavedAcceptedList = savedAcceptedList.filter(
    (partner) =>
      !acceptedList.some(
        (acceptedPartner) => acceptedPartner.key === partner.key
      ) &&
      !declinedList.some(
        (declinedPartner) => declinedPartner.key === partner.key
      ) &&
      !requestedList.some(
        (requestedPartner) => requestedPartner.key === partner.key
      )
  );

  return (
    <section className={styles.overviewContainer}>
      <h2>Your Points</h2>
      <div className={styles.yourPointsContainer}>
        <div className={styles.yourPointsRow}>
          <h3>
            Points Balance: {NumberWithCommas(contact?.Points_Balance__c)}
          </h3>
        </div>
        <div className={styles.yourPointsRow}>
          <h3>
            Pending Points: {NumberWithCommas(contact?.Pending_Points__c)}
          </h3>
        </div>
        <button
          className={styles.submitBtn}
          onClick={() => {
            navigate(`/${clientId}/incentives`);
          }}
        >
          Redeem Points/View Incentives
        </button>
      </div>

      <h2>Pending Meetings</h2>
      <div className={styles.yourPointsContainer}>
        {pendingMeetings.length == 0 && <p>No Pending Meeting</p>}
        {pendingMeetings.map((meeting: any) => (
          <div className={styles.yourPointsRow}>
            <h3>
              {meeting.partnerName}: {meeting.stage}
            </h3>
          </div>
        ))}
      </div>
      {isTablet ? (
        <></>
      ) : (
        <div
          className={styles.yourPendingMeetingsContainer}
          onClick={showModal}
        >
          <p className={styles.yellowParagraph}>
            Want to earn up to 5,000 bonus points? Click here!
          </p>
        </div>
      )}
      {/* <h4>Pending Accepted Meetings</h4>
			<List
				size="small"
				bordered={false}
				split={false}
				dataSource={acceptedList}
				renderItem={(item) => <List.Item className={styles.listItem}>{item.partnerName} <DeleteIcon onClick={() => removeAcceptedPartner(item)} className={styles.deleteIcon} /></List.Item>}

			/>
			<h4>Pending Requested Meetings</h4>
			<List
				size="small"
				bordered={false}
				split={false}
				dataSource={requestedList}
				renderItem={(item) => <List.Item className={styles.listItem}>{item.partnerName} <DeleteIcon onClick={() => removeRequestedPartner(item)} className={styles.deleteIcon} /></List.Item>}

			/>
			<h4>Declined Meetings</h4>
			<List
				size="small"
				bordered={false}
				split={false}
				dataSource={declinedList}
				renderItem={(item) => <List.Item className={styles.listItem}>{item.partnerName} <DeleteIcon onClick={() => removeDeclinePartner(item)} className={styles.deleteIcon} /></List.Item>}

			/>
			<h4>Selected Incentives & Quantities</h4>
			<List
				size={'small'}
				style={{ minHeight: '120px' }}
				bordered={false}
				split={false}
				dataSource={selectedIncentives}
				renderItem={(item) => <List.Item className={`${styles.listItem} lastListItem`}>{item.incentive} ({incentiveCounts[item.key] || 0})<DeleteIcon className={styles.deleteIcon} onClick={() => removeSelectedIncentive(item.key)} /></List.Item>}
			/>
			<ul className={styles.totalList}>
				<li className={styles.totalListItem}>
					<p>Total Meetings Required</p>
					{totalMeetingsRequired}
				</li>
				<li className={styles.totalListItem}>
					<p>Your Pending Meetings</p>
					{acceptedList.length}
				</li>
				<li className={styles.totalListItem}>
					{totalMeetingsRequired - acceptedList.length >= 1 && (
						<>
							<p>Meetings You Need To Add</p>
							{totalMeetingsRequired - acceptedList.length}
						</>
					)}
				</li>
			</ul>
			{contextHolder}
			<button className={styles.submitBtn} onClick={() => {
				incentivesContext.setSubmitConfirmed(true);
				partnerContext.setSubmitConfirmed(true)
				updatePartnersInSalesForce();
				setSavedAcceptedList(updatedSavedAcceptedList);
				setAcceptedList([]);
				setDeclinedList([]);
				setRequestedList([]);
				setIncentiveCounts({})
				setSelectedIncentives([])
			}}>Submit and Confirm Meetings</button> */}
    </section>
  );
};
export default OverviewSection;
