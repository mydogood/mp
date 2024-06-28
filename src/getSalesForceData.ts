import { useState, useEffect, useRef, useCallback } from "react";
import {
  fetchDataFromSalesForce,
  updateDataInSalesForce,
} from "./salesforceAuth";

type Transformer<T, U> = (record: T) => U;

export function useSalesForceData<T, U>(
  query: string,
  transformer: Transformer<T, U>
) {
  const [data, setData] = useState<U[]>([]);
  useEffect(() => {
    async function fetchData() {
      try {
        const salesForceData = await fetchDataFromSalesForce(query);
        const transformedData = salesForceData.records.map(transformer);
        setData(transformedData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    }
    void fetchData();
  }, []);

  return data;
}

type RecordType = {
  Client_Id__c: string;
};

export function useSalesForceDataWithTwoQueries<T, U>(
  firstQuery: string,
  secondQueryTemplate: string,
  transformer: Transformer<T, U>
) {
  const [data, setData] = useState<U[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const firstSalesForceData = await fetchDataFromSalesForce(firstQuery);

        if (
          firstSalesForceData &&
          firstSalesForceData.records &&
          firstSalesForceData.records.length > 0
        ) {
          const promises = firstSalesForceData.records.map(
            async (record: RecordType) => {
              const clientId = record.Client_Id__c;
              const secondQuery = secondQueryTemplate.replace(
                "record.Client_Id__c",
                clientId
              );

              const secondSalesForceData = await fetchDataFromSalesForce(
                secondQuery
              );

              return {
                ...record,
                ...(secondSalesForceData.records.length > 0
                  ? secondSalesForceData.records[0]
                  : {}),
              };
            }
          );

          const combinedRecords = await Promise.all(promises);

          const transformedData = combinedRecords.map(transformer);
          setData(transformedData);
        } else {
          console.warn("No records found in first request");
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    }

    void fetchData();
  }, [firstQuery, secondQueryTemplate]);

  return data;
}

type SalesForcePartner = {
  Id: string;
  Client_Id__c?: string;
  Account_ID__c?: string;
  Member_Account_ID__c?: string;
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
};

export function useSalesForceDataWithThreeQueries<T, U>(
  firstQuery: string,
  secondQuery: string,
  thirdQueryGenerator: (recordIds: string[]) => string,
  transformer: (
    primaryData: SalesForcePartner,
    relatedData?: SalesForcePartner
  ) => U
): {
  data: U[];
  fetchData: () => void;
} {
  const [data, setData] = useState<U[]>([]);

  const fetchData = useCallback(async () => {
    try {
      let allRecords: {
        primaryData: SalesForcePartner;
        relatedData?: SalesForcePartner;
      }[] = [];

      // Processing the first request
      const firstSalesForceData = await fetchDataFromSalesForce(firstQuery);
      if (firstSalesForceData && firstSalesForceData.records) {
        firstSalesForceData.records.forEach((record: any) => {
          allRecords.push({ primaryData: record });
        });
      }

      // Processing the second request
      const secondSalesForceData = await fetchDataFromSalesForce(secondQuery);
      if (secondSalesForceData && secondSalesForceData.records) {
        secondSalesForceData.records.forEach((record: any) => {
          allRecords.push({ primaryData: record });
        });
      }

      // Getting the ID for the third request only after the first two requests have completed
      const recordIds = allRecords.map((record) => record.primaryData.Id);

      // Processing the third request
      const thirdQuery = thirdQueryGenerator(recordIds);
      const thirdSalesForceData = await fetchDataFromSalesForce(thirdQuery);

      for (const relatedRecord of thirdSalesForceData.records) {
        const match = allRecords.find(
          (record) => record.primaryData.Id === relatedRecord.Client_Name__c
        );
        if (match) {
          // Changes to Survey_Option_Name__c processing logic
          if (!match.relatedData) {
            match.relatedData = {
              ...relatedRecord,
              Survey_Option_Name__c: Array.isArray(
                relatedRecord.Survey_Option_Name__c
              )
                ? relatedRecord.Survey_Option_Name__c
                : [relatedRecord.Survey_Option_Name__c],
            };
          } else {
            match.relatedData.Survey_Option_Name__c = [
              ...(match.relatedData.Survey_Option_Name__c || []),
              ...(Array.isArray(relatedRecord.Survey_Option_Name__c)
                ? relatedRecord.Survey_Option_Name__c
                : [relatedRecord.Survey_Option_Name__c]),
            ];
          }
        }
      }

      // Data Conversion
      const transformedData = allRecords.map((record) =>
        transformer(record.primaryData, record.relatedData)
      );
      setData(transformedData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  }, [firstQuery, secondQuery, thirdQueryGenerator, transformer]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return {
    data,
    fetchData,
  };
}

export function usePartnerDetails(partnerKey: string | undefined) {
  const [data, setData] = useState<null | any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!partnerKey) return;
    async function fetchData() {
      setLoading(true);
      try {
        const response = await fetchDataFromSalesForce(
          `query/?q=SELECT+Rich_Merge__c+FROM+Client_Pitch__c+WHERE+Active__c=true+AND+Custom_Outreach__c=true+AND+Client_Id__c='${partnerKey}'`
        );
        setData(response.data);
      } catch (error) {
        console.error("Error fetching partner details:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    void fetchData();
  }, [partnerKey]);
  return { data, loading };
}

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

export const getMemberInfoFromContact = async (
  criteria: string
): Promise<ContactInfo | null> => {
  const endpoint = `query/?q=SELECT+Id,Member__c,Points_Balance__c,Pending_Points__c,Partner_Referral_Link__c,Shortened_PR_Link__c,Email,Member_Survey_Link__c,Non_Profit_Top_Choice__c,Mailing_Address_Verified_Date__c,MailingStreet,MailingCity,MailingState,MailingPostalCode,MailingCountry,Charity_Name__c,AccountId+FROM+Contact+WHERE+RecordTypeId='01236000000yGps'+AND+Id='${criteria}'`;

  try {
    const response = await fetchDataFromSalesForce(endpoint);
    if (response && response.records && response.records.length > 0) {
      const record = response.records[0];
      return {
        Id: record.Id,
        Member__c: record.Member__c,
        Pending_Points__c: record.Pending_Points__c,
        Partner_Referral_Link__c: record.Partner_Referral_Link__c,
        Points_Balance__c: record.Points_Balance__c,
        Member_Survey_Link__c: record.Member_Survey_Link__c,
        Non_Profit_Top_Choice__c: record.Non_Profit_Top_Choice__c,
        Charity_Name__c: record.Charity_Name__c,
        MailingStreet: record.MailingStreet,
        MailingCity: record.MailingCity,
        MailingState: record.MailingState,
        MailingPostalCode: record.MailingPostalCode,
        MailingCountry: record.MailingCountry,
        Email: record.Email,
        Mailing_Address_Verified_Date__c:
          record.Mailing_Address_Verified_Date__c,
        AccountId: record.AccountId,
        Shortened_PR_Link__c: record.Shortened_PR_Link__c,
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching Member Info:", error);
    throw error;
  }
};
