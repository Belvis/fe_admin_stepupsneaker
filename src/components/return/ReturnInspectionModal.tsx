import {
  Button,
  Form,
  Grid,
  Input,
  InputNumber,
  Modal,
  ModalProps,
  Radio,
  Select,
} from "antd";
import { Dispatch, SetStateAction, useEffect } from "react";
import {
  IReturnFormDetailRequest,
  InspectionStatus,
  ReturnType,
} from "../../interfaces";
import { useTranslate } from "@refinedev/core";
import { useForm } from "@refinedev/antd";
import { validateCommon } from "../../helpers/validate";
import { LENGTH_DESCRIPTION } from "../../constants/common";
import { getInspectionStatusOptions } from "../../constants/status";
import ImageUpload from "../form/ImageUpload";
import { error } from "console";

type ReturnInspectionModalProps = {
  modalProps: ModalProps;
  action: "create" | "edit";
  type: ReturnType;
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
  type,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();

  const { formProps, formLoading } = useForm<IReturnFormDetailRequest>();

  const returnInspectionStatus: InspectionStatus = Form.useWatch(
    "returnInspectionStatus"
  );

  useEffect(() => {
    if (returnDetail) {
      formProps.form?.setFieldsValue({
        orderCode: returnDetail.orderCode,
        returnQuantity: returnDetail.returnQuantity,
        unitPrice: returnDetail.unitPrice,
        reason: returnDetail.reason,
        feedback: returnDetail.feedback,
        image: returnDetail.evidence,
        returnInspectionStatus: returnDetail.returnInspectionStatus,
        returnInspectionReason: returnDetail.returnInspectionReason,
        resellable: returnDetail.resellable,
      });
    }
  }, [returnDetail]);

  const handleOnFinish = (values: any) => {
    const returnQuantity = formProps.form?.getFieldValue("returnQuantity");
    const reason = formProps.form?.getFieldValue("reason");
    const feedback = formProps.form?.getFieldValue("feedback");
    const evidence = formProps.form?.getFieldValue("image");
    const returnInspectionStatus = formProps.form?.getFieldValue(
      "returnInspectionStatus"
    );
    const returnInspectionReason = formProps.form?.getFieldValue(
      "returnInspectionReason"
    );
    const resellable = formProps.form?.getFieldValue("resellable");

    if (
      returnDetail &&
      returnQuantity !== undefined &&
      reason &&
      feedback !== undefined &&
      evidence !== undefined &&
      resellable !== undefined
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
                returnInspectionStatus: returnInspectionStatus,
                returnInspectionReason: returnInspectionReason,
                resellable: resellable,
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
      title={t("orders.orders")}
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
          <Input min={1} />
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
        <Form.Item
          label={t("return-form-details.fields.returnInspectionStatus.label")}
          name="returnInspectionStatus"
          required={!(type === "ONLINE" && action === "create")}
          hidden={type == "ONLINE" && action === "create"}
          rules={[
            {
              validator: (_, value) => {
                if (type == "ONLINE" && action === "create") {
                  return Promise.resolve();
                } else {
                  return validateCommon(_, value, t, "returnInspectionStatus");
                }
              },
            },
          ]}
        >
          <Select
            placeholder={t(
              "return-form-details.fields.returnInspectionStatus.placeholder"
            )}
            options={getInspectionStatusOptions(t)}
          />
        </Form.Item>
        <Form.Item
          label={t("return-form-details.fields.returnInspectionReason.label")}
          name="returnInspectionReason"
          required={!(type === "ONLINE" && action === "create")}
          hidden={type == "ONLINE" && action === "create"}
          rules={[
            {
              validator: (_, value) => {
                if (type == "ONLINE" && action === "create") {
                  return Promise.resolve();
                } else {
                  return validateCommon(_, value, t, "returnInspectionReason");
                }
              },
            },
          ]}
        >
          <Input
            placeholder={t(
              "return-form-details.fields.returnInspectionReason.placeholder"
            )}
            maxLength={LENGTH_DESCRIPTION / 4}
            showCount
          />
        </Form.Item>

        <Form.Item
          label={t("return-form-details.fields.resellable.label")}
          name="resellable"
          required={
            !(type === "ONLINE" && action === "create") ||
            returnInspectionStatus === "FAILED"
          }
          hidden={
            (type == "ONLINE" && action === "create") ||
            returnInspectionStatus === "FAILED"
          }
          rules={[
            {
              validator: (_, value) => {
                if (
                  (type == "ONLINE" && action === "create") ||
                  returnInspectionStatus === "FAILED"
                ) {
                  return Promise.resolve();
                } else {
                  return validateCommon(_, value, t, "resellable");
                }
              },
            },
          ]}
        >
          <Radio.Group>
            <Radio value={true}>
              {t("return-form-details.fields.resellable.YES")}
            </Radio>
            <Radio value={false}>
              {t("return-form-details.fields.resellable.NO")}
            </Radio>
          </Radio.Group>
        </Form.Item>
        <ImageUpload
          formProps={formProps}
          label={t("return-form-details.fields.evidence.label")}
          tooltip={t("return-form-details.fields.evidence.tooltip")}
          required={false}
          hidden={type == "ONLINE" && action === "create"}
          raw
        />
      </Form>
    </Modal>
  );
};
