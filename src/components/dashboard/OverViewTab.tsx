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

const items: TabsProps["items"] = [
  {
    key: "1",
    label: (
      <span>
        <BarChartOutlined /> Tổng quát
      </span>
    ),

    children: <OverviewGrowth />,
  },
  {
    key: "2",
    label: (
      <span>
        <ManOutlined /> Giới tính
      </span>
    ),
    children: <GenderCustomersPie />,
  },
  {
    key: "3",
    label: (
      <span>
        <PieChartOutlined /> Khu vực
      </span>
    ),
    children: <AddressCustomersPie />,
  },
  {
    key: "4",
    label: (
      <span>
        <LineChartOutlined /> Độ tuổi
      </span>
    ),
    children: <GroupAge />,
  },
];

const OverviewTab: React.FC = () => {
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
