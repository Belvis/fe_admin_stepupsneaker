import {
  useCreateMany,
  useNavigation,
  useTranslate,
  useUpdate,
} from "@refinedev/core";
import {
  App,
  Button,
  Col,
  Input,
  InputRef,
  Modal,
  QRCode,
  Row,
  Space,
} from "antd";
import {
  ChangeEvent,
  MutableRefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { DeliverySalesContext } from "../../contexts/point-of-sales/delivery-sales";
import { IOrderResponse, IPaymentRequest } from "../../interfaces";
import { POSContext } from "../../contexts/point-of-sales";
import { paymentToRequest } from "../../helpers/mapper";
import { useModal } from "@refinedev/antd";

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
  const { message } = App.useApp();

  const { form, shippingMoney, discount, payments, isCOD } =
    useContext(DeliverySalesContext);
  const { refetchOrder } = useContext(POSContext);
  const transactionInput: MutableRefObject<InputRef | null> = useRef(null);
  const [transactionCode, setTransactionCode] = useState<string>("");

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
      transactionCode,
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

  const { show, close, modalProps } = useModal();

  const focusInput = (ref: MutableRefObject<InputRef | null>) => {
    if (ref.current) {
      ref.current.focus();
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTransactionCode(event.target.value);
  };

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

  const handleConfirm = () => {
    // Do something when the button is clicked
    if (transactionCode) {
      submitOrder();
    } else {
      message.error(t("payments.modal.error.transactionCode"));
      focusInput(transactionInput);
    }
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
        <Modal
          {...modalProps}
          title={t("payments.modal.title")}
          styles={{
            header: {
              textAlign: "center",
            },
          }}
          footer={
            <Space.Compact style={{ width: "100%" }}>
              <Input
                placeholder={t("payments.modal.buttons.footer.placeholder")}
                ref={transactionInput}
                value={transactionCode}
                onChange={handleInputChange}
              />
              <Button type="primary" onClick={handleConfirm}>
                {t("payments.modal.buttons.footer.label")}
              </Button>
            </Space.Compact>
          }
        >
          <QRCode
            size={400}
            errorLevel="H"
            value="00020101021138570010A00000072701270006970436011306910004415480208QRIBFTTA53037045802VN63042141"
            icon="https://cdn.haitrieu.com/wp-content/uploads/2022/02/Icon-Vietcombank.png"
            style={{
              margin: "0 auto",
            }}
          />
        </Modal>
      </Col>
    </Row>
  );
};
