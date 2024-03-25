import { Row } from "antd";

import { IOrderResponse } from "../../interfaces";
import { DeliverySalesLeft } from "./DeliverySalesLeft";
import { DeliverySalesRight } from "./DeliverySalesRight";
import { useContext, useEffect } from "react";
import { DeliverySalesContext } from "../../contexts/point-of-sales/delivery-sales";
import useOrderCalculations from "../../hooks/useOrderCalculations";

type DeliverySalesProps = {
  order: IOrderResponse;
};

export const DeliverySales: React.FC<DeliverySalesProps> = ({ order }) => {
  const { setShippingMoney, setDiscount } = useContext(DeliverySalesContext);

  const orderDetails = order?.orderDetails || [];
  const { totalPrice } = useOrderCalculations(orderDetails);

  useEffect(() => {
    if (order.shippingMoney && order.shippingMoney) {
      setShippingMoney(order.shippingMoney);
    }
  }, [order.shippingMoney]);

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
      <DeliverySalesLeft order={order} />
      <DeliverySalesRight order={order} />
    </Row>
  );
};
