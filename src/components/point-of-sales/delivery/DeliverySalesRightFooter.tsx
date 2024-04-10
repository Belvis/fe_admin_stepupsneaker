import { useModal } from "@refinedev/antd";
import { useNavigation, useTranslate, useUpdate } from "@refinedev/core";
import { Button, Col, Row } from "antd";
import { useContext, useEffect, useRef, useState } from "react";
import { POSContext } from "../../../contexts/point-of-sales";
import { DeliverySalesContext } from "../../../contexts/point-of-sales/delivery-sales";
import { paymentToRequest } from "../../../helpers/mapper";
import {
  IOrderResponse,
  IPaymentRequest,
  IPaymentResponse,
} from "../../../interfaces";
import { PaymentComfirmModal } from "../PaymentConfirmModal";
import { InvoiceTemplate } from "../../../template/InvoiceTemplate";
import { useReactToPrint } from "react-to-print";

type DeliverySalesRightFooterProps = {
  order: IOrderResponse;
};

export const DeliverySalesRightFooter: React.FC<
  DeliverySalesRightFooterProps
> = ({ order }) => {
  const t = useTranslate();
  const { mutate: mutateUpdate } = useUpdate();
  const { list } = useNavigation();

  const [printOrder, setPrintOrder] = useState(null);

  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  useEffect(() => {
    if (printOrder !== null) {
      handlePrint();
      list("orders");
    }
  }, [printOrder]);

  const { form, shippingMoney, discount, isCOD } =
    useContext(DeliverySalesContext);
  const { refetchOrder, payments } = useContext(POSContext);

  const orderDetails = order?.orderDetails || [];

  function submitOrder(paymentsParam?: IPaymentResponse[]): void {
    const convertedPayload: IPaymentRequest[] = paymentToRequest(
      paymentsParam ?? payments
    );

    const submitData = {
      fullName: form.getFieldValue("fullName"),
      email: form.getFieldValue("email"),
      shippingMoney: shippingMoney,
      phoneNumber: form.getFieldValue("phoneNumber"),
      isCOD,
      addressShipping: {
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
        successNotification(data, values, resource) {
          return {
            message: t("common.checkout.success"),
            description: t("common.success"),
            type: "success",
          };
        },
        errorNotification: (error: any) => {
          return {
            message: t("common.error") + error.message,
            description: "Oops!..",
            type: "error",
          };
        },
      },
      {
        onError: (error, variables, context) => {
          // An error occurred!
        },
        onSuccess: (data, variables, context) => {
          refetchOrder();
          setPrintOrder(data.data.content);
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
          close={close}
          submitOrder={submitOrder}
          modalProps={restModalProps}
        />
      </Col>
      <div className="d-none">
        {printOrder && (
          <InvoiceTemplate order={printOrder} ref={componentRef} />
        )}
      </div>
    </Row>
  );
};
