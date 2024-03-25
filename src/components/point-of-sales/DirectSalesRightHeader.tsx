import {
  AppstoreOutlined,
  FilterOutlined,
  PictureOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { Button, Col, Row } from "antd";
import React, { useContext, useState } from "react";
import { IOrderResponse } from "../../interfaces";
import CustomerSection from "./CustomerInputSection";
import { POSFilter } from "./POSFilter";
import { DirectSalesContext } from "../../contexts/point-of-sales/direct-sales";

type DirectSalesRightHeaderProps = {
  order: IOrderResponse;
};

const DirectSalesRightHeader: React.FC<DirectSalesRightHeaderProps> = ({
  order,
}) => {
  const { pLayout, handleToggleLayout } = useContext(DirectSalesContext);

  const [filterDrawerOpen, setFilterDrawerOpen] = useState<boolean>(false);

  const showFilterDrawer = () => {
    setFilterDrawerOpen(true);
  };

  const closeFilterDrawer = () => {
    setFilterDrawerOpen(false);
  };

  return (
    <Row gutter={[16, 24]}>
      <Col span={18}>
        <CustomerSection order={order} />
      </Col>
      <Col span={2}>
        <Button shape="circle" type="text" icon={<UnorderedListOutlined />} />
      </Col>
      <Col span={2}>
        <Button
          shape="circle"
          type="text"
          icon={<FilterOutlined />}
          onClick={showFilterDrawer}
        />
      </Col>
      <Col span={2}>
        <Button
          shape="circle"
          type="text"
          icon={
            pLayout === "horizontal" ? (
              <AppstoreOutlined />
            ) : (
              <PictureOutlined />
            )
          }
          onClick={handleToggleLayout}
        />
      </Col>
      <POSFilter open={filterDrawerOpen} onClose={closeFilterDrawer} />
    </Row>
  );
};

export default DirectSalesRightHeader;
