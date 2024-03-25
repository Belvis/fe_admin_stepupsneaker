import { useTranslate, useUpdate } from "@refinedev/core";
import { App, Card, Col, Image, Row } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { IOrderResponse, IVoucherResponse } from "../../interfaces";

interface VoucherProps {
  item: IVoucherResponse;
  type?: "apply" | "copy" | "use";
  setViewOrder?: React.Dispatch<React.SetStateAction<IOrderResponse>>;
  close?: () => void;
  order?: IOrderResponse;
  callBack?: any;
}

const Voucher: React.FC<VoucherProps> = ({
  item,
  type,
  setViewOrder,
  close,
  order,
  callBack,
}) => {
  const {
    image,
    endDate,
    value,
    type: voucherType,
    constraint,
    code,
    id,
  } = item;

  const { message } = App.useApp();
  const { mutate: mutateUpdate, isLoading: isLoadingOrderUpdate } = useUpdate();
  const t = useTranslate();

  const [text, setText] = useState<string>("Dùng ngay");

  const cashPrice =
    voucherType === "CASH" ? (
      <>
        {new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
          currencyDisplay: "symbol",
        }).format(value)}
      </>
    ) : (
      <>{value}%</>
    );

  const constraintPrice = (
    <>
      {new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        currencyDisplay: "symbol",
      }).format(constraint)}
    </>
  );

  const handleCopyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code).then(() => {
        message.success(t("common.copied"));
      });
      setText(code);
      setTimeout(() => {
        setText("Dùng ngay");
      }, 3000);
    }
  };

  const handleApplyVoucher = async () => {
    if (type === "apply" && setViewOrder && close) {
      try {
        setViewOrder((prev) => {
          if (prev.originMoney > item.constraint) {
            return {
              ...prev,
              voucher: item,
            };
          } else {
            message.error(t("vouchers.validation.ineligible"));
            return prev;
          }
        });

        return close();
      } catch (error: any) {
        message.error(t("common.error", +error.message));
      }
    }
  };

  const handleUseVoucher = () => {
    if (order && type === "use" && close) {
      mutateUpdate(
        {
          resource: "orders/apply-voucher",
          values: {
            voucher: id,
          },
          id: order.id,
          successNotification: () => {
            return false;
          },
          errorNotification: () => {
            return false;
          },
        },
        {
          onError: (error, variables, context) => {
            message.error(
              t("orders.notification.voucher.edit.error") + error.message
            );
          },
          onSuccess: (data, variables, context) => {
            callBack();
            message.success(t("orders.notification.voucher.edit.success"));
            return close();
          },
        }
      );
    } else {
      message.error(t("orders.notification.voucher.edit.notFound"));
    }
  };

  return (
    <Card
      style={{
        borderColor: "transparent",
        boxShadow:
          "0 1px 2px -2px rgba(0, 0, 0, 0.16), 0 3px 6px 0 rgba(0, 0, 0, 0.12), 0 5px 12px 4px rgba(0, 0, 0, 0.09)",
      }}
    >
      <Row gutter={16} align="middle">
        <Col span={6} style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              zIndex: 2,
              width: "50%",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <Image
              preview={false}
              src={
                image ? image : "/images/voucher/voucher-coupon-svgrepo-com.png"
              }
            />
          </div>
          <Image preview={false} src="/images/voucher/subtract-xRJ.png" />
        </Col>
        <Col span={18}>
          <Row>
            <Col span={16}>
              <div className="auto-group-xh3i-y16">
                <div className="group-3-WFv">
                  <p className="gim-1000000-ed2">Giảm {cashPrice}</p>
                  <p className="cc-ruy-to-qqv">
                    Cho đơn hàng trên {constraintPrice}
                  </p>
                </div>
                <p className="c-hiu-lc-n-12102024-xfe">
                  Có hiệu lực đến: {dayjs(new Date(endDate)).format("LLL")}
                </p>
                <p className="chi-tit--Fue">Chi tiết &gt;&gt;&gt;</p>
              </div>{" "}
            </Col>
            <Col
              span={8}
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "flex-end",
                paddingRight: "1rem",
              }}
            >
              <div className="sharpen-btn" style={{ width: "100%" }}>
                <button
                  onClick={() => {
                    switch (type) {
                      case "copy":
                        handleCopyCode();
                        break;
                      case "apply":
                        handleApplyVoucher();
                        break;
                      case "use":
                        handleUseVoucher();
                        break;
                      default:
                        break;
                    }
                  }}
                  style={{ width: "100%" }}
                >
                  {text}
                </button>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  );
};

export default Voucher;
