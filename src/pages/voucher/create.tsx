import { Create, SaveButton, useStepsForm } from "@refinedev/antd";
import { IResourceComponentsProps, useTranslate } from "@refinedev/core";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
  Steps,
} from "antd";

import dayjs from "dayjs";
import { FieldLabel } from "../../components/form/FieldLabel";
import ImageUpload from "../../components/form/ImageUpload";
import VoucherRelation from "../../components/voucher/VoucherRelation";
import {
  LENGTH_CODE,
  LENGTH_NAME,
  LIMIT_VOUCHER_VALUE,
} from "../../constants/common";
import { showWarningConfirmDialog } from "../../helpers/confirm";
import { validateCommon } from "../../helpers/validate";
import { IVoucherResponse } from "../../interfaces";
const { RangePicker } = DatePicker;

export const VoucherCreate: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();
  const {
    current,
    gotoStep,
    stepsProps,
    formProps,
    saveButtonProps,
    formLoading,
    onFinish,
  } = useStepsForm<IVoucherResponse>({
    submit: (values: any) => {
      const data = {
        code: `${values.code}`,
        name: `${values.name}`,
        status: `ACTIVE`,
        type: `${values.type}`,
        value: `${values.value}`,
        constraint: `${values.constraint}`,
        quantity: `${values.quantity}`,
        startDate: `${values.voucherRange[0].valueOf()}`,
        endDate: `${values.voucherRange[1].valueOf()}`,
        image: `${values.image}`,
        customers: values.customers,
      };
      showWarningConfirmDialog({
        options: {
          accept: () => {
            onFinish(data);
          },
          reject: () => {},
        },
        t: t,
      });
    },
  });

  const type = Form.useWatch("type", formProps.form);

  const formList = [
    <Row gutter={20}>
      <Col xs={24} lg={8}>
        <ImageUpload formProps={formProps} />
      </Col>
      <Col xs={24} lg={16}>
        <Row gutter={10}>
          <Col xs={24} lg={12}>
            <Form.Item
              label={
                <FieldLabel
                  fieldName={t("vouchers.fields.name")}
                  maxLength={LENGTH_NAME}
                  t={t}
                />
              }
              required
              name="name"
              rules={[
                {
                  validator: (_, value) => validateCommon(_, value, t, "name"),
                },
              ]}
            >
              <Input maxLength={LENGTH_NAME} showCount />
            </Form.Item>
            <Form.Item
              label={
                <FieldLabel
                  fieldName={t("vouchers.fields.code")}
                  maxLength={LENGTH_CODE}
                  t={t}
                />
              }
              required
              name="code"
              rules={[
                {
                  validator: (_, value) => validateCommon(_, value, t, "code"),
                },
              ]}
            >
              <Input maxLength={LENGTH_CODE} showCount />
            </Form.Item>
            <Form.Item
              label={t("vouchers.fields.quantity")}
              name="quantity"
              required
              rules={[
                {
                  validator: (_, value) =>
                    validateCommon(_, value, t, "quantity"),
                },
              ]}
            >
              <InputNumber className="w-100" min={1} width={100} />
            </Form.Item>
            <Form.Item
              label={t("vouchers.fields.voucherRange")}
              name="voucherRange"
              required
              rules={[
                {
                  validator: (_, value) =>
                    validateCommon(_, value, t, "voucherRange"),
                },
              ]}
            >
              <RangePicker
                showTime={{ format: "HH:mm:ss" }}
                format="YYYY-MM-DD HH:mm"
                className="w-100"
                disabledDate={(current) =>
                  dayjs(current).isBefore(dayjs().startOf("day"))
                }
              />
            </Form.Item>
          </Col>
          <Col xs={24} lg={12}>
            <Form.Item
              label={t("vouchers.fields.type")}
              name="type"
              initialValue={"CASH"}
              required
              rules={[
                {
                  validator: (_, value) => validateCommon(_, value, t, "type"),
                },
              ]}
            >
              <Radio.Group>
                <Radio value={"PERCENTAGE"}>
                  {t("vouchers.type.PERCENTAGE")}
                </Radio>
                <Radio value={"CASH"}>{t("vouchers.type.CASH")}</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              label={t("vouchers.fields.value")}
              required
              name="value"
              rules={[
                {
                  validator: (_, value) => validateCommon(_, value, t, "value"),
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const typeValue = getFieldValue("type");

                    if (
                      typeValue === "PERCENTAGE" &&
                      value > LIMIT_VOUCHER_VALUE
                    ) {
                      return Promise.reject(
                        t("validator.vouchers.exceed", {
                          length: LIMIT_VOUCHER_VALUE,
                        })
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <InputNumber
                className="w-100"
                min={1}
                formatter={(value) =>
                  `${
                    type === "PERCENTAGE" ? value + "%" : `₫ ${value}`
                  }`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value: string | undefined) => {
                  if (type === "PERCENTAGE") {
                    const parsedValue = parseInt(value!.replace("%", ""), 10);
                    const newValue = isNaN(parsedValue) ? 0 : parsedValue;
                    return newValue;
                  } else {
                    const parsedValue = parseInt(
                      value!.replace(/₫\s?|(,*)/g, ""),
                      10
                    );
                    const newValue = isNaN(parsedValue) ? 0 : parsedValue;
                    return newValue;
                  }
                }}
              />
            </Form.Item>
            <Form.Item
              label={t("vouchers.fields.constraint")}
              name="constraint"
              required
              rules={[
                {
                  validator: (_, value) =>
                    validateCommon(_, value, t, "constraint"),
                },
              ]}
            >
              <InputNumber
                className="w-100"
                min={1}
                formatter={(value) =>
                  `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value: string | undefined) => {
                  const parsedValue = parseInt(
                    value!.replace(/₫\s?|(,*)/g, ""),
                    10
                  );
                  const newValue = isNaN(parsedValue) ? 0 : parsedValue;
                  return newValue;
                }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Col>
    </Row>,
    <Row key="relations" gutter={[16, 24]} align="middle">
      <VoucherRelation formProps={formProps} />
    </Row>,
  ];

  return (
    <Create
      isLoading={formLoading}
      footerButtons={
        <>
          {current > 0 && (
            <Button
              onClick={() => {
                gotoStep(current - 1);
              }}
            >
              {t("buttons.previousStep")}
            </Button>
          )}
          {current < formList.length - 1 && (
            <Button
              onClick={() => {
                gotoStep(current + 1);
              }}
            >
              {t("buttons.nextStep")}
            </Button>
          )}
          {current === formList.length - 1 && (
            <SaveButton style={{ marginRight: 10 }} {...saveButtonProps} />
          )}
        </>
      }
    >
      <Steps {...stepsProps} responsive size="small">
        <Steps.Step title={t("vouchers.steps.content")} />
        <Steps.Step title={t("vouchers.steps.relations")} />
      </Steps>
      <Form {...formProps} style={{ marginTop: 30 }} layout="vertical">
        {formList[current]}
        <Form.Item name="customers" hidden>
          <Input />
        </Form.Item>
      </Form>
    </Create>
  );
};
