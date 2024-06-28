import axios from "axios";
import qs from "qs";

const CLIENT_ID =
  "3MVG9uudbyLbNPZNMgo7YG07X4w.bR5HADiTZbscSN3vFmxXWWQ0YPq2akjxE32VRCLhZsfZ8R0UmQ4mPVfkd";
const CLIENT_SECRET =
  "64E366FD9060A3FDE31A7E15DC2F3FF41B28B6674720C0995EE5E4CB280859CD";
const USERNAME = "eugeniy@bncom.test";
const PASSWORD = "AD0819llANnnjbEd03a0K6nI387dSzTfm";
const LOGIN_URL =
  "https://bncomtest-dev-ed.develop.my.salesforce.com/services/data/v58.0/";
const REFRESH_TOKEN =
  "5Aep861QbHyftz0nI_frvZE7krnzpmXRZGEmK3oh6m3eon3ZQNv6suCmHQytjRybGZHJpPlsn.696N.ZHiWMxVM";
const INITIAL_ACCESS_TOKEN =
  "00D36000000pFo4!AQcAQB.TsAThh5LGfnGkSK5Gu9CMlGVraIvL6yUd_lUexen2ZkAPL7YJj.k8n.d7q_x7rigTMAYKwIAsSi1G.aV3k53AaOrR";
const SALESFORCE_API_BASE_URL =
  "https://mydogood.my.salesforce.com/services/data/v58.0/";
const SALESFORCE_TOKEN_ENDPOINT =
  "https://mydogood.my.salesforce.com/services/oauth2/token";
interface SalesforceAuthResponse {
  access_token: string;
}

const salesforceApi = axios.create({
  baseURL: SALESFORCE_API_BASE_URL,
  headers: {
    Authorization: `Bearer ${INITIAL_ACCESS_TOKEN}`,
  },
});

const getNewAccessToken = async (): Promise<string> => {
  try {
    const response = await axios.post(
      SALESFORCE_TOKEN_ENDPOINT,
      qs.stringify({
        grant_type: "refresh_token",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: REFRESH_TOKEN,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error("Error refreshing Salesforce token:", error);
    throw error;
  }
};

export const fetchDataFromSalesForce = async (endpoint: string) => {
  try {
    const response = await salesforceApi.get(endpoint);
    return response.data;
  } catch (error) {
    // Checking if the error is an object AxiosError
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.status === 401) {
        const newAccessToken = await getNewAccessToken();
        salesforceApi.defaults.headers[
          "Authorization"
        ] = `Bearer ${newAccessToken}`;
        const response = await salesforceApi.get(endpoint);
        return response.data;
      }
      console.error("Error fetching data from SalesForce:", error);
    } else {
      console.error("Unknown error occurred:", error);
    }
    throw error;
  }
};

export const updateDataInSalesForce = async (endpoint: string, data: any) => {
  try {
    const response = await salesforceApi.patch(endpoint, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.status === 401) {
        const newAccessToken = await getNewAccessToken();
        salesforceApi.defaults.headers[
          "Authorization"
        ] = `Bearer ${newAccessToken}`;
        const response = await salesforceApi.patch(endpoint, data);
        return response.data;
      }
      console.error("Error updating data in SalesForce:", error);
    } else {
      console.error("Unknown error occurred:", error);
    }
    throw error;
  }
};

export const createDataInSalesForce = async (endpoint: string, data: any) => {
  try {
    const response = await salesforceApi.post(endpoint, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.status === 401) {
        const newAccessToken = await getNewAccessToken();
        salesforceApi.defaults.headers[
          "Authorization"
        ] = `Bearer ${newAccessToken}`;
        const response = await salesforceApi.post(endpoint, data);
        return response.data;
      }
      console.error("Error creating data in SalesForce:", error);
    } else {
      console.error("Unknown error occurred:", error);
    }
    throw error;
  }
};
