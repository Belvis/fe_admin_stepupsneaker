import { Row } from "antd";
import React, { useContext, useEffect } from "react";
import { IOrderResponse } from "../../interfaces";
import DirectSalesLeft from "./DirectSalesLeft";
import DirectSalesRight from "./DirectSalesRight";
import { DirectSalesContext } from "../../contexts/point-of-sales/direct-sales";

type DirectSalesProps = {
  order: IOrderResponse;
};

export const DirectSales: React.FC<DirectSalesProps> = ({ order }) => {
  const { setDiscount } = useContext(DirectSalesContext);

  const orderDetails = order?.orderDetails || [];
  const totalPrice = orderDetails.reduce((total, orderDetail) => {
    return total + orderDetail.totalPrice;
  }, 0);

  useEffect(() => {
    if (order.voucher) {
      if (order.voucher.type === "PERCENTAGE") {
        setDiscount((order.voucher.value / 100) * totalPrice);
      } else {
        setDiscount(order.voucher.value);
      }
    } else {
      setDiscount(0);
    }
  }, [order.voucher]);

  return (
    <Row gutter={[16, 24]} style={{ height: "100%" }}>
      <DirectSalesLeft order={order} />
      <DirectSalesRight order={order} />
    </Row>
  );
};
