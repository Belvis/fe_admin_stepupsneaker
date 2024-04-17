import { useTranslate } from "@refinedev/core";
import { Button, Col, Pagination, PaginationProps, Row, Tooltip } from "antd";
import React, { ReactNode, useContext, useState } from "react";
import { POSContext } from "../../../contexts/point-of-sales";
import { IOrderResponse } from "../../../interfaces";
import { CheckOutDrawer } from "./CheckOutDrawer";

type DirectSalesRightFooterProps = {
  order: IOrderResponse;
};

const DirectSalesRightFooter: React.FC<DirectSalesRightFooterProps> = ({
  order,
}) => {
  const t = useTranslate();

  const { pagination, setPagination } = useContext(POSContext);

  const [checkOutDrawerOpen, setCheckOutDrawerOpen] = useState(false);

  const showCheckOutDrawer = () => {
    setCheckOutDrawerOpen(true);
  };

  const onCheckOutDrawerClose = () => {
    setCheckOutDrawerOpen(false);
  };
  const orderDetails = order?.orderDetails || [];

  const onChange: PaginationProps["onChange"] = (page) => {
    setPagination((prevPagination) => ({
      ...prevPagination,
      current: page,
    }));
  };

  return (
    <Row gutter={[16, 24]} align="middle" justify="center">
      <Col span={8} flex="auto">
        <Pagination
          current={pagination.current}
          onChange={onChange}
          pageSize={pagination.pageSize}
          total={pagination.total}
          itemRender={itemRender}
        />
      </Col>
      <Col span={16} className="p-0">
        <Tooltip
          title={
            orderDetails.length <= 0
              ? t("pos.message.orderDetailLengthExceed")
              : ""
          }
        >
          <Button
            type="primary"
            size={"large"}
            className="w-100 fw-bold"
            onClick={showCheckOutDrawer}
            disabled={orderDetails.length <= 0}
          >
            {t("actions.proceedPay")}
          </Button>
        </Tooltip>
      </Col>
      <CheckOutDrawer
        open={checkOutDrawerOpen}
        onClose={onCheckOutDrawerClose}
        order={order}
      />
    </Row>
  );
};

export default DirectSalesRightFooter;

const itemRender = (
  page: number,
  type: "page" | "prev" | "next" | "jump-prev" | "jump-next",
  element: ReactNode
) => {
  if (type === "prev") {
    return element;
  }
  if (type === "next") {
    return element;
  }
};
