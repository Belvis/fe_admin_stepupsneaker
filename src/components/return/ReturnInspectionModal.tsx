import { useForm } from "@refinedev/antd";
import { useTranslate } from "@refinedev/core";
import {
  Button,
  Form,
  Grid,
  Input,
  InputNumber,
  Modal,
  ModalProps,
} from "antd";
import { Dispatch, SetStateAction, useEffect } from "react";
import { LENGTH_DESCRIPTION } from "../../constants/common";
import { validateCommon } from "../../helpers/validate";
import { IReturnFormDetailRequest } from "../../interfaces";
import ImageUpload from "../form/ImageUpload";

type ReturnInspectionModalProps = {
  modalProps: ModalProps;
  action: "create" | "edit";
  close: () => void;
  returnDetail: IReturnFormDetailRequest;
  setReturnFormDetails: Dispatch<
    SetStateAction<IReturnFormDetailRequest[] | undefined>
  >;
};

export const ReturnInspectionModal: React.FC<ReturnInspectionModalProps> = ({
  modalProps,
  action,
  returnDetail,
  close,
  setReturnFormDetails,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();

  const { formProps, formLoading } = useForm<IReturnFormDetailRequest>();

  useEffect(() => {
    if (returnDetail) {
      formProps.form?.setFieldsValue({
        orderCode: returnDetail.orderCode,
        returnQuantity: returnDetail.returnQuantity,
        unitPrice: returnDetail.unitPrice,
        reason: returnDetail.reason,
        feedback: returnDetail.feedback,
        image: returnDetail.evidence,
      });
    }
  }, [returnDetail]);

  const handleOnFinish = (values: any) => {
    const returnQuantity = formProps.form?.getFieldValue("returnQuantity");
    const reason = formProps.form?.getFieldValue("reason");
    const feedback = formProps.form?.getFieldValue("feedback");
    const evidence = formProps.form?.getFieldValue("image");

    if (
      returnDetail &&
      returnQuantity !== undefined &&
      reason &&
      feedback !== undefined &&
      evidence !== undefined
    ) {
      setReturnFormDetails((prevState) => {
        if (prevState) {
          return prevState.map((detail) => {
            if (detail.orderDetail === returnDetail.orderDetail) {
              return {
                ...detail,
                returnQuantity: returnQuantity,
                reason: reason,
                feedback: feedback,
                evidence: evidence,
              };
            }
            return detail;
          });
        }
        return prevState;
      });
      close();
    }
  };

  return (
    <Modal
      {...modalProps}
      title={t("return-form-details.return-form-details")}
      zIndex={1001}
      width={breakpoint.sm ? "700px" : "100%"}
      footer={
        <Button
          type="primary"
          loading={formLoading}
          onClick={() => {
            formProps.form?.submit();
          }}
        >
          {t("buttons.save")}
        </Button>
      }
    >
      <Form
        {...formProps}
        style={{ marginTop: 30 }}
        onFinish={handleOnFinish}
        layout="vertical"
      >
        <Form.Item
          label={t("return-form-details.fields.orderCode")}
          name="orderCode"
        >
          <Input disabled />
        </Form.Item>
        <Form.Item
          label={t("return-form-details.fields.quantity")}
          name="returnQuantity"
          required
          rules={[
            {
              validator: (_, value) =>
                validateCommon(_, value, t, "returnQuantity"),
            },
            {
              validator: (_, value) => {
                if (!value) {
                  return Promise.resolve();
                }

                if (value > returnDetail.quantity) {
                  return Promise.reject(
                    new Error(t("return-forms.message.invalidReturnQuantity"))
                  );
                }

                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber style={{ width: "100%" }} min={1} />
        </Form.Item>
        <Form.Item
          label={t("return-form-details.fields.unitPrice")}
          name="unitPrice"
          rules={[
            {
              validator: (_, value) => validateCommon(_, value, t, "unitPrice"),
            },
          ]}
        >
          <InputNumber
            disabled
            min={1}
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
          label={t("return-form-details.fields.reason.label")}
          name="reason"
          required
          rules={[
            {
              validator: (_, value) => validateCommon(_, value, t, "reason"),
            },
          ]}
        >
          <Input
            placeholder={t("return-form-details.fields.reason.placeholder")}
            maxLength={LENGTH_DESCRIPTION / 4}
            showCount
          />
        </Form.Item>
        <Form.Item
          label={t("return-form-details.fields.feedback.label")}
          name="feedback"
          required
          rules={[
            {
              validator: (_, value) => validateCommon(_, value, t, "feedback"),
            },
          ]}
        >
          <Input
            placeholder={t("return-form-details.fields.feedback.placeholder")}
            maxLength={LENGTH_DESCRIPTION / 4}
            showCount
          />
        </Form.Item>
        <ImageUpload
          formProps={formProps}
          label={t("return-form-details.fields.evidence.label")}
          tooltip={t("return-form-details.fields.evidence.tooltip")}
          required={true}
          raw
        />
      </Form>
    </Modal>
  );
};
