import { ClockCircleOutlined, PhoneFilled } from "@ant-design/icons";
import { useTranslate } from "@refinedev/core";
import { Space, Spin, Tabs, TabsProps } from "antd";
import { IOrderResponse } from "../../interfaces";
import { DeliverySales } from "./DeliverySales";
import { DirectSales } from "./DirectSales";
import { DeliverySalesContextProvider } from "../../contexts/point-of-sales/delivery-sales";
import { DirectSalesContextProvider } from "../../contexts/point-of-sales/direct-sales";

type TabContentProps = {
  order: IOrderResponse;
};

export const TabContent: React.FC<TabContentProps> = ({ order }) => {
  const t = useTranslate();

  const items: TabsProps["items"] = [
    {
      key: "direct",
      label: (
        <Space>
          <ClockCircleOutlined />
          {t("orders.tab.directSales")}
        </Space>
      ),
      children: (
        <DirectSalesContextProvider>
          <DirectSales order={order} />,
        </DirectSalesContextProvider>
      ),
    },
    {
      key: "delivery",
      label: (
        <Space>
          <PhoneFilled />
          {t("orders.tab.deliverySales")}
        </Space>
      ),
      children: (
        <DeliverySalesContextProvider>
          <DeliverySales order={order} />
        </DeliverySalesContextProvider>
      ),
    },
  ];

  return (
    <Spin spinning={false}>
      <Tabs size="large" tabPosition="bottom" items={items} />
    </Spin>
  );
};
