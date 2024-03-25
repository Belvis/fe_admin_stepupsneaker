import { useModal } from "@refinedev/antd";
import { useNavigation, useTranslate, useUpdate } from "@refinedev/core";
import { Button, Col, Row } from "antd";
import { useContext } from "react";
import { POSContext } from "../../contexts/point-of-sales";
import { DeliverySalesContext } from "../../contexts/point-of-sales/delivery-sales";
import { paymentToRequest } from "../../helpers/mapper";
import { IOrderResponse, IPaymentRequest } from "../../interfaces";
import { PaymentComfirmModal } from "./PaymentConfirmModal";

type DeliverySalesRightFooterProps = {
  order: IOrderResponse;
};

export const DeliverySalesRightFooter: React.FC<
  DeliverySalesRightFooterProps
> = ({ order }) => {
  const t = useTranslate();
  const { mutate: mutateUpdate } = useUpdate();
  const { list } = useNavigation();

  const { form, shippingMoney, discount, payments, isCOD, setPayments } =
    useContext(DeliverySalesContext);
  const { refetchOrder } = useContext(POSContext);

  const orderDetails = order?.orderDetails || [];
  const totalPrice = orderDetails.reduce((total, orderDetail) => {
    return total + orderDetail.totalPrice;
  }, 0);

  function submitOrder(): void {
    const convertedPayload: IPaymentRequest[] = paymentToRequest(payments);

    const submitData = {
      ...order,
      customer: order.customer ? order.customer.id : null,
      employee: order.employee ? order.employee.id : null,
      voucher: order.voucher ? order.voucher.id : null,
      fullName: form.getFieldValue("fullName"),
      email: form.getFieldValue("email"),
      shippingMoney: shippingMoney,
      isCOD,
      addressShipping: {
        phoneNumber: form.getFieldValue("phoneNumber"),
        districtId: form.getFieldValue("districtId"),
        districtName: form.getFieldValue("districtName"),
        provinceId: form.getFieldValue("provinceId"),
        provinceName: form.getFieldValue("provinceName"),
        wardCode: form.getFieldValue("wardCode"),
        wardName: form.getFieldValue("wardName"),
        more: form.getFieldValue("more"),
      },
      payments: convertedPayload,
    };

    mutateUpdate(
      {
        resource: `orders/delivery/check-out`,
        values: submitData,
        id: order.id,
      },
      {
        onError: (error, variables, context) => {
          // An error occurred!
        },
        onSuccess: (data, variables, context) => {
          refetchOrder();
          list("orders");
        },
      }
    );
  }

  const {
    show,
    close,
    modalProps: { visible, ...restModalProps },
  } = useModal();

  const handlePayButtonClick = () => {
    form
      .validateFields()
      .then((values: any) => {
        if (isCOD) {
          submitOrder();
        } else {
          show();
        }
      })
      .catch((errorInfo: any) => {
        console.log("form validation's failure");
      });
  };

  return (
    <Row gutter={[16, 24]}>
      <Col span={24}>
        <Button
          type="primary"
          size={"large"}
          style={{ width: "100%", fontWeight: "500" }}
          disabled={orderDetails.length <= 0}
          onClick={handlePayButtonClick}
        >
          {t("actions.pay")}
        </Button>
        <PaymentComfirmModal
          order={order}
          submitOrder={submitOrder}
          modalProps={restModalProps}
        />
      </Col>
    </Row>
  );
};
