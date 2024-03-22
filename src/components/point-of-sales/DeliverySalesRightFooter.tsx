import {
  useCreateMany,
  useNavigation,
  useTranslate,
  useUpdate,
} from "@refinedev/core";
import { Button, Col, Row } from "antd";
import { useContext } from "react";
import { DeliverySalesContext } from "../../contexts/point-of-sales/delivery-sales";
import { IOrderResponse, IPaymentRequest } from "../../interfaces";
import { POSContext } from "../../contexts/point-of-sales";
import { paymentToRequest } from "../../helpers/mapper";

type DeliverySalesRightFooterProps = {
  order: IOrderResponse;
};

export const DeliverySalesRightFooter: React.FC<
  DeliverySalesRightFooterProps
> = ({ order }) => {
  const t = useTranslate();
  const { mutate: mutateUpdate } = useUpdate();
  const { mutate: paymentMutateCreateMany } = useCreateMany();
  const { list } = useNavigation();

  const { form, shippingMoney, discount, payments, isCOD } =
    useContext(DeliverySalesContext);
  const { refetchOrder } = useContext(POSContext);

  const orderDetails = order?.orderDetails || [];
  const totalPrice = orderDetails.reduce((total, orderDetail) => {
    return total + orderDetail.totalPrice;
  }, 0);

  function submitOrder(): void {
    const submitData = {
      ...order,
      customer: order.customer ? order.customer.id : null,
      employee: order.employee ? order.employee.id : null,
      voucher: order.voucher ? order.voucher.id : null,
      fullName: form.getFieldValue("fullName"),
      shippingMoney: shippingMoney,
      type: "ONLINE",
      totalMoney: totalPrice - discount + shippingMoney,
      status: "WAIT_FOR_CONFIRMATION",
      isCOD,
    };

    mutateUpdate(
      {
        resource: "orders/delivery/check-out",
        values: submitData,
        id: order.id,
      },
      {
        onError: (error, variables, context) => {
          // An error occurred!
        },
        onSuccess: (data, variables, context) => {
          refetchOrder();
          const convertedPayload: IPaymentRequest[] =
            paymentToRequest(payments);
          paymentMutateCreateMany(
            {
              resource: "payments",
              values: convertedPayload,
            },
            {
              onError: (error, variables, context) => {},
              onSuccess: (data, variables, context) => {
                list("orders");
              },
            }
          );
        },
      }
    );
  }

  return (
    <Row gutter={[16, 24]}>
      <Col span={24}>
        {/* Footer */}
        <Button
          type="primary"
          size={"large"}
          style={{ width: "100%", fontWeight: "500" }}
          onClick={submitOrder}
        >
          {t("actions.pay")}
        </Button>
      </Col>
    </Row>
  );
};
