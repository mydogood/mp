import React, { FC, ReactNode, useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import type { TableProps } from "antd";
import { Table, Tag, List } from "antd";
import "dayjs/locale/en";
import type {
  ColumnsType,
  ColumnType,
  FilterValue,
} from "antd/es/table/interface";
import AcceptMeetingDetailsDrawer from "./ui/AcceptMeetingDetailsDrawer";
import styles from "./styles.module.sass";
import { fetchDataFromSalesForce } from "../../../salesforceAuth";
import { useParams } from "react-router-dom";

interface PartnersDataType {
  key: string;
  partnerName: string;
  overview: string;
  hasRequested: boolean;
}

interface DataType {
  key: string;
  incentive: string;
  moreInfo: string;
  meetingsRequired: number;
}

interface ClosedMeetingsTableDataType {
  key: string;
  partnerName: string;
  overview?: string;
  hasRequested?: boolean;
  incentive: string;
  moreInfo?: string;
  meetingsRequired?: number;
  stage: string;
  meetingDate: string;
  scheduleMeeting: string;
  calendarLink: string;
  showFeedbackLink: boolean;
  memberFeedbackDate: string;
  memberFeedbackLink: string;
  meetingCompletedDate: string;
}

const ClosedMeetingsTable: FC = () => {
  const [filteredInfo, setFilteredInfo] = useState<
    Record<string, FilterValue | null>
  >({});
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedPartner, setSelectedPartner] =
    useState<ClosedMeetingsTableDataType | null>(null);
  const [data, setData] = useState<ClosedMeetingsTableDataType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { clientId } = useParams<{ clientId: string }>();

  function formatDate(dateString: string): string {
    const parts = dateString.split("-");
    if (parts.length === 3) {
      const month = Number(parts[1]).toString();
      const day = Number(parts[2]).toString();
      return `${month}/${day}/${parts[0]}`;
    }
    return dateString;
  }

  useEffect(() => {
    async function fetchData() {
      try {
        // Запрашиваем данные из Salesforce. В вашем случае, это данные о партнерах.
        const salesForceData = await fetchDataFromSalesForce(
          `query/?q=SELECT+Id,Client_Name__c,MemberC__c,Stage_MP__c,Stage_M__c,Request_Submitted_Date_M__c ,Incentive_Copy1__c,Meeting_Date_M__c,CMT_Calendar_Link__c,Member_Feedback_Link__c,Member_Feedback_Date__c,Meeting_Completed_Date__c+FROM+Meeting__c+WHERE+(Stage_MP__c=\'Canceled by Client\'+OR+Stage_MP__c=\'Canceled by Member\'+OR+Stage_MP__c=\'Meeting Completed\')+AND+MemberC__c='${clientId}'`
        );

        const transformedData = salesForceData.records.map((record: any) => ({
          key: record.Id,
          partnerName: record.Client_Name__c,
          stage: record.Stage_MP__c || "",
          incentive: record.Incentive_Copy1__c || "",
          // meetingDate: record.Request_Submitted_Date_M__c || "",
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
        setData(transformedData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    }

    void fetchData();
  }, []);

  const isMobile = useMediaQuery({ maxWidth: 880 });
  const onCloseDrawer = () => {
    setSelectedPartner(null);
    setOpenDrawer(false);
  };

  const showDrawer = (partner: ClosedMeetingsTableDataType) => {
    setSelectedPartner(partner);
    setOpenDrawer(true);
  };

  const handleChange: TableProps<ClosedMeetingsTableDataType>["onChange"] = (
    pagination,
    filters,
    sorter
  ) => {
    setFilteredInfo(filters);
  };
  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };

  const columns: ColumnsType<ClosedMeetingsTableDataType> = [
    {
      title: "NAME",
      dataIndex: "partnerName",
      key: "name",
      filteredValue: filteredInfo.partnerName || null,
      onFilter: (value, record) =>
        record.partnerName.includes(value.toString()),
      sorter: (a, b) => a.partnerName.localeCompare(b.partnerName),
      onCell: (record) => ({
        onClick: () => showDrawer(record),
      }),
    },
    {
      title: "",
      dataIndex: "meetingCompletedDate",
      key: "meetingCompletedDate",
      defaultSortOrder: "descend",
      sorter: (a, b) =>
        new Date(a.meetingCompletedDate || 0).getTime() -
        new Date(b.meetingCompletedDate || 0).getTime(),
      render: () => null,
      sortIcon: () => null,
    },
    {
      title: "Stage",
      dataIndex: "stage",
      key: "stage",
      sorter: (a, b) => a.stage.localeCompare(b.stage),
      onCell: (record) => ({
        onClick: () => showDrawer(record),
      }),
      render: (value) => (value ? <Tag color={"blue"}>{value}</Tag> : "-"),
    },
    {
      title: "Meeting Date",
      dataIndex: "meetingDate",
      key: "meetingDate",
      sorter: (a, b) =>
        new Date(a.meetingDate || 0).getTime() -
        new Date(b.meetingDate || 0).getTime(),
      render: (value) => (value ? formatDate(value) : "-"),
      onCell: (record) => ({
        onClick: () => showDrawer(record),
      }),
    },
    {
      title: "Schedule Meeting",
      dataIndex: "scheduleMeeting",
      key: "scheduleMeeting",
      render: (value, record) => {
        return value === "Scheduling Meeting" ? (
          <div className={styles.btnScheduleMeeting}>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={record.calendarLink}
            >
              Schedule Meeting
            </a>
          </div>
        ) : (
          "-"
        );
      },
      sorter: (a, b) =>
        (a.scheduleMeeting === "Scheduling Meeting" ? 1 : 0) -
        (b.scheduleMeeting === "Scheduling Meeting" ? 1 : 0),
    },
    {
      title: "Feedback Link",
      dataIndex: "showFeedbackLink",
      key: "showFeedbackLink",
      render: (value, record) =>
        value ? (
          <a
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "underline", color: "black" }}
            href={record.memberFeedbackLink}
          >
            Submit here
          </a>
        ) : (
          "-"
        ),
      sorter: (a, b) =>
        (a.showFeedbackLink ? 1 : 0) - (b.showFeedbackLink ? 1 : 0),
    },
  ];

  return (
    <>
      {isMobile ? (
        <section className={styles.acceptedMeetingsTableContainer}>
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
              <List.Item
                onClick={() => showDrawer(item)}
                className={styles.mobileListItemContainer}
              >
                <div className={styles.mobileListFirstColumn}>
                  <span className={styles.mobileListTitle}>
                    {item.partnerName}
                  </span>
                  <p>Stage</p>
                  <p>Incentive</p>
                  <p>Meeting Date</p>
                  <p>Schedule Meeting</p>
                  <p>Feedback Link</p>
                </div>
                <div className={styles.mobileListSecondColumn}>
                  <span className={styles.mobileListTitle}></span>
                  {columns.map(
                    (
                      column: ColumnType<ClosedMeetingsTableDataType>,
                      index
                    ) => {
                      if (index === 0) {
                        return null;
                      }
                      return (
                        <p key={`${item.key}${column.key}`}>
                          {column.render
                            ? (column.render(
                                item[
                                  column.dataIndex as keyof ClosedMeetingsTableDataType
                                ],
                                item,
                                index
                              ) as ReactNode)
                            : item[
                                column.dataIndex as keyof ClosedMeetingsTableDataType
                              ]}
                        </p>
                      );
                    }
                  )}
                </div>
              </List.Item>
            )}
          />
          <AcceptMeetingDetailsDrawer
            acceptedMeetingsDetails={selectedPartner}
            isOpen={openDrawer}
            onClose={onCloseDrawer}
          />
        </section>
      ) : (
        <section className={styles.acceptedMeetingsTableContainer}>
          <Table
            columns={columns}
            style={{ minHeight: "100%" }}
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
          <AcceptMeetingDetailsDrawer
            acceptedMeetingsDetails={selectedPartner}
            isOpen={openDrawer}
            onClose={onCloseDrawer}
          />
        </section>
      )}
    </>
  );
};

export default ClosedMeetingsTable;
