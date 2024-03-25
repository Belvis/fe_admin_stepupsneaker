import { useTranslate } from "@refinedev/core";
import { Card, Col, Row, Typography } from "antd";
import { useEffect, useState } from "react";
import { IOrderResponse, IVoucherListResponse } from "../../interfaces";
import useOrderCalculations from "../../hooks/useOrderCalculations";
import { DiscountMessage, DiscountMoney } from "../order/style";
import { GiftOutlined } from "@ant-design/icons";
import _ from "lodash";

const { Text } = Typography;

type VoucherMessageProps = {
  order: IOrderResponse;
};

const VoucherMessage: React.FC<VoucherMessageProps> = ({ order }) => {
  const t = useTranslate();

  const [legitVouchers, setLegitVouchers] = useState<IVoucherListResponse[]>(
    []
  );

  useEffect(() => {
    if (order && order.customer && order.customer.customerVoucherList) {
      const convertedLegitVoucher = _.cloneDeep(
        order.customer.customerVoucherList
      );
      convertedLegitVoucher.map((single) => {
        const updatedVoucher = { ...single };
        if (single.voucher.type === "PERCENTAGE") {
          updatedVoucher.voucher.value =
            (single.voucher.value * totalPrice) / 100;
        }
        return updatedVoucher;
      });

      convertedLegitVoucher.sort((a, b) => b.voucher.value - a.voucher.value);

      setLegitVouchers(convertedLegitVoucher);
    }
  }, [order.customer]);

  const orderDetails = order?.orderDetails || [];
  const { totalPrice } = useOrderCalculations(orderDetails);

  const voucherDifference =
    legitVouchers && legitVouchers.length > 0
      ? totalPrice < legitVouchers[0].voucher.constraint
        ? legitVouchers[0].voucher.constraint - totalPrice
        : 0
      : 0;

  const shouldDisplayVoucher = voucherDifference > 0;

  if (shouldDisplayVoucher) {
    return (
      <DiscountMessage level={5}>
        <GiftOutlined /> Mua thêm{" "}
        <DiscountMoney>
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            currencyDisplay: "symbol",
          }).format(voucherDifference)}
        </DiscountMoney>{" "}
        để được giảm tới{" "}
        <DiscountMoney>
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            currencyDisplay: "symbol",
          }).format(legitVouchers[0].voucher.value)}
        </DiscountMoney>
      </DiscountMessage>
    );
  } else {
    return null;
  }
};

export default VoucherMessage;
