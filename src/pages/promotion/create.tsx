import { Create, SaveButton, useStepsForm } from "@refinedev/antd";
import { IResourceComponentsProps, useTranslate } from "@refinedev/core";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Steps,
  Typography,
} from "antd";

import dayjs from "dayjs";
import { FieldLabel } from "../../components/form/FieldLabel";
import ImageUpload from "../../components/form/ImageUpload";
import PromotionRelation from "../../components/promotion/PromotionRelation";
import {
  LENGTH_CODE,
  LENGTH_NAME,
  LIMIT_VOUCHER_VALUE,
} from "../../constants/common";
import { showWarningConfirmDialog } from "../../helpers/confirm";
import { validateCommon } from "../../helpers/validate";
import { IPromotionResponse } from "../../interfaces";

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

export const PromotionCreate: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();

  const {
    current,
    gotoStep,
    stepsProps,
    formProps,
    saveButtonProps,
    formLoading,
    onFinish,
  } = useStepsForm<IPromotionResponse>({
    submit: (values: any) => {
      const data = {
        code: `${values.code}`,
        name: `${values.name}`,
        status: `ACTIVE`,
        value: `${values.value}`,
        startDate: `${values.promotionRange[0].valueOf()}`,
        endDate: `${values.promotionRange[1].valueOf()}`,
        image: `${values.image}`,
        productDetailIds: values.productDetails,
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
                  fieldName={t("promotions.fields.name")}
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
                  fieldName={t("promotions.fields.code")}
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
          </Col>
          <Col xs={24} lg={12}>
            <Form.Item
              label={t("promotions.fields.promotionRange")}
              name="promotionRange"
              required
              rules={[
                {
                  validator: (_, value) =>
                    validateCommon(_, value, t, "promotionRange"),
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
            <Form.Item
              label={t("promotions.fields.value")}
              required
              name="value"
              rules={[
                {
                  validator: (_, value) => validateCommon(_, value, t, "value"),
                },
                {
                  validator(_, value) {
                    if (value > LIMIT_VOUCHER_VALUE) {
                      return Promise.reject(
                        t("validator.vouchers.exceed", {
                          length: LIMIT_VOUCHER_VALUE,
                        })
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber
                className="w-100"
                min={1}
                formatter={(value) => `${value}%`}
                parser={(value: string | undefined) => {
                  const parsedValue = parseInt(value!.replace("%", ""), 10);
                  const newValue = isNaN(parsedValue) ? 0 : parsedValue;
                  return newValue;
                }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Col>
    </Row>,
    <Row key="relations" gutter={[16, 24]}>
      <PromotionRelation formProps={formProps} />
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
        <Steps.Step title={t("promotions.steps.content")} />
        <Steps.Step title={t("promotions.steps.relations")} />
      </Steps>
      <Form {...formProps} style={{ marginTop: 30 }} layout="vertical">
        {formList[current]}
        <Form.Item name="productDetails" hidden>
          <Input />
        </Form.Item>
      </Form>
    </Create>
  );
};
