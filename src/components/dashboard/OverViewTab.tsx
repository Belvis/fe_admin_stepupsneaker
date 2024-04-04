import {
  BarChartOutlined,
  LineChartOutlined,
  ManOutlined,
  PieChartOutlined,
} from "@ant-design/icons";
import type { TabsProps } from "antd";
import { Tabs } from "antd";
import React from "react";
import { AddressCustomersPie } from "./AddressCustomersPie";
import { GenderCustomersPie } from "./GenderCustomersPie";
import { GroupAge } from "./GroupAge";
import OverviewGrowth from "./OverviewGrowth";
import { useTranslate } from "@refinedev/core";

const OverviewTab: React.FC = () => {
  const t = useTranslate();

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: (
        <span>
          <BarChartOutlined /> {t("dashboard.overviewTab.growth.title")}
        </span>
      ),

      children: <OverviewGrowth />,
    },
    {
      key: "2",
      label: (
        <span>
          <ManOutlined /> {t("dashboard.overviewTab.gender.title")}
        </span>
      ),
      children: <GenderCustomersPie />,
    },
    {
      key: "3",
      label: (
        <span>
          <PieChartOutlined /> {t("dashboard.overviewTab.address.title")}
        </span>
      ),
      children: <AddressCustomersPie />,
    },
    {
      key: "4",
      label: (
        <span>
          <LineChartOutlined /> {t("dashboard.overviewTab.age.title")}
        </span>
      ),
      children: <GroupAge />,
    },
  ];

  return (
    <Tabs
      centered
      tabPosition="bottom"
      size="small"
      defaultActiveKey="1"
      items={items}
    />
  );
};

export default OverviewTab;
