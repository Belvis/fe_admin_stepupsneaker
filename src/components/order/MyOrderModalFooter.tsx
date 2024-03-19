import {
  CaretDownOutlined,
  CaretUpOutlined,
  GiftOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useTranslate } from "@refinedev/core";
import { Badge, Col, Row, Tooltip, Typography } from "antd";
import { useEffect, useState } from "react";
import { FREE_SHIPPING_THRESHOLD } from "../../constants/common";
import { showWarningConfirmDialog } from "../../helpers/confirm";
import { IOrderResponse, IVoucherListResponse } from "../../interfaces";
import { DiscountMessage, DiscountMoney } from "./style";
import _ from "lodash";
import { useModal } from "@refinedev/antd";
import VoucherModal from "../voucher/VoucherModal";

const { Title } = Typography;

type MyOrderModalFooterProps = {
  viewOrder: IOrderResponse;
  order: IOrderResponse;
  setViewOrder: React.Dispatch<React.SetStateAction<IOrderResponse>>;
};

export const MyOrderModalFooter: React.FC<MyOrderModalFooterProps> = ({
  viewOrder,
  order,
  setViewOrder,
}) => {
  const t = useTranslate();

  const {
    show,
    close: voucherClose,
    modalProps: { visible, ...restVoucherModalProps },
  } = useModal();

  const [legitVouchers, setLegitVouchers] = useState<IVoucherListResponse[]>(
    []
  );

  // Convert vouchers list

  useEffect(() => {
    if (
      order.customer &&
      order.customer.customerVoucherList &&
      viewOrder.originMoney
    ) {
      const convertedLegitVoucher = _.cloneDeep(
        order.customer.customerVoucherList
      );
      convertedLegitVoucher.map((single) => {
        const updatedVoucher = { ...single };
        if (single.voucher.type === "PERCENTAGE") {
          updatedVoucher.voucher.value =
            (single.voucher.value * viewOrder.originMoney) / 100;
        }
        return updatedVoucher;
      });

      convertedLegitVoucher.sort((a, b) => b.voucher.value - a.voucher.value);
      setLegitVouchers(convertedLegitVoucher);
    }
  }, [order.customer, viewOrder.originMoney]);

  const showBadgeShipping = viewOrder.originMoney < FREE_SHIPPING_THRESHOLD;
  const showCaretUpShipping = viewOrder.shippingMoney > order.shippingMoney;
  const showCaretDownShipping = viewOrder.shippingMoney < order.shippingMoney;

  const showBadgeGrandTotal = viewOrder.totalMoney !== order.totalMoney;
  const showCaretUpGrandTotal = viewOrder.totalMoney > order.totalMoney;
  const showCaretDownGrandTotal = viewOrder.totalMoney < order.totalMoney;

  const showBadgeCartTotal = viewOrder.originMoney !== order.originMoney;
  const showCaretUpCartTotal = viewOrder.originMoney > order.originMoney;
  const showCaretDownCartTotal = viewOrder.originMoney < order.originMoney;

  const shippingBadgeCount =
    showBadgeShipping && showCaretUpShipping ? (
      <CaretUpOutlined style={{ color: "red" }} />
    ) : showBadgeShipping && showCaretDownShipping ? (
      <CaretDownOutlined style={{ color: "green" }} />
    ) : (
      0
    );

  const grandTotalBadgeCount =
    showBadgeGrandTotal && showCaretUpGrandTotal ? (
      <CaretUpOutlined style={{ color: "red" }} />
    ) : showBadgeGrandTotal && showCaretDownGrandTotal ? (
      <CaretDownOutlined style={{ color: "green" }} />
    ) : (
      0
    );

  const cartTotalBadgeCount =
    showBadgeCartTotal && showCaretUpCartTotal ? (
      <CaretUpOutlined style={{ color: "red" }} />
    ) : showBadgeCartTotal && showCaretDownCartTotal ? (
      <CaretDownOutlined style={{ color: "green" }} />
    ) : (
      0
    );

  return (
    <Row justify="end" style={{ marginRight: "1rem" }}>
      <Col span={12} style={{ textAlign: "end" }}>
        <Row>
          <Col span={15}>
            <Badge count={cartTotalBadgeCount}>
              <Title level={5}>THÀNH TIỀN</Title>
            </Badge>
          </Col>
          <Col span={9}>
            <Title level={5} style={{ fontWeight: "normal" }}>
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
                currencyDisplay: "symbol",
              }).format(viewOrder.originMoney)}
            </Title>
          </Col>
        </Row>
        <Row>
          <Col span={15}>
            <Badge count={shippingBadgeCount}>
              <Title level={5}>PHÍ SHIP</Title>
            </Badge>
          </Col>
          <Col span={9}>
            {showBadgeShipping ? (
              <Title level={5} style={{ fontWeight: "normal" }}>
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                  currencyDisplay: "symbol",
                }).format(viewOrder.shippingMoney)}
              </Title>
            ) : (
              <Title
                level={5}
                className="free-shipping"
                style={{
                  color: "#fb5231",
                  textTransform: "uppercase",
                }}
              >
                Miễn phí vận chuyển
              </Title>
            )}
          </Col>
        </Row>
        <Row>
          <Col span={15}>
            <Title level={5}>
              {viewOrder.voucher ? (
                <Tooltip title="Gỡ voucher">
                  <MinusCircleOutlined
                    className="remove-voucher"
                    onClick={() => {
                      showWarningConfirmDialog({
                        options: {
                          accept: () => {
                            setViewOrder((prev) => {
                              const { voucher, ...rest } = prev;
                              return rest;
                            });
                          },
                          reject: () => {},
                        },
                        t: t,
                      });
                    }}
                  />
                </Tooltip>
              ) : (
                <Tooltip title="Thêm voucher">
                  <PlusCircleOutlined className="add-voucher" onClick={show} />
                </Tooltip>
              )}{" "}
              GIẢM GIÁ
            </Title>
          </Col>
          <Col span={9}>
            <Title level={5} style={{ fontWeight: "normal" }}>
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
                currencyDisplay: "symbol",
              }).format(viewOrder.reduceMoney)}
            </Title>
          </Col>
        </Row>
        <Row>
          <Col span={15}>
            <Badge count={grandTotalBadgeCount}>
              <Title level={4} className="grand-total-title">
                TỔNG CỘNG
              </Title>
            </Badge>
          </Col>
          <Col span={9}>
            <Title level={4}>
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
                currencyDisplay: "symbol",
              }).format(viewOrder.totalMoney)}
            </Title>
          </Col>
        </Row>
        <Row justify="end" style={{ marginTop: "0.5rem" }}>
          {(() => {
            const freeShippingDifference =
              viewOrder.originMoney < FREE_SHIPPING_THRESHOLD
                ? FREE_SHIPPING_THRESHOLD - viewOrder.originMoney
                : Infinity;

            const voucherDifference =
              legitVouchers && legitVouchers.length > 0
                ? viewOrder.originMoney < legitVouchers[0].voucher.constraint
                  ? legitVouchers[0].voucher.constraint - viewOrder.originMoney
                  : Infinity
                : Infinity;

            const shouldDisplayFreeShipping =
              freeShippingDifference > 0 &&
              freeShippingDifference !== Infinity &&
              freeShippingDifference <= voucherDifference;
            const shouldDisplayVoucher =
              voucherDifference > 0 &&
              voucherDifference !== Infinity &&
              voucherDifference < freeShippingDifference;

            if (shouldDisplayFreeShipping) {
              return (
                <DiscountMessage level={5}>
                  <GiftOutlined /> Mua thêm{" "}
                  <DiscountMoney>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                      currencyDisplay: "symbol",
                    }).format(freeShippingDifference)}
                  </DiscountMoney>{" "}
                  để được miễn phí vận chuyển
                </DiscountMessage>
              );
            } else if (shouldDisplayVoucher) {
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
          })()}
        </Row>
      </Col>
      <VoucherModal
        restModalProps={restVoucherModalProps}
        vouchers={order.customer?.customerVoucherList || []}
        type="apply"
        setViewOrder={setViewOrder}
        close={voucherClose}
      />
    </Row>
  );
};
