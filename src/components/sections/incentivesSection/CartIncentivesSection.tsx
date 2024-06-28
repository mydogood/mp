import { FC, useState, useEffect, useContext } from "react";
import { Button, Col, Image, List, Row, message } from "antd";

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

const CartSection: FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [contact, setContact] = useState<any>();
  const [pendingMeetings, setPendingMeetings] = useState([]);
  const [openCheckoutDrawer, setOpenCheckoutDrawer] = useState(false);
  const navigate = useNavigate();
  const incentiveContext = useIncentivesContext();
  const cartItems = incentiveContext.cartItems || [];

  const removeCartItem = (cartItemId: any) => {
    const deleted = cartItems.filter((c) => c.cartItemId !== cartItemId);
    incentiveContext.setCartItems(deleted);
  };

  const getTotalPoints = () => {
    const total = cartItems.reduce((sum, item: any) => sum + item.Points__c, 0);
    return total;
  };

  const getCartCount = (value: any) => {
    const filteredCartItems = cartItems.filter((item) => item.key == value.key);
    return filteredCartItems.length;
  };

  const onFinish = async () => {
    try {
      setIsLoading(true);

      // Constructing incentiveData based on cartItems and customizationList
      const incentiveDataList = cartItems.map((item: any, index: number) => ({
        Incentive__c: item.incentiveId,
        Points__c: item.Points__c,
        Member_Contact__c: clientId,
        Customization__c: item.Customization__c || null, // Using null if no customization found
      }));

      console.log("incentiveDataList", incentiveDataList); // incentive data

      try {
        // Create Member_Incentive__c records in Salesforce
        for (const incentiveData of incentiveDataList) {
          await createDataInSalesForce(
            `/sobjects/Member_Incentive__c/`,
            incentiveData
          );
        }

        // Reset cart items, close modal, and reset loading state
        incentiveContext.setCartItems([]);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to update password:", error);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching data from Salesforce:", error);
      alert("Authorization error. Please try again later.");
      setIsLoading(false);
    }
  };

  const redeemPoints = () => {
    if (
      contact?.Points_Balance__c - getTotalPoints() >= 0 &&
      cartItems.length > 0
    ) {
      if (cartItems.every((item) => item.Needs_to_be_shipped__c === false)) {
        setOpenCheckoutDrawer(false);
        onFinish();
      } else {
        setOpenCheckoutDrawer(true);
      }
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
  }, [clientId]);

  console.log("cartItems", cartItems);
  return (
    <section className={styles.cartIncentivesContainer}>
      <div className={styles.cartListContainer}>
        <List
          itemLayout="horizontal"
          dataSource={cartItems}
          pagination={false}
          renderItem={(item) => (
            <List.Item
              key={item.cartItemId}
              className={styles.cartListItemContainer}
            >
              <Row>
                <Col sm={8}>
                  <Image
                    width="100%"
                    src={item.Image__c || "https://via.placeholder.com/200"}
                    alt="Your Image"
                  />
                </Col>
                <Col
                  sm={16}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div className={styles.cartListItemInfoContainer}>
                    <p>{item.incentive}</p>
                    <p className={styles.cartListItemPointsText}>
                      {NumberWithCommas(item.Points__c || 0)} points
                    </p>
                  </div>
                  <p>
                    {item.Customization__c
                      ? `Customization: ${item.Customization__c}`
                      : ""}
                  </p>
                  <Button
                    className={styles.cartListItemActionBtn}
                    onClick={() => removeCartItem(item.cartItemId)}
                  >
                    <span className={styles.cartItemActionBtn}>Remove</span>
                    {/* <span>{getCartCount(item)}</span>
                    <span className={styles.cartItemActionBtn}>+</span> */}
                  </Button>
                </Col>
              </Row>
            </List.Item>
          )}
        />
      </div>
      <div className={styles.cartPointsContainer}>
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
          <Button
            // className={styles.submitBtn}
            style={{
              marginTop: "10px",
              margin: "10px auto",
              width: "fit-content",
              display: "block",
            }}
            onClick={redeemPoints}
            loading={isLoading}
            disabled={contact?.Points_Balance__c - getTotalPoints() < 0}
          >
            Redeem Points
          </Button>
          {contact?.Points_Balance__c - getTotalPoints() < 0 && (
            <p
              style={{ color: "red", fontWeight: "bold", textAlign: "center" }}
            >You don't have enough points to checkout!</p>
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

export default CartSection;
