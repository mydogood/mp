import { FC, useState, useEffect, useContext } from "react";
import { List, message } from "antd";

import styles from "./styles.module.sass";
import { ReactComponent as DeleteIcon } from "../../../images/svgIcons/deleteIcon.svg";
import {
  createDataInSalesForce,
  fetchDataFromSalesForce,
  updateDataInSalesForce,
} from "../../../salesforceAuth";
import { getMemberInfoFromContact } from "../../../getSalesForceData";
import { useNavigate, useParams } from "react-router-dom";
import { useIncentivesContext } from "../homeSection/contexts/IncentivesContext";
import { DeleteOutlined } from "@ant-design/icons";
import CheckoutDrawer from "./CheckoutDrawer";

interface DataType {
  key: string;
  incentive: string;
  moreInfo: string | JSX.Element;
  meetingsRequired: number;
}

const NumberWithCommas = (x: number) => {
  return x?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const OverviewSection: FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [contact, setContact] = useState<any>();
  const [pendingMeetings, setPendingMeetings] = useState([]);
  const [openCheckoutDrawer, setOpenCheckoutDrawer] = useState(false);
  const navigate = useNavigate();
  const incentiveContext = useIncentivesContext();
  const cartItems = incentiveContext.cartItems || [];

  const removeCartItem = (item: any) => {
    const deleted = cartItems.filter((c) => c.incentive !== item.incentive);
    incentiveContext.setCartItems(deleted);
  };

  const getTotalPoints = () => {
    const total = cartItems.reduce((sum, item: any) => sum + item.Points__c, 0);
    return total;
  };

  const redeemPoints = () => {
    if (
      contact?.Points_Balance__c - getTotalPoints() >= 0 &&
      cartItems.length > 0
    ) {
      setOpenCheckoutDrawer(true);
    }
  };

  const onCloseCheckoutDrawer = () => {
    setOpenCheckoutDrawer(false);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const salesForceData = await fetchDataFromSalesForce(
          `query/?q=SELECT+Id,Client_Name__c,Stage_MP__c+FROM+Meeting__c+WHERE+(Stage_MP__c!=\'N/A\'+AND+Stage_MP__c!=\'Canceled by Client\'+AND+Stage_MP__c!=\'Canceled by Member\'+AND+Stage_MP__c!=\'Meeting Completed\')+AND+MemberC__c='${clientId}'`
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

        getMemberInfoFromContact(`${clientId}`).then((res) => {
          setContact(res);
        });
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    }

    void fetchData();
  }, []);

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
      </div>

      <h2>Incentive Cart</h2>
      <div className={styles.yourPointsContainer}>
        <h4>Selected Incentives</h4>
        {cartItems.map((item) => (
          <div className={styles.yourPointsRow} key={item.key}>
            <p>
              {item.incentive}: {item.Points__c}
            </p>
            <DeleteOutlined
              onClick={() => removeCartItem(item)}
              style={{ color: "red" }}
            />
          </div>
        ))}
        <div className={styles.totalPoints}>
          <strong>Total Points Needed: </strong>
          <span>{getTotalPoints()}</span>
        </div>
        <div className={styles.totalPoints}>
          <strong>Your Points Balance: </strong>
          <span>{contact?.Points_Balance__c}</span>
        </div>
        <div className={styles.totalPoints}>
          <strong>Points Remaining: </strong>
          <span>{contact?.Points_Balance__c - getTotalPoints()}</span>
        </div>
        <div className={styles.submitContainer}>
          <button
            className={styles.submitBtn}
            onClick={redeemPoints}
            disabled={contact?.Points_Balance__c - getTotalPoints() < 0}
          >
            Redeem Points
          </button>
          {contact?.Points_Balance__c - getTotalPoints() < 0 && (
            <p>*You can't checkout because points remaining is negative</p>
          )}
        </div>
      </div>
      {contact && (
        <CheckoutDrawer
          totalPoints={getTotalPoints()}
          isOpen={openCheckoutDrawer}
          onClose={onCloseCheckoutDrawer}
          contactInfo={contact}
        />
      )}
    </section>
  );
};

export default OverviewSection;
