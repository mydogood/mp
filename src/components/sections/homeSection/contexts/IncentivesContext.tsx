import React, {
  createContext,
  useContext,
  useState,
  FC,
  ReactNode,
  useEffect,
} from "react";

import {
  useSalesForceData,
  useSalesForceDataWithTwoQueries,
} from "../../../../getSalesForceData";
import { updateDataInSalesForce } from "../../../../salesforceAuth";
import { SelectedIncentivesDataType } from "../../incentivesSection/SelectedIncentivesSection";

interface DataType {
  key: string;
  incentive: string;
  moreInfo: string | JSX.Element;
  meetingsRequired: number;
}

interface IncentivesContextProps {
  selectedIncentives: DataType[];
  setSelectedIncentives: React.Dispatch<React.SetStateAction<DataType[]>>;
  setIncentiveCounts: React.Dispatch<
    React.SetStateAction<{ [key: string]: number }>
  >;
  addSelectedIncentive: (incentive: DataType) => void;
  removeSelectedIncentive: (key: string) => void;
  totalMeetingsRequired: number;
  incentiveCounts: { [key: string]: number };
  submitConfirmed: boolean; // Добавили это
  setSubmitConfirmed: React.Dispatch<React.SetStateAction<boolean>>;
  resetSubmitConfirmed: () => void;
  savedSelectedIncentives: DataType[];
  setSavedSelectedIncentives: React.Dispatch<React.SetStateAction<DataType[]>>;
  savedIncentiveCounts: { [key: string]: number };
  setSavedIncentiveCounts: React.Dispatch<
    React.SetStateAction<{ [key: string]: number }>
  >;
  cartItems: SelectedIncentivesDataType[];
  setCartItems: React.Dispatch<
    React.SetStateAction<SelectedIncentivesDataType[]>
  >;
}

const IncentivesContext = createContext<IncentivesContextProps | undefined>(
  undefined
);

export const IncentivesProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [selectedIncentives, setSelectedIncentives] = useState<DataType[]>([]);
  const [incentiveCounts, setIncentiveCounts] = useState<{
    [key: string]: number;
  }>({});
  const [submitConfirmed, setSubmitConfirmed] = useState(false);

  const [savedSelectedIncentives, setSavedSelectedIncentives] = useState<
    DataType[]
  >([]);
  const [savedIncentiveCounts, setSavedIncentiveCounts] = useState<{
    [key: string]: number;
  }>({});
  const [cartItems, setCartItems] = useState<SelectedIncentivesDataType[]>([]);

  // Saving data to localStorage every time it changes
  useEffect(() => {
    const storedSelectedIncentives = JSON.parse(
      localStorage.getItem("selectedIncentives") || "[]"
    );
    const storedIncentiveCounts = JSON.parse(
      localStorage.getItem("incentiveCounts") || "{}"
    );
    const cartItems = JSON.parse(
      localStorage.getItem("incentiveCartItems") || "[]"
    );

    if (storedSelectedIncentives.length > 0)
      setSelectedIncentives(storedSelectedIncentives);
    if (Object.keys(storedIncentiveCounts).length > 0)
      setIncentiveCounts(storedIncentiveCounts);
    if (cartItems.length > 0) setCartItems(cartItems);
  }, []);

  // Retrieving data from localStorage when loading a component
  useEffect(() => {
    localStorage.setItem(
      "selectedIncentives",
      JSON.stringify(selectedIncentives)
    );
    localStorage.setItem("incentiveCounts", JSON.stringify(incentiveCounts));
    localStorage.setItem("incentiveCartItems", JSON.stringify(cartItems));
  }, [selectedIncentives, incentiveCounts, cartItems]);

  const resetSubmitConfirmed = () => {
    setSubmitConfirmed(false);
  };
  const addSelectedIncentive = (incentive: DataType) => {
    const existingIndex = selectedIncentives.findIndex(
      (item) => item.key === incentive.key
    );

    if (existingIndex !== -1) {
      setIncentiveCounts((prevCounts) => ({
        ...prevCounts,
        [incentive.key]: (prevCounts[incentive.key] || 0) + 1,
      }));
    } else {
      setSelectedIncentives((prevSelectedIncentives) => [
        ...prevSelectedIncentives,
        incentive,
      ]);
      setIncentiveCounts((prevCounts) => ({
        ...prevCounts,
        [incentive.key]: 1,
      }));
    }
  };

  const removeSelectedIncentive = (key: string) => {
    setSelectedIncentives((prevSelectedIncentives) =>
      prevSelectedIncentives.filter((item) => item.key !== key)
    );
    setIncentiveCounts((prevCounts) => ({
      ...prevCounts,
      [key]: (prevCounts[key] || 0) - 1,
    }));
  };

  const totalMeetingsRequired = selectedIncentives.reduce((total, item) => {
    return total + item.meetingsRequired * (incentiveCounts[item.key] || 1);
  }, 0);

  return (
    <IncentivesContext.Provider
      value={{
        selectedIncentives,
        addSelectedIncentive,
        removeSelectedIncentive,
        totalMeetingsRequired,
        incentiveCounts,
        setSelectedIncentives,
        setIncentiveCounts,
        submitConfirmed,
        setSubmitConfirmed,
        resetSubmitConfirmed,
        savedSelectedIncentives,
        setSavedSelectedIncentives,
        savedIncentiveCounts,
        setSavedIncentiveCounts,
        cartItems,
        setCartItems,
      }}
    >
      {children}
    </IncentivesContext.Provider>
  );
};

export const useIncentivesContext = (): IncentivesContextProps => {
  const context = useContext(IncentivesContext);
  if (!context) {
    throw new Error(
      "useIncentivesContext must be used within an IncentivesProvider"
    );
  }
  return context;
};

interface PartnersDataType {
  filterCategory?: string[];
  Related_Membership_Member__c: string;
  Related_Membership__c: string;
  key: string;
  clientKey?: string;
  partnerName: string;
  overview: string;
  hasRequested: boolean;
  declineReason?: string | JSX.Element;
  Stage_M__c?: string;
  Stage_MP__c?: string;
  Sweepstakes_Type__c?: string;
  Interest_in_Partner__c?: string;
  RecordTypeId?: string;
  Client_Campaign__c?: string;
  Meeting_Source__c?: string;
  Intro_Type__c?: string;
  Request_Submitted_Date_M__c?: string;
  Survey_Option_Name__c: string[];
}

interface PartnerContextType {
  acceptedList: PartnersDataType[];
  setAcceptedList: React.Dispatch<React.SetStateAction<PartnersDataType[]>>;
  setRequestedList: React.Dispatch<React.SetStateAction<PartnersDataType[]>>;
  setDeclinedList: React.Dispatch<React.SetStateAction<PartnersDataType[]>>;
  requestedList: PartnersDataType[];
  declinedList: PartnersDataType[];
  savedAcceptedList: PartnersDataType[];
  savedRequestedList: PartnersDataType[];
  savedDeclinedList: PartnersDataType[];
  setSavedAcceptedList: React.Dispatch<
    React.SetStateAction<PartnersDataType[]>
  >;
  setSavedRequestedList: React.Dispatch<
    React.SetStateAction<PartnersDataType[]>
  >;
  setSavedDeclinedList: React.Dispatch<
    React.SetStateAction<PartnersDataType[]>
  >;
  addAcceptedPartner: (partnerName: PartnersDataType) => void;
  addRequestedPartner: (partnerName: PartnersDataType) => void;
  addDeclinedPartner: (partnerName: PartnersDataType) => void;
  removeAcceptedPartner: (partnerName: PartnersDataType) => void;
  removeRequestedPartner: (partnerName: PartnersDataType) => void;
  removeDeclinePartner: (partnerName: PartnersDataType) => void;
  removeSavedDeclinePartner: (partnerName: PartnersDataType) => void;
  submitConfirmed: boolean; // Добавили это
  setSubmitConfirmed: React.Dispatch<React.SetStateAction<boolean>>;
  resetSubmitConfirmed: () => void;
}

const PartnerContext = createContext<PartnerContextType | undefined>(undefined);

export const PartnerContextProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [acceptedList, setAcceptedList] = useState<PartnersDataType[]>([]);
  const [requestedList, setRequestedList] = useState<PartnersDataType[]>([]);
  const [declinedList, setDeclinedList] = useState<PartnersDataType[]>([]);
  const [submitConfirmed, setSubmitConfirmed] = useState(false);
  const [savedAcceptedList, setSavedAcceptedList] = useState<
    PartnersDataType[]
  >([]);
  const [savedRequestedList, setSavedRequestedList] = useState<
    PartnersDataType[]
  >([]);
  const [savedDeclinedList, setSavedDeclinedList] = useState<
    PartnersDataType[]
  >([]);

  // Сохранение данных в localStorage при каждом изменении
  useEffect(() => {
    const storedAcceptedList = JSON.parse(
      localStorage.getItem("acceptedList") || "[]"
    );
    const storedRequestedList = JSON.parse(
      localStorage.getItem("requestedList") || "[]"
    );
    const storedDeclinedList = JSON.parse(
      localStorage.getItem("declinedList") || "[]"
    );

    if (storedAcceptedList.length > 0) setAcceptedList(storedAcceptedList);
    if (storedRequestedList.length > 0) setRequestedList(storedRequestedList);
    if (storedDeclinedList.length > 0) setDeclinedList(storedDeclinedList);
  }, []);

  // Получение данных из localStorage при загрузке компонента
  useEffect(() => {
    localStorage.setItem("acceptedList", JSON.stringify(acceptedList));
    localStorage.setItem("requestedList", JSON.stringify(requestedList));
    localStorage.setItem("declinedList", JSON.stringify(declinedList));
  }, [acceptedList, requestedList, declinedList]);

  const resetSubmitConfirmed = () => {
    setSubmitConfirmed(false);
  };
  const addAcceptedPartner = (partner: PartnersDataType) => {
    if (!acceptedList.some((item) => item.key === partner.key)) {
      setAcceptedList([...acceptedList, partner]);
    }
  };

  const addRequestedPartner = (partner: PartnersDataType) => {
    if (!requestedList.some((item) => item.key === partner.key)) {
      setRequestedList([...requestedList, partner]);
    }
  };

  const addDeclinedPartner = (partner: PartnersDataType) => {
    if (!declinedList.some((item) => item.key === partner.key)) {
      setDeclinedList([...declinedList, partner]);
    }
  };

  const removeAcceptedPartner = (partnerName: PartnersDataType) => {
    const updatedList = acceptedList.filter(
      (partner) => partner.key !== partnerName.key
    );
    setAcceptedList(updatedList);
  };

  const removeRequestedPartner = (partnerName: PartnersDataType) => {
    const updatedList = requestedList.filter(
      (partner) => partner.key !== partnerName.key
    );
    setRequestedList(updatedList);
  };

  const removeDeclinePartner = (partnerName: PartnersDataType) => {
    const updatedList = declinedList.filter(
      (partner) => partner.key !== partnerName.key
    );
    setDeclinedList(updatedList);
  };

  const removeSavedDeclinePartner = (partnerName: PartnersDataType) => {
    const updatedList = savedDeclinedList.filter(
      (partner) => partner.key !== partnerName.key
    );
    setSavedDeclinedList(updatedList);
  };

  return (
    <PartnerContext.Provider
      value={{
        acceptedList,
        requestedList,
        declinedList,
        setAcceptedList,
        setRequestedList,
        setDeclinedList,
        addAcceptedPartner,
        addRequestedPartner,
        addDeclinedPartner,
        removeAcceptedPartner,
        removeRequestedPartner,
        removeDeclinePartner,
        submitConfirmed,
        setSubmitConfirmed,
        resetSubmitConfirmed,
        savedAcceptedList,
        savedRequestedList,
        savedDeclinedList,
        setSavedAcceptedList,
        setSavedRequestedList,
        setSavedDeclinedList,
        removeSavedDeclinePartner,
      }}
    >
      {children}
    </PartnerContext.Provider>
  );
};

export const usePartnerContext = () => {
  const context = useContext(PartnerContext);
  if (!context) {
    throw new Error("usePartnerContext must be used within a PartnerProvider");
  }
  return context;
};

interface GetPartnersDataType {
  key: string;
  clientKey?: string;
  partnerName: string;
  overview: string;
  hasRequested: boolean;
  website?: string;
  richMerge?: string;
  surveyOptionName?: string;
}

export interface GetIncentiveDataType {
  key: string;
  incentive: string;
  moreInfo: string | JSX.Element;
  meetingsRequired: number;
  Incentive_Category__c: string;
  Product_Type__c: string;
  Points__c?: number;
  CreatedDate?: string;
}

type DataContextType = {
  incentiveFromSalesForce: GetIncentiveDataType[];
};

interface SalesForcePartner {
  Id: string;
  Client_Id__c?: string;
  Client_Name__c: string;
  Quick_Overview__c: string;
  Client_Website__c?: string;
  Rich_Merge__c?: string;
}

interface SalesForceIncentive {
  Id: string;
  Incentive_Copy__c: string;
  Website__c: string;
  Image__c?: string;
  Meetings_Needed__c: number;
  Incentive_Category__c: string;
  Product_Type__c: string;
  Points__c?: number;
  Customization_Options__c?: string;
  Needs_to_be_shipped__c?: string;
  CreatedDate?: string;
}

const GetPartnersAndIncentivesContext = createContext<
  DataContextType | undefined
>(undefined);

export const GetPartnersAndIncentivesContextProvider: FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const incentiveFromSalesForce = useSalesForceData(
    "query/?q=SELECT+Id,Incentive_Copy__c,Website__c,Image__c,Meetings_Needed__c,Incentive_Category__c,Product_Type__c,Points__c,CreatedDate,Needs_to_be_shipped__c,Customization_Options__c+FROM+Incentive__c+WHERE+Live__c=true",
    (record: SalesForceIncentive) => {
      let moreInfoElement: JSX.Element | string = "-";

      if (record.Website__c) {
        try {
          const url = new URL(record.Website__c);
          let domain = url.hostname;

          // Если 'www.' отсутствует в начале хоста, добавьте его
          if (!domain.startsWith("www.")) {
            domain = "www." + domain;
          }

          moreInfoElement = (
            <a
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "underline", color: "black" }}
              href={record.Website__c}
            >
              {domain}
            </a>
          );
        } catch (error) {
          console.error(
            `Invalid URL for record ${record.Id}:`,
            record.Website__c
          );
          moreInfoElement = record.Website__c;
        }
      }

      return {
        key: record.Id,
        incentive: record.Incentive_Copy__c,
        moreInfo: moreInfoElement,
        meetingsRequired: record.Meetings_Needed__c,
        Incentive_Category__c: record.Incentive_Category__c,
        Product_Type__c: record.Product_Type__c,
        Website__c: record.Website__c,
        Image__c: record.Image__c,
        Points__c: record.Points__c,
        Needs_to_be_shipped__c: record.Needs_to_be_shipped__c,
        Customization_Options__c: record.Customization_Options__c,
        CreatedDate: record.CreatedDate,
      };
    }
  );

  return (
    <GetPartnersAndIncentivesContext.Provider
      value={{ incentiveFromSalesForce }}
    >
      {children}
    </GetPartnersAndIncentivesContext.Provider>
  );
};

export const useGetPartnersAndIncentivesContext = () => {
  const context = useContext(GetPartnersAndIncentivesContext);
  if (!context) {
    throw new Error(
      "useGetPartnersAndIncentivesContext must be used within a PartnerProvider"
    );
  }
  return context;
};
