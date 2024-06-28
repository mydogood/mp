import { FC, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { Affix, Badge, Tabs } from "antd";
import { PlusCircleFilled, ShoppingCartOutlined } from "@ant-design/icons";
import { useIncentivesContext } from "../../components/sections/homeSection/contexts/IncentivesContext";
import Header from "../../components/layout/Header";
import SelectedIncentivesSection from "../../components/sections/incentivesSection/SelectedIncentivesSection";
import RedeemedIncentivesSection from "../../components/sections/incentivesSection/RedeemedIncentivesSection";
import CartSection from "../../components/sections/incentivesSection/CartIncentivesSection";
import styles from "./styles.module.sass";


const Incentives: FC = () => {
	const incentiveContext = useIncentivesContext();
	const cartItems = incentiveContext.cartItems || [];
	const tabItems = [
		{ key: "1", tab: "Available Incentives", content: <SelectedIncentivesSection /> },
		{ key: "2", tab: "Redeemed Incentives", content: <RedeemedIncentivesSection /> },
		{
			key: "3",
			tab: (
				<span className={styles.cartTab}>
					{
						cartItems.length > 0 ? (
							<Badge count={<PlusCircleFilled style={{ color: '#FAAA4D' }} />} offset={[0, 15]}>
								<ShoppingCartOutlined style={{ fontSize: '20px' }} />
							</Badge>
						) : (
							<ShoppingCartOutlined style={{ fontSize: '20px' }} />
						)
					}
				</span>
			),
			content: <CartSection />,
		  },
	];
	const [activeTab, setActiveTab] = useState<string>("1")

	const handleTabChange = (key: string) => {
		setActiveTab(key);
	};

	return (
		<main style={{ backgroundColor: '#FFFFFF' }}>
			<Header />
			<Affix offsetTop={0}>
				<section className={styles.tabsContainer}>
					<Tabs
						defaultActiveKey="1"
						onChange={handleTabChange}
						tabBarStyle={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							backgroundColor: '#FFFFFF',
							marginLeft: '3%',
							textTransform: 'uppercase',
						}}
					>
						{tabItems.map((item) => (
							<Tabs.TabPane key={item.key} tab={item.tab} />
						))}
					</Tabs>
				</section>
			</Affix>
			<section className={styles.mainContainer}>
				<div className={styles.scrollableContent}>
					{tabItems.map((item) => (
						<div key={item.key} className={styles.tabContent} style={{ display: item.key === activeTab ? 'block' : 'none' }}>
							{item.content}
						</div>
					))}
				</div>
			</section>
		</main>
	)
}

export default Incentives
