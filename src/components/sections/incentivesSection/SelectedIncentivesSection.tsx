import React, { FC, useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import {
  Button,
  Checkbox,
  Col,
  Dropdown,
  Image,
  List,
  Menu,
  MenuProps,
  Pagination,
  Row,
  Space,
  Table,
  Tag,
} from "antd";
import type { ColumnsType, SorterResult } from "antd/es/table/interface";
import {
  GetIncentiveDataType,
  useGetPartnersAndIncentivesContext,
  useIncentivesContext,
  usePartnerContext,
} from "../homeSection/contexts/IncentivesContext";
import { ReactComponent as Filter } from "../../../images/svgIcons/filter.svg";
import { v4 as uuidv4 } from "uuid";
import styles from "./styles.module.sass";
import { DownOutlined, StarFilled, StarOutlined } from "@ant-design/icons";
import SelectedIncentivesDrawer from "./SelectedIncentivesDrawer";
import { useParams } from "react-router-dom";
import {
  createDataInSalesForce,
  fetchDataFromSalesForce,
  updateDataInSalesForce,
} from "../../../salesforceAuth";
import IncentiveCustomizationDrawer from "./IncentiveCustomizationDrawer";
import { getMemberInfoFromContact } from "../../../getSalesForceData";
import CharityDrawer from "./CharityDrawer";
import Link from "antd/es/typography/Link";

export interface SelectedIncentivesDataType {
  key: string;
  incentive: string;
  moreInfo: string | JSX.Element;
  meetingsRequired: number;
  requirementsFulfilled?: string | JSX.Element;
  status?: string | JSX.Element;
  Meetings_Needed__c?: string;
  Meetings_Completed__c?: string;
  Customization__c?: string;
  Points__c?: number;
  Website__c?: string;
  Image__c?: string;
  favorite?: string;
  cartItemId?: string;
  Needs_to_be_shipped__c?: boolean;
  incentiveId?: string;
}

const NumberWithCommas = (x: number) => {
  return x?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const SelectedIncentivesSection: FC = () => {
  const [selectCartItemId, setSelectCartItemId] = useState<string>("");
  const incentiveContext = useIncentivesContext();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openCustomizationDrawer, setOpenCustomizationDrawer] = useState(false);
  const [openCharityDrawer, setOpenCharityDrawer] = useState(false);
  const [selectedIncentive, setSelectedIncentive] =
    useState<SelectedIncentivesDataType | null>(null);
  const { incentiveFromSalesForce } = useGetPartnersAndIncentivesContext();
  const { clientId } = useParams<{ clientId: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  const isMobile = useMediaQuery({ maxWidth: 610 });
  const [data, setData] = useState<SelectedIncentivesDataType[]>([]);
  const [activeCheckboxes, setActiveCheckboxes] = useState<string[]>(["All"]);
  const [sortBy, setSortBy] = useState("az");
  const [memberContactData, setMemberContactData] = useState<any[]>([]);
  const [contactData, setContactData] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [sortedInfo, setSortedInfo] = useState<
    SorterResult<GetIncentiveDataType>
  >({
    columnKey: "incentive",
    order: "ascend",
  });
  const cartItems = incentiveContext.cartItems;

  let filteredData = [...incentiveFromSalesForce];

  if (activeCheckboxes.length && !activeCheckboxes.includes("All")) {
    filteredData = filteredData.filter((item) =>
      activeCheckboxes.includes(item.Product_Type__c)
    );
  }

  useEffect(() => {
    let processedData = [...incentiveFromSalesForce];

    processedData.sort((a, b) => a.incentive.localeCompare(b.incentive));

    if (activeCheckboxes.length && !activeCheckboxes.includes("All")) {
      processedData = processedData.filter((item) =>
        activeCheckboxes.includes(item.Product_Type__c)
      );
    }

    processedData = processedData.map((data) => ({
      ...data,
      favorite: memberContactData?.find((d) => d.Incentive__c === data.key)
        ?.Favorite__c,
    }));

    if (sortedInfo.columnKey) {
      processedData.sort((a, b) => {
        if (sortBy === "az") {
          // Incentive name
          return a.incentive.localeCompare(b.incentive);
        } else if (sortBy === "za") {
          return b.incentive.localeCompare(a.incentive);
        } else if (sortBy === "lowToHigh") {
          return a.Points__c
            ? b.Points__c
              ? a.Points__c - b.Points__c
              : 1
            : b.Points__c
            ? -1
            : 0;
        } else if (sortBy === "highToLow") {
          return a.Points__c
            ? b.Points__c
              ? b.Points__c - a.Points__c
              : -1
            : b.Points__c
            ? 1
            : 0;
        } else {
          return (
            new Date(b.CreatedDate || 0).getTime() -
            new Date(a.CreatedDate || 0).getTime()
          );
        }
      });
    }

    const startIndex = (currentPage - 1) * 8;
    const endIndex = startIndex + 8;
    let paginatedData = processedData.slice(0, endIndex);
    paginatedData = paginatedData.sort(sortByFavorite);
    setData(paginatedData);
  }, [
    sortBy,
    currentPage,
    incentiveFromSalesForce,
    activeCheckboxes,
    memberContactData,
    sortedInfo.columnKey,
  ]);

  async function fetchData() {
    try {
      const salesForceData = await fetchDataFromSalesForce(
        `query/?q=SELECT+Incentive_Copy__c,Favorite__c,Incentive__c,Id+FROM+Member_Incentive__c+WHERE+Member_Contact__c='${clientId}'`
      );
      setMemberContactData(salesForceData.records);
      getMemberInfoFromContact(`${clientId}`).then((res) => {
        setContactData(res);
      });
      console.log("--- contactData (Member Info)", contactData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  }

  // Sorting function to prioritize 'favorite' status
  const sortByFavorite = (a: any, b: any) => {
    if (a.favorite === "Active" && b.favorite === "Inactive") {
      return -1; // 'active' comes before 'inactive'
    } else if (a.favorite === "Inactive" && b.favorite === "Active") {
      return 1; // 'inactive' comes after 'active'
    } else {
      return 0; // no change in order
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const onCloseDrawer = () => {
    setSelectedIncentive(null);
    setOpenDrawer(false);
  };

  const onCloseCustomizationDrawer = async () => {
    setOpenCustomizationDrawer(false);
  };

  const onSubmitCustomization = async (customizationString: string) => {
    const updatedData = {
      Customization__c: customizationString.toString(),
    };

    // Find the index of the object in cartItems with the matching id
    const index = cartItems.findIndex(
      (item) => item.cartItemId === selectCartItemId
    );

    // If the object is found, update its Customization__c field
    if (index !== -1) {
      const updatedItem = { ...cartItems[index], ...updatedData }; // Merge updatedData with existing item data
      const updatedCartItems = [...cartItems]; // Create a copy of cartItems array
      updatedCartItems[index] = updatedItem; // Replace the item at index with the updated one
      console.log("--- updatedCartItems", updatedCartItems);

      // Update cartItems using incentiveContext.setCartItems
      incentiveContext.setCartItems(updatedCartItems);
    } else {
      console.log("Item not found in cartItems.");
    }

    // if (id) {
    //   const result = await updateDataInSalesForce(
    //     `/sobjects/Member_Incentive__c/${id}`,
    //     updatedData
    //   );
    //   console.log("--- result", result);
    //   console.log(memberContactData);
    // } else {
    //   console.error("No matching ID found for the selected incentive.");
    // }
    setOpenCustomizationDrawer(false);
  };

  const onCloseCharityDrawer = () => {
    setOpenCharityDrawer(false);
  };

  const showDrawer = (incentive: SelectedIncentivesDataType) => {
    setSelectedIncentive(incentive);
    setOpenDrawer(true);
  };

  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };

  const onLoadMore = () => {
    setCurrentPage(currentPage + 1);
  };

  const addFavorite = async (e: any) => {
    setLoading(true);
    if (memberContactData.find((m) => m.Incentive__c === e.key)) {
      const id = memberContactData.find((m) => m.Incentive__c === e.key)?.Id;
      const updatedData = {
        Favorite__c: "Active",
      };
      await updateDataInSalesForce(
        `/sobjects/Member_Incentive__c/${id}`,
        updatedData
      );
      fetchData();
      setLoading(false);
    } else {
      const newData = {
        Member_Contact__c: clientId,
        Favorite__c: "Active",
        Incentive__c: e.key,
      };
      await createDataInSalesForce(`/sobjects/Member_Incentive__c/`, newData);
      fetchData();
      setLoading(false);
    }
  };

  const cancelFavorite = async (e: any) => {
    try {
      const id = memberContactData.find((m) => m.Incentive__c === e.key)?.Id;
      if (id) {
        setLoading(true);
        const updatedData = {
          Favorite__c: "Inactive",
        };
        await updateDataInSalesForce(
          `/sobjects/Member_Incentive__c/${id}`,
          updatedData
        );
        fetchData();
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const columns: ColumnsType<SelectedIncentivesDataType> = [
    {
      title: "Incentive Name",
      dataIndex: "incentive",
      key: "incentive",
    },
    {
      title: "Website",
      key: "Website__c",
      render: (value) => (
        <div style={{ maxWidth: "300px" }}>{value.Website__c}</div>
      ),
    },
    {
      title: "Points",
      dataIndex: "Points__c",
      key: "Points__c",
    },
    {
      title: "Favorite",
      key: "favorite",
      render: (value) => {
        // console.log('-- value', value, row)
        return (
          <>
            {value?.favorite === "Active" ? (
              <StarFilled onClick={() => cancelFavorite(value)} />
            ) : (
              <StarOutlined onClick={() => addFavorite(value)} />
            )}
          </>
        );
      },
    },
    {
      title: "Add to Cart",
      key: "Points__c",
      render: (value) => {
        return (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIncentive(value);
              onAddToCart(value);
            }}
          >
            Add to Cart
          </Button>
        );
      },
    },
  ];

  const onAddToCart = (value: any) => {
    console.log("---- cartitems: ", cartItems);
    console.log("--- value", value);

    // Make changes to the item's properties
    if (value.Customization_Options__c) {
      setOpenCustomizationDrawer(true);
    }
    if (value.Product_Type__c === "Charitable") {
      setOpenCharityDrawer(true);
    }

    // Generate a UUID for the cart item ID
    const cartItemId = uuidv4();
    setSelectCartItemId(cartItemId);
    // Create a new object with the updated key and additional property incentiveId
    const { key, ...rest } = value; // Destructure value, leaving out the key
    const newValue = { incentiveId: key, key: cartItemId, cartItemId, ...rest }; // Create new object with incentiveId, cartItemId, and remaining properties

    // Add the item to the cart
    incentiveContext.setCartItems([...cartItems, newValue]);
  };

  const getCartCount = (value: any) => {
    const filteredCartItems = cartItems.filter(
      (item) => item.incentiveId == value.key
    );
    return filteredCartItems.length;
  };

  const removeCartItem = (item: any) => {
    const filteredCartItems = cartItems.filter(
      (c) => c.incentiveId == item.key
    );
    filteredCartItems.pop();
    const deleted = cartItems.filter((c) => c.incentiveId !== item.key);
    incentiveContext.setCartItems([...deleted, ...filteredCartItems]);
    return filteredCartItems.length;
  };

  const menuValues = Array.from(
    new Set(incentiveFromSalesForce.map((item) => item.Product_Type__c))
  ).sort((a: any, b: any) => a?.localeCompare(b));
  const menuItems = ["All", ...menuValues];
  const menu = (
    <Menu style={{ maxHeight: "250px", overflowY: "auto" }}>
      {menuItems.map((item, index) => (
        <Menu.Item key={index}>
          <Checkbox
            checked={activeCheckboxes.includes(item)}
            onClick={(e) => handleFilterChange(e, item)}
          >
            {item}
          </Checkbox>
        </Menu.Item>
      ))}
    </Menu>
  );

  const handleFilterChange = (event: React.MouseEvent, category: string) => {
    event.stopPropagation(); // Останавливаем распространение события

    let updatedCheckboxes = [...activeCheckboxes];

    if (category === "All") {
      updatedCheckboxes = ["All"];
    } else {
      if (updatedCheckboxes.includes("All")) {
        updatedCheckboxes = [];
      }
      if (updatedCheckboxes.includes(category)) {
        updatedCheckboxes = updatedCheckboxes.filter(
          (item) => item !== category
        );
      } else {
        updatedCheckboxes.push(category);
      }
    }

    setActiveCheckboxes(updatedCheckboxes);
  };

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    // message.info('Click on menu item.');
    console.log("click", e);
    setSortBy(e.key);
  };

  const items: MenuProps["items"] = [
    {
      label: "Sort A-Z",
      key: "az",
    },
    {
      label: "Sort Z-A",
      key: "za",
    },
    {
      label: "Points Low to High",
      key: "lowToHigh",
    },
    {
      label: "Points High to Low",
      key: "highToLow",
    },
    {
      label: "Newest First",
      key: "newestFirst",
    },
  ];

  const menuProps = {
    items,
    onClick: handleMenuClick,
  };

  console.log("--- data: ", data);

  return (
    <>
      <section className={styles.incentivesTableContainer}>
        <div className={styles.incentivesTableHeaderContainer}>
          <div className={styles.incentivesTitleContainer}>
            <Dropdown menu={menuProps} trigger={["click"]}>
              <Button className={styles.sortBtn}>
                <Space>
                  Sort by
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
            <Dropdown overlay={menu} trigger={["click"]}>
              <button className={styles.filterBtn}>
                <Filter /> Filter
              </button>
            </Dropdown>
          </div>
          <div className={styles.pointsBalanceContainer}>
            <h3>
              <span className={styles.pointsBalanceLabel}>Points Balance:</span>{" "}
              {NumberWithCommas(contactData?.Points_Balance__c)}
            </h3>
            <Link
              target="_blank"
              href="https://form.jotform.com/240324768989170"
            >
              <p className={styles.suggestIncentiveText}>
                Suggest an Incentive
              </p>
            </Link>
          </div>
        </div>
        <Row gutter={[32, 32]} className={styles.incentivesItemsContainer}>
          {data.map((item) => (
            <Col
              key={item.key}
              md={6}
              sm={12}
              xs={12}
              className={styles.incentivesItemContainer}
            >
              <div style={{ position: "relative", width: "100%" }}>
                <Image
                  width="100%"
                  src={item.Image__c || "https://via.placeholder.com/200"}
                  alt="Your Image"
                />
                {item?.favorite === "Active" ? (
                  <StarFilled
                    className={styles.favoriteBtn}
                    onClick={() => cancelFavorite(item)}
                  />
                ) : (
                  <StarOutlined
                    className={styles.favoriteBtn}
                    onClick={() => addFavorite(item)}
                  />
                )}
              </div>
              {!getCartCount(item) && (
                <Button
                  className={styles.addToCartBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIncentive(item);
                    onAddToCart(item);
                  }}
                >
                  + Add
                </Button>
              )}

              {getCartCount(item) > 0 && (
                <Button
                  className={styles.addToCartBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIncentive(item);
                  }}
                >
                  <span
                    onClick={() => removeCartItem(item)}
                    className={styles.cartItemActionBtn}
                  >
                    -
                  </span>
                  {getCartCount(item)}
                  <span
                    className={styles.cartItemActionBtn}
                    onClick={() => onAddToCart(item)}
                  >
                    +
                  </span>
                </Button>
              )}
              <div className={styles.incentivesItemInfoContainer}>
                <Link
                  target="_blank"
                  href={item.Website__c}
                  className={styles.incentivesItemWebsiteText}
                >
                  {item.incentive}
                </Link>
                <p className={styles.incentivesItemPointsText}>
                  {item.Points__c} points
                </p>
              </div>
              <hr className={styles.divider} />
            </Col>
          ))}
        </Row>
        <div className={styles.loadMoreContainer} onClick={() => onLoadMore()}>
          <Button>Load More</Button>
        </div>
        <SelectedIncentivesDrawer
          selectedIncentivesDetails={selectedIncentive}
          isOpen={openDrawer}
          onClose={onCloseDrawer}
        />
        <IncentiveCustomizationDrawer
          isOpen={openCustomizationDrawer}
          onClose={onCloseCustomizationDrawer}
          onSubmit={onSubmitCustomization}
        />
        <CharityDrawer
          isOpen={openCharityDrawer}
          onClose={onCloseCharityDrawer}
          contactInfo={contactData}
        />
      </section>
    </>
  );
};

export default SelectedIncentivesSection;
