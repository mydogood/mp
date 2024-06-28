import React, { FC, useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import type { TableProps } from "antd";
import { List, Pagination, Table, Tag } from "antd";
import type {
  ColumnsType,
  FilterValue,
  SorterResult,
} from "antd/es/table/interface";
import {
  usePartnerContext,
  useIncentivesContext,
} from "../homeSection/contexts/IncentivesContext";
import styles from "./styles.module.sass";
import DeclineMeetingDetailsDrawer from "./ui/DeclineMeetingDetailsDrawer";
import {
  fetchDataFromSalesForce,
  updateDataInSalesForce,
} from "../../../salesforceAuth";
import { useParams } from "react-router-dom";

interface PartnersDataType {
  key: string;
  partnerName: string;
  overview: string;
  hasRequested: boolean;
  declineReason?: string | JSX.Element;
  action?: string | JSX.Element;
  Stage_M__c?: string;
  Stage_MP__c?: string;
  Related_Membership_Member__c: string;
  Related_Membership__c: string;
  Survey_Option_Name__c: string[];
  filterCategory?: string[];
  Client_Logo__c?: string;
  memberResponseDate: string;
}

const DeclineMeetingsTable: FC = () => {
  const [filteredInfo, setFilteredInfo] = useState<
    Record<string, FilterValue | null>
  >({});
  // const [sortedInfo, setSortedInfo] = useState<SorterResult<PartnersDataType>>(
  //   {}
  // );
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedPartner, setSelectedPartner] =
    useState<PartnersDataType | null>(null);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const {
    declinedList,
    addRequestedPartner,
    requestedList,
    removeSavedDeclinePartner,
    savedDeclinedList,
  } = usePartnerContext();
  const { selectedIncentives } = useIncentivesContext();
  const partnerContext = usePartnerContext();
  const incentivesContext = useIncentivesContext();
  const [data, setData] = useState<PartnersDataType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { clientId } = useParams<{ clientId: string }>();
  const isMobile = useMediaQuery({ maxWidth: 880 });

  useEffect(() => {
    async function fetchData() {
      try {
        const salesForceData = await fetchDataFromSalesForce(
          `query/?q=SELECT+Id,MemberC__c,Client_Name__c,Quick_Overview__c,Decline_Reason__c,Stage_M__c,Member_Response_Date_M__c+FROM+Meeting__c+WHERE+Stage_M__c=\'Member Declined\'+AND+MemberC__c='${clientId}'`
        );

        const transformedData = salesForceData.records.map((record: any) => ({
          key: record.Id,
          partnerName: record.Client_Name__c,
          overview: record.Quick_Overview__c || "No phone provided",
          hasRequested: true,
          declineReason:
            record.Decline_Reason__c === "Timing"
              ? "No time"
              : record.Decline_Reason__c === "Job Function/Role"
              ? "Does not align w/ role"
              : record.Decline_Reason__c,
          memberResponseDate: record.Member_Response_Date_M__c,
        }));

        setData(transformedData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    }

    void fetchData();
  }, []);

  const onCloseDrawer = () => {
    setSelectedPartner(null);
    setOpenDrawer(false);
  };

  const showDrawer = (partner: PartnersDataType) => {
    setSelectedPartner(partner);
    setOpenDrawer(true);
  };

  const revertPartnerStatusInSalesForce = async (partnerKey: string) => {
    const partner = data.find((p) => p.key === partnerKey);

    if (!partner) {
      console.error("Partner not found!");
      return;
    }

    const updatedData = {
      Stage_M__c: "Request Queued",
    };

    try {
      await updateDataInSalesForce(
        `/sobjects/Meeting__c/${partner.key}`,
        updatedData
      );
      const updatedPartners = data.filter((p) => p.key !== partnerKey);
      setData(updatedPartners);
    } catch (error) {
      console.error("Error reverting partner status:", error);
    }
  };

  const handleRemoveDeclineClick = (partner: PartnersDataType) => {
    setSelectedPartner(partner);
    removeSavedDeclinePartner(partner);
    setIsAcceptModalOpen(false);
  };

  const handleChange: TableProps<PartnersDataType>["onChange"] = (
    pagination,
    filters,
    sorter
  ) => {
    // console.log("Various parameters", pagination, filters, sorter);
    setFilteredInfo(filters);
    // setSortedInfo(sorter as SorterResult<PartnersDataType>);
  };
  // const handleChangePage = (page: number) => {
  //   setCurrentPage(page);
  // };

  const visibleData =
    partnerContext.submitConfirmed && incentivesContext.submitConfirmed
      ? declinedList
      : [];

  const columns: ColumnsType<PartnersDataType> = [
    {
      title: "NAME",
      dataIndex: "partnerName",
      key: "name",
      width: "40%",
      filteredValue: filteredInfo.partnerName || null,
      onFilter: (value, record) =>
        record.partnerName.includes(value.toString()),
      sorter: (a, b) => a.partnerName.localeCompare(b.partnerName),
      // sortOrder: sortedInfo.columnKey === 'name' ? sortedInfo.order : null,
      onCell: (record) => ({
        onClick: () => showDrawer(record),
      }),
    },
    {
      title: "",
      dataIndex: "memberResponseDate",
      key: "memberResponseDate",
      defaultSortOrder: "descend",
      sorter: (a, b) =>
        new Date(a.memberResponseDate || 0).getTime() -
        new Date(b.memberResponseDate || 0).getTime(),
      render: () => null,
      sortIcon: () => null,
    },
    {
      title: "Decline Reason",
      dataIndex: "declineReason",
      key: "declineReason",
      onCell: (record) => ({
        onClick: () => showDrawer(record),
      }),
      render: (text, record) =>
        record.declineReason ? (
          <Tag color={"blue"}>{record.declineReason}</Tag>
        ) : (
          ""
        ),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      onCell: (record) => ({
        onClick: async () => {
          await revertPartnerStatusInSalesForce(record.key);
        },
      }),
      render: (text, action) => (
        <button className={styles.requestBtn}>Change My Choice</button>
      ),
    },
  ];

  return (
    <>
      {isMobile ? (
        <section className={styles.declineMeetingsTableContainer}>
          <List
            itemLayout="horizontal"
            dataSource={data}
            pagination={{
              defaultPageSize: 6,
              defaultCurrent: 1,
              total: data.length,
              style: {
                display: "flex",
                justifyContent: "center",
              },
            }}
            renderItem={(item) => (
              <List.Item className={styles.mobileDeclineListItemContainer}>
                <div
                  onClick={() => showDrawer(item)}
                  className={styles.declineListContainer}
                >
                  <div className={styles.mobileListFirstColumn}>
                    <span className={styles.mobileListTitle}>
                      {item.partnerName}
                    </span>
                    <p>Decline Reason</p>
                  </div>
                  <div className={styles.mobileListSecondColumn}>
                    <span className={styles.mobileListTitle}></span>
                    <p>
                      {item.declineReason ? (
                        <Tag color={"blue"}>{item.declineReason}</Tag>
                      ) : (
                        "—"
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={async () =>
                    await revertPartnerStatusInSalesForce(item.key)
                  }
                  className={styles.requestBtn}
                >
                  Change My Choice
                </button>
              </List.Item>
            )}
          />
          <DeclineMeetingDetailsDrawer
            declineMeetingsDetails={selectedPartner}
            onClose={onCloseDrawer}
            isOpen={openDrawer}
            revertStatus={revertPartnerStatusInSalesForce}
          />
        </section>
      ) : (
        <section className={styles.declineMeetingsTableContainer}>
          <Table
            columns={columns}
            pagination={{
              defaultPageSize: 6,
              defaultCurrent: 1,
              total: data.length,
              style: {
                display: "flex",
                justifyContent: "center",
              },
            }}
            dataSource={data}
            onChange={handleChange}
            className={styles.table}
          />
          <DeclineMeetingDetailsDrawer
            declineMeetingsDetails={selectedPartner}
            onClose={onCloseDrawer}
            isOpen={openDrawer}
            revertStatus={revertPartnerStatusInSalesForce}
          />
        </section>
      )}
    </>
  );
};

export default DeclineMeetingsTable;
