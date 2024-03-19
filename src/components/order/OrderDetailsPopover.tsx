import React from "react";
import { Popover, Typography } from "antd";
import { IOrderResponse } from "../../interfaces";
import { useTranslate } from "@refinedev/core";

const { Text } = Typography;

type OrderDetailsPopoverProps = {
  record: IOrderResponse;
};
const OrderDetailsPopover: React.FC<OrderDetailsPopoverProps> = ({
  record,
}) => {
  const t = useTranslate();
  const orderDetails = record?.orderDetails || [];
  const totalQuantity = orderDetails.reduce((total, orderDetail) => {
    return total + orderDetail.quantity;
  }, 0);

  return (
    <Popover
      content={
        <ul>
          {orderDetails.map((orderDetail) => (
            <li key={orderDetail.id}>
              {orderDetail.productDetail.product.name} -{" "}
              {orderDetail.productDetail.color.name} -{" "}
              {orderDetail.productDetail.size.name} - x{orderDetail.quantity}
            </li>
          ))}
        </ul>
      }
      title={t("products.products")}
      trigger="hover"
    >
      <Text>
        {t("orders.fields.itemsAmount", {
          amount: totalQuantity,
        })}
      </Text>
    </Popover>
  );
};

export default OrderDetailsPopover;
