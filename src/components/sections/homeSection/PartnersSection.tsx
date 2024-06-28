import { FC, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import type { TableProps } from "antd";
import { Space, Table, Drawer, Pagination, Spin } from "antd";
import type {
  ColumnsType,
  FilterValue,
  SorterResult,
} from "antd/es/table/interface";
import {
  GetIncentiveDataType,
  useGetPartnersAndIncentivesContext,
  usePartnerContext,
} from "./contexts/IncentivesContext";
import PartnerDrawer from "./PartnerDrawer";
import PartnerModal from "./PartnerModal";
import styles from "./styles.module.sass";
import { ReactComponent as Filter } from "../../../images/svgIcons/filter.svg";
import { ReactComponent as AcceptIcon } from "../../../images/svgIcons/acceptIcon.svg";
import { ReactComponent as DeclineIcon } from "../../../images/svgIcons/declineIcon.svg";
import { ReactComponent as ProgressIcon } from "../../../images/svgIcons/progressIcon.svg";
import { ReactComponent as DefaultIcon } from "../../../images/svgIcons/defaultIcon.svg";
import { useParams } from "react-router-dom";
import {
  usePartnerDetails,
  useSalesForceData,
  useSalesForceDataWithThreeQueries,
  useSalesForceDataWithTwoQueries,
} from "../../../getSalesForceData";
import { fetchDataFromSalesForce } from "../../../salesforceAuth";

interface PartnersDataType {
  key: string;
  partnerName: string;
  clientKey?: string;
  overview: string;
  hasRequested: boolean;
  website?: string;
  richMerge?: string;
  surveyOptionName?: string[];
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
  Related_Membership__c: string;
  Related_Membership_Member__c: string;
  Survey_Option_Name__c: string[];
  filterCategory?: string[];
  Client_Logo__c?: string;
  Client_Decline_Reason__c?: string;
}

interface SalesForcePartner {
  Id: string;
  Client_Id__c?: string;
  Account_ID__c?: string;
  Client_Name__c: string;
  Account_Name_Merge_Only__c: string;
  Quick_Overview__c: string;
  Client_Website__c?: string;
  Website?: string;
  Rich_Merge__c?: string;
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
  Related_Membership__c: string;
  Related_Membership_Member__c: string;
  Survey_Option_Name__c: string[];
  Client_Logo__c?: string;
}

const QUERY1 = (clientId: string | undefined) =>
  `query/?q=SELECT+Id,Client_Id__c,Client_Name__c,Related_Membership_Member__c,Quick_Overview__c,Client_Website__c,Client_Logo__c,Stage_M__c,Stage_MP__c,Sweepstakes_Type__c+FROM+Meeting__c+WHERE+Stage_M__c='Request+Queued'+AND+MemberC__c='${clientId}'`;
const QUERY2 = `query/?q=SELECT+Id,Account_ID__c,Related_Membership__c,Account_Name_Merge_Only__c,Website,Client_Logo__c,Quick_Overview__c,Client_Campaign_ID__c+FROM+Account+WHERE+RecordTypeId='01236000000OodE'+AND+(Client_Campaign_Status__c='Active'+OR+Client_Campaign_Status__c='Testing')`;
const QUERY3 = (recordIds: string[]) =>
  `query/?q=SELECT+Client_Name__c,Survey_Option_Name__c+FROM+Survey__c+WHERE+Client_Name__c+IN+(${recordIds
    .map((id) => `'${id}'`)
    .join(",")})`;
const transformer = (primaryData: SalesForcePartner, relatedData?: any) => {
  const surveyOptions = Array.isArray(relatedData?.Survey_Option_Name__c)
    ? relatedData.Survey_Option_Name__c
    : Array.isArray(relatedData?.Survey_Option_Name__c)
    ? [relatedData.Survey_Option_Name__c]
    : [];

  return {
    key: primaryData.Id,
    clientKey: primaryData.Client_Id__c || primaryData.Account_ID__c,
    website: primaryData.Client_Website__c || primaryData.Website,
    partnerName:
      primaryData.Client_Name__c || primaryData.Account_Name_Merge_Only__c,
    overview: primaryData.Quick_Overview__c || "No quick overview",
    hasRequested: primaryData.Stage_M__c === "Request Queued",
    richMerge: primaryData.Rich_Merge__c,
    Survey_Option_Name__c: surveyOptions,
    Stage_M__c: primaryData.Stage_M__c || "",
    Stage_MP__c: primaryData.Stage_MP__c || "",
    Sweepstakes_Type__c: primaryData.Sweepstakes_Type__c || "",
    Client_Campaign_ID__c: primaryData.Client_Campaign_ID__c,
    Related_Membership__c: primaryData.Related_Membership__c,
    Related_Membership_Member__c: primaryData.Related_Membership_Member__c,
    Client_Logo__c: primaryData.Client_Logo__c,
  };
};
type MeetingRecord = {
  Client_Id__c: string;
};
type Transformer<T, U> = (input: T) => U;
const QUERY_REQUESTED_MEETINGS = (clientId: string | undefined) =>
  `query/?q=SELECT+Client_Id__c+FROM+Meeting__c+WHERE+Stage_M__c!='Request Queued'+AND+MemberC__c='${clientId}'`;

const clientIDTransformer: Transformer<MeetingRecord, string> = (
  record: MeetingRecord
) => record.Client_Id__c;

const PartnersSection: FC = () => {
  const [filteredInfo, setFilteredInfo] = useState<
    Record<string, FilterValue | null>
  >({});
  const [sortedInfo, setSortedInfo] = useState<SorterResult<PartnersDataType>>(
    {}
  );
  const [open, setOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] =
    useState<PartnersDataType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewOnlyRequested, setViewOnlyRequested] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState<string>("");
  const [loadingPartnerDetails, setLoadingPartnerDetails] = useState(false);
  const [appliedViewOnlyRequested, setAppliedViewOnlyRequested] =
    useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const {
    requestedList,
    declinedList,
    acceptedList,
    savedAcceptedList,
    setSavedAcceptedList,
  } = usePartnerContext();
  const { incentiveFromSalesForce } = useGetPartnersAndIncentivesContext();
  const { clientId } = useParams<{ clientId: string }>();

  const { data: partnersFromSalesForce, fetchData } =
    useSalesForceDataWithThreeQueries(
      QUERY1(clientId),
      QUERY2,
      QUERY3,
      transformer
    );

  const requestedClientIDs = useSalesForceData(
    QUERY_REQUESTED_MEETINGS(clientId),
    clientIDTransformer
  );

  useEffect(() => {
    if (partnersFromSalesForce && partnersFromSalesForce.length > 0) {
      const filteredPartners = partnersFromSalesForce.filter(
        (partner, index, self) => {
          return (
            self.findIndex((p) => p.clientKey === partner.clientKey) === index
          );
        }
      );
      setSavedAcceptedList(filteredPartners);
    }
  }, [partnersFromSalesForce]);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const showDrawer = async (partner: PartnersDataType) => {
    setSelectedPartner(partner);
    setLoadingPartnerDetails(true);
    try {
      const response = await fetchDataFromSalesForce(
        `query/?q=SELECT+Rich_Merge__c+FROM+Client_Pitch__c+WHERE+Active__c=true+AND+Custom_Outreach__c=true+AND+(Client_Id__c='${partner.clientKey}'+OR+Client_Id__c='${partner.key}')`
      );
      if (
        response &&
        response.records &&
        response.records[0] &&
        response.records[0].Rich_Merge__c
      ) {
        setSelectedPartner((prev) => ({
          ...prev!,
          richMerge: response.records[0].Rich_Merge__c,
        }));
      } else {
        console.error("Invalid data format:", response);
      }
    } catch (error) {
      console.error("Error fetching partner details:", error);
    } finally {
      setLoadingPartnerDetails(false);
    }

    setOpen(true);
  };

  const onCloseDrawer = () => {
    setSelectedPartner(null);
    setOpen(false);
    setTimeout(() => {
      fetchData();
    }, 5000);
  };

  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };

  const getPartnerStatus = (partner: PartnersDataType) => {
    if (acceptedList.some((item) => item.key === partner.key)) {
      return "accepted";
    } else if (requestedList.some((item) => item.key === partner.key)) {
      return "requested";
    } else if (declinedList.some((item) => item.key === partner.key)) {
      return "declined";
    }
    return "";
  };

  const handleChange: TableProps<PartnersDataType>["onChange"] = (
    pagination,
    filters,
    sorter
  ) => {
    console.log("Various parameters", pagination, filters, sorter);
    setFilteredInfo(filters);
    setSortedInfo(sorter as SorterResult<PartnersDataType>);
  };

  const handleViewOnlyRequestedChange = (checked: boolean) => {
    setCurrentPage(1);
    setViewOnlyRequested(checked);
  };

  const handleApply = (
    value: string,
    viewOnlyRequested: boolean,
    selectedCategories: string[]
  ) => {
    setSearchValue(value);
    setAppliedViewOnlyRequested(viewOnlyRequested);
    setSelectedCategories(selectedCategories);
    handleOk();
  };

  const filteredData = useMemo(() => {
    let filtered = [...savedAcceptedList]; // Клонировать массив, чтобы избежать мутации

    if (searchValue) {
      filtered = filtered.filter(
        (partner) =>
          partner.partnerName
            .toLowerCase()
            .includes(searchValue.toLowerCase()) ||
          partner.overview.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    if (selectedCategories.length) {
      filtered = filtered
        .map((partner) => {
          const matchingCategories = selectedCategories.filter((category) =>
            partner.Survey_Option_Name__c?.some((option) => option === category)
          );

          if (matchingCategories.length) {
            return {
              ...partner,
              filterCategory: matchingCategories,
            };
          }
          return partner;
        })
        .filter(
          (partner) => partner.filterCategory && partner.filterCategory.length
        );
    }

    if (requestedClientIDs && requestedClientIDs.length > 0) {
      filtered = filtered.filter(
        (partner) =>
          partner.clientKey && !requestedClientIDs.includes(partner.clientKey)
      );
    }

    if (appliedViewOnlyRequested) {
      filtered = filtered.filter((item) => item.hasRequested);
    }

    return filtered;
  }, [
    savedAcceptedList,
    searchValue,
    appliedViewOnlyRequested,
    selectedCategories,
    requestedClientIDs,
  ]);

  const sortedData = useMemo(() => {
    if (sortedInfo && sortedInfo.columnKey === "name") {
      if (sortedInfo.order === "ascend") {
        return [...filteredData].sort((a, b) =>
          a.partnerName.localeCompare(b.partnerName)
        );
      } else if (sortedInfo.order === "descend") {
        return [...filteredData].sort((a, b) =>
          b.partnerName.localeCompare(a.partnerName)
        );
      }
    }
    return filteredData; // Если sortedInfo.order не 'ascend' или 'descend', возвращаем исходные данные
  }, [filteredData, sortedInfo]);

  const startIndex = (currentPage - 1) * 10;
  const endIndex = startIndex + 10;
  const paginatedData = sortedData
    ? sortedData.slice(startIndex, endIndex)
    : [];

  const columns: ColumnsType<PartnersDataType> = [
    {
      title: "NAME",
      dataIndex: "partnerName",
      key: "name",
      filteredValue: filteredInfo.partnerName || null,
      onFilter: (value, record) =>
        record.partnerName.includes(value.toString()),
      sorter: (a, b) => a.partnerName.localeCompare(b.partnerName),
      sortOrder: sortedInfo.columnKey === "name" ? sortedInfo.order : null,
      render: (text, record) => {
        const displayText =
          record.hasRequested && record.partnerName
            ? record.partnerName.slice(0)
            : text;
        const partnerStatus = getPartnerStatus(record);

        return (
          <div className={styles.partnersNameContainer}>
            <span className={styles.partnersName}>
              {partnerStatus === "requested" ? (
                <ProgressIcon className={styles.statusIcon} />
              ) : partnerStatus === "accepted" ? (
                <AcceptIcon className={styles.statusIcon} />
              ) : partnerStatus === "declined" ? (
                <DeclineIcon className={styles.statusIcon} />
              ) : (
                <DefaultIcon className={styles.statusIcon} />
              )}
              {displayText}
            </span>
            {record.hasRequested && (
              <span className={styles.orangeStar}> ★</span>
            )}
          </div>
        );
      },
    },
    {
      title: "Quick Overview",
      dataIndex: "overview",
      key: "overview",
      width: "65%",
      render: (text, record) => {
        const partnerStatus = getPartnerStatus(record);
        return <span>{text}</span>;
      },
    },
  ];

  return (
    <section className={styles.partnersContainer}>
      <PartnerModal
        isModalOpen={isModalOpen}
        onShowModal={showModal}
        onOk={handleOk}
        OnCancel={handleCancel}
        onViewOnlyRequestedChange={handleViewOnlyRequestedChange}
        onApply={handleApply}
      />
      <div className={styles.partnersTitleContainer}>
        <div className={styles.partnersTitle}>
          <h2>Partners</h2>
          <small>Click a partner name below for more information</small>
        </div>
        <button onClick={showModal} className={styles.filterBtn}>
          {" "}
          <Filter /> Filter
        </button>
      </div>
      <Space style={{ marginBottom: 16 }}></Space>
      <Table
        onRow={(record) => ({
          onClick: () => showDrawer(record),
        })}
        columns={columns}
        pagination={false}
        dataSource={paginatedData}
        onChange={handleChange}
        className={styles.table}
      />
      <Pagination
        showSizeChanger={false}
        defaultPageSize={10}
        className={styles.paginationPartners}
        defaultCurrent={currentPage}
        total={filteredData.length}
        onChange={handleChangePage}
      />
      <small className={styles.requested}>
        Partners who have requested to meet with you.
      </small>
      <PartnerDrawer
        isOpen={open}
        onClose={onCloseDrawer}
        partnerDetails={selectedPartner}
      />
    </section>
  );
};

export default PartnersSection;
