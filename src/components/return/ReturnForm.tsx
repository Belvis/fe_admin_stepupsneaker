import { NumberField, useModal } from "@refinedev/antd";
import { useTranslate } from "@refinedev/core";
import {
  Button,
  Col,
  Divider,
  Form,
  FormProps,
  Input,
  InputNumber,
  Row,
  Select,
  Table,
  Typography,
} from "antd";
import { ColumnsType } from "antd/es/table";
import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { LuInspect } from "react-icons/lu";
import { LENGTH_DESCRIPTION, LENGTH_PHONE } from "../../constants/common";
import { getReturnPaymentTypeOptions } from "../../constants/type";
import { ColorModeContext } from "../../contexts/color-mode";
import { validateCommon, validatePhoneNumber } from "../../helpers/validate";
import { IReturnFormDetailRequest, PaymentType } from "../../interfaces";
import { ReturnInspectionModal } from "./ReturnInspectionModal";

const { Title, Text } = Typography;
type ReturnFormProps = {
  action: "create" | "edit";
  formProps: FormProps<{}>;
  handleOnFinish: (values: any) => void;
  returnFormDetails: IReturnFormDetailRequest[];
  setReturnFormDetails: Dispatch<
    SetStateAction<IReturnFormDetailRequest[] | undefined>
  >;
};

export const ReturnForm: React.FC<ReturnFormProps> = ({
  formProps,
  handleOnFinish,
  returnFormDetails,
  setReturnFormDetails,
  action,
}) => {
  const t = useTranslate();
  const { mode } = useContext(ColorModeContext);

  const paymentType: PaymentType = Form.useWatch("paymentType", formProps.form);

  const [shippingMoney, setShippingMoney] = useState<number>(0);
  const [inspectionReturnDetail, setInspectionReturnDetail] =
    useState<IReturnFormDetailRequest>();

  useEffect(() => {
    if (shippingMoney) {
      formProps.form?.setFieldValue("shippingMoney", shippingMoney);
    }
  }, [shippingMoney]);

  const {
    show: inspectionShow,
    close: inspectionClose,
    modalProps: inspectionModalProps,
  } = useModal();

  const columns = useMemo<ColumnsType<IReturnFormDetailRequest>>(
    () => [
      {
        title: "#",
        key: "createdAt",
        dataIndex: "createdAt",
        align: "center",
        sorter: {},
        render: (value, record, index) => index + 1,
      },
      {
        title: t("return-form-details.fields.orderCode"),
        sorter: {},
        key: "orderCode",
        dataIndex: "orderCode",
        align: "center",
      },
      {
        title: t("return-form-details.fields.quantity"),
        sorter: {},
        key: "returnQuantity",
        dataIndex: "returnQuantity",
        align: "center",
      },
      {
        title: t("return-form-details.fields.unitPrice"),
        sorter: {},
        key: "unitPrice",
        dataIndex: "unitPrice",
        align: "center",
        render: (value) => {
          return (
            <NumberField
              className="fw-bold"
              options={{
                currency: "VND",
                style: "currency",
              }}
              value={value}
              locale={"vi"}
            />
          );
        },
      },
      {
        title: t("table.actions"),
        dataIndex: "actions",
        key: "actions",
        width: "10%",
        align: "center",
        render: (_, record) => (
          <Button
            icon={<LuInspect />}
            onClick={() => {
              setInspectionReturnDetail(record);
              inspectionShow();
            }}
          >
            {t("buttons.inspect")}
          </Button>
        ),
      },
    ],
    [t]
  );

  return (
    <>
      <Form
        {...formProps}
        style={{ marginTop: 30 }}
        layout="horizontal"
        labelCol={{ span: 8 }}
        labelAlign="left"
        onFinish={handleOnFinish}
      >
        <div className="return-form mb-3">
          <Divider />
          <Title level={5}>{t("return-forms.titles.form")}</Title>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label={t("return-forms.fields.orderCode")}
                name={["order", "code"]}
              >
                <Input
                  placeholder={t("return-forms.fields.employee.placeholder")}
                  disabled
                />
              </Form.Item>
              <Form.Item
                label={t("return-forms.fields.employee.label")}
                name={["employee", "fullName"]}
              >
                <Input
                  placeholder={t("return-forms.fields.employee.placeholder")}
                  disabled
                />
              </Form.Item>
              <Form.Item
                label={t("return-forms.fields.customer.label")}
                name={["customer", "name"]}
              >
                <Input
                  placeholder={t("return-forms.fields.customer.placeholder")}
                  disabled
                />
              </Form.Item>
              <Form.Item
                label={t("return-forms.fields.phoneNumber")}
                required
                name="phoneNumber"
                rules={[
                  {
                    validator: validatePhoneNumber,
                  },
                  {
                    whitespace: true,
                  },
                ]}
              >
                <Input maxLength={LENGTH_PHONE} showCount />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t("return-forms.fields.amountToBePaid")}
                required
                name="amountToBePaid"
                rules={[
                  {
                    validator: (_, value) =>
                      validateCommon(_, value, t, "amountToBePaid"),
                  },
                ]}
              >
                <InputNumber
                  min={1}
                  disabled
                  formatter={(value) =>
                    `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value: string | undefined) => {
                    const parsedValue = parseInt(
                      value!.replace(/₫\s?|(,*)/g, ""),
                      10
                    );
                    return isNaN(parsedValue) ? 0 : parsedValue;
                  }}
                  className="w-100"
                />
              </Form.Item>
              <Form.Item
                required
                label={t("return-forms.fields.paymentType.label")}
                tooltip={t("return-forms.fields.paymentType.tooltip")}
                rules={[
                  {
                    validator: (_, value) =>
                      validateCommon(_, value, t, "paymentType"),
                  },
                ]}
                name="paymentType"
              >
                <Select
                  placeholder={t("return-forms.fields.paymentType.placeholder")}
                  options={getReturnPaymentTypeOptions(t)}
                />
              </Form.Item>
              <Form.Item
                label={t("return-forms.fields.paymentInfo.label")}
                name="paymentInfo"
                required={paymentType === "Transfer"}
                rules={[
                  {
                    validator: (_, value) => {
                      if (paymentType === "Transfer") {
                        return validateCommon(_, value, t, "paymentInfo");
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                  disabled={paymentType === "Cash"}
                  placeholder={t("return-forms.fields.paymentInfo.placeholder")}
                  maxLength={LENGTH_DESCRIPTION / 2}
                  showCount
                />
              </Form.Item>
            </Col>
          </Row>
        </div>
        <div className="return-details mb-3">
          <Divider />
          <Row gutter={24}>
            <Col span={12}>
              <Title level={5} className="mb-3">
                {t("return-forms.titles.return-details")}
              </Title>
            </Col>
          </Row>
          <Table
            pagination={false}
            rowKey="id"
            columns={columns}
            dataSource={returnFormDetails}
          />
        </div>
      </Form>
      {inspectionModalProps.open && inspectionReturnDetail && (
        <>
          <ReturnInspectionModal
            action={action}
            modalProps={inspectionModalProps}
            close={inspectionClose}
            returnDetail={inspectionReturnDetail}
            setReturnFormDetails={setReturnFormDetails}
          />
        </>
      )}
    </>
  );
};
