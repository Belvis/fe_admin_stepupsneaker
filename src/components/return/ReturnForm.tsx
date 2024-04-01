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
  Space,
  Table,
  Typography,
} from "antd";
import { validateCommon, validatePhoneNumber } from "../../helpers/validate";
import { LENGTH_DESCRIPTION, LENGTH_PHONE } from "../../constants/common";
import {
  getReturnPaymentTypeOptions,
  getReturnTypeOptions,
} from "../../constants/type";
import {
  getDeliveryStatusOptions,
  getRefundStatusOptions,
} from "../../constants/status";
import { NumberField, useModal } from "@refinedev/antd";
import { AddressFormThree } from "../form/AddressFormThree";
import { ReturnInspectionModal } from "./ReturnInspectionModal";
import {
  IReturnFormDetailRequest,
  PaymentType,
  ReturnType,
} from "../../interfaces";
import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ColumnsType } from "antd/es/table";
import { ReturnInspectionStatus } from "./ReturnInspectionStatus";
import { ColorModeContext } from "../../contexts/color-mode";
import { LuInspect } from "react-icons/lu";
import { MdOutlineRepartition } from "react-icons/md";
import { ReturnAPartModal } from "./ReturnAPartModal";

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

  const type: ReturnType = Form.useWatch("type", formProps.form);
  const paymentType: PaymentType = Form.useWatch("paymentType", formProps.form);

  const [shippingMoney, setShippingMoney] = useState<number>(0);
  const [inspectionReturnDetail, setInspectionReturnDetail] =
    useState<IReturnFormDetailRequest>();

  useEffect(() => {
    if (shippingMoney) {
      formProps.form?.setFieldValue("shippingMoney", shippingMoney);
    }
  }, [shippingMoney]);

  useEffect(() => {
    if (type && action === "create") {
      if (type === "OFFLINE") {
        formProps.form?.setFieldsValue({
          returnDeliveryStatus: "COMPLETED",
          refundStatus: "COMPLETED",
        });
      } else {
        formProps.form?.setFieldsValue({
          returnDeliveryStatus: "PENDING",
          refundStatus: "PENDING",
        });
      }
    }
  }, [type]);

  const {
    show: inspectionShow,
    close: inspectionClose,
    modalProps: inspectionModalProps,
  } = useModal();

  const {
    show: returnAPartShow,
    close: returnAPartClose,
    modalProps: returnAPartModalProps,
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
        title: t("return-form-details.fields.totalPrice"),
        sorter: {},
        key: "totalPrice",
        dataIndex: "totalPrice",
        align: "center",
        render: (_, { unitPrice, returnQuantity }) => {
          return (
            <NumberField
              options={{
                currency: "VND",
                style: "currency",
              }}
              value={unitPrice * returnQuantity}
              locale={"vi"}
            />
          );
        },
      },
      {
        title: t("return-form-details.fields.returnInspectionStatus.label"),
        sorter: {},
        key: "returnInspectionStatus",
        dataIndex: "returnInspectionStatus",
        align: "center",
        render: (_, record) => {
          const status = Object.values(record).some(
            (value) => value === "" || value === undefined
          )
            ? "PENDING"
            : record.returnInspectionStatus;

          return <ReturnInspectionStatus status={status} />;
        },
      },
      {
        title: t("table.actions"),
        dataIndex: "actions",
        key: "actions",
        width: "10%",
        align: "center",
        render: (_, record) => (
          <Space>
            <Button
              icon={<MdOutlineRepartition />}
              onClick={() => {
                setInspectionReturnDetail(record);
                returnAPartShow();
              }}
              hidden={action == "create"}
            >
              {t("buttons.returnAPart")}
            </Button>
            <Button
              icon={<LuInspect />}
              onClick={() => {
                setInspectionReturnDetail(record);
                inspectionShow();
              }}
            >
              {t("buttons.inspect")}
            </Button>
          </Space>
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
                ]}
              >
                <Input maxLength={LENGTH_PHONE} showCount />
              </Form.Item>
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
            </Col>
            <Col span={12}>
              <Form.Item
                label={t("return-forms.fields.type.label")}
                name="type"
                required
                rules={[
                  {
                    validator: (_, value) =>
                      validateCommon(_, value, t, "returnType"),
                  },
                ]}
              >
                <Select
                  disabled={action !== "create"}
                  placeholder={t("return-forms.fields.type.placeholder")}
                  options={getReturnTypeOptions(t)}
                />
              </Form.Item>
              <Form.Item
                label={t("return-forms.fields.returnDeliveryStatus.label")}
                tooltip={t("return-forms.fields.returnDeliveryStatus.tooltip")}
                name="returnDeliveryStatus"
                required
                rules={[
                  {
                    validator: (_, value) =>
                      validateCommon(_, value, t, "returnDeliveryStatus"),
                  },
                ]}
              >
                <Select
                  disabled
                  placeholder={t(
                    "return-forms.fields.returnDeliveryStatus.placeholder"
                  )}
                  options={getDeliveryStatusOptions(t)}
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
                label={t("return-forms.fields.refundStatus.label")}
                name="refundStatus"
                rules={[
                  {
                    validator: (_, value) =>
                      validateCommon(_, value, t, "refundStatus"),
                  },
                ]}
              >
                <Select
                  disabled
                  placeholder={t(
                    "return-forms.fields.refundStatus.placeholder"
                  )}
                  options={getRefundStatusOptions(t)}
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
            summary={(pageData) => {
              let totalQuantity = 0;
              let totalMoney = 0;

              pageData.forEach(({ returnQuantity, unitPrice }) => {
                totalQuantity += returnQuantity;
                totalMoney += returnQuantity * unitPrice;
              });

              formProps.form?.setFieldValue("amountToBePaid", totalMoney);
              return (
                <>
                  <Table.Summary.Row
                    style={{
                      backgroundColor: mode == "light" ? "#fafafa" : undefined,
                    }}
                  >
                    <Table.Summary.Cell index={0} className="text-center">
                      <Text className="fw-bold">Tổng cộng</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}></Table.Summary.Cell>
                    <Table.Summary.Cell index={2} className="text-center">
                      <Text type="danger" className="fw-bold">
                        {totalQuantity}
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3}></Table.Summary.Cell>
                    <Table.Summary.Cell index={4} className="text-center">
                      <NumberField
                        className="fw-bold"
                        options={{
                          currency: "VND",
                          style: "currency",
                        }}
                        value={totalMoney}
                        locale={"vi"}
                      />
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={5}></Table.Summary.Cell>
                    <Table.Summary.Cell index={5}></Table.Summary.Cell>
                  </Table.Summary.Row>
                </>
              );
            }}
          />
        </div>
        {formProps.form && type != "OFFLINE" && (
          <div className="return-address">
            <Title level={5} className="mb-3">
              {t("return-forms.titles.return-address")}
            </Title>
            <AddressFormThree
              form={formProps.form}
              setShippingMoney={setShippingMoney}
              hideChooseAddress
            />
            <Form.Item
              name="shippingMoney"
              label={t("return-forms.fields.shippingMoney")}
            >
              <InputNumber
                className="w-100"
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
              />
            </Form.Item>
          </div>
        )}
      </Form>
      {inspectionModalProps.open && inspectionReturnDetail && (
        <>
          <ReturnInspectionModal
            action={action}
            type={type}
            modalProps={inspectionModalProps}
            close={inspectionClose}
            returnDetail={inspectionReturnDetail}
            setReturnFormDetails={setReturnFormDetails}
          />
        </>
      )}
      {returnAPartModalProps.open &&
        inspectionReturnDetail &&
        action === "edit" && (
          <>
            <ReturnAPartModal
              modalProps={returnAPartModalProps}
              close={returnAPartClose}
              returnDetail={inspectionReturnDetail}
              setReturnFormDetails={setReturnFormDetails}
            />
          </>
        )}
    </>
  );
};
