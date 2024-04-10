import { useTranslate } from "@refinedev/core";
import { Button, Form, Grid, InputNumber, Modal, ModalProps } from "antd";
import { Dispatch, SetStateAction } from "react";
import { IReturnFormDetailRequest } from "../../interfaces";
import { useForm } from "@refinedev/antd";
import { validateCommon } from "../../helpers/validate";
import _ from "lodash";

type ReturnAPartModalProps = {
  modalProps: ModalProps;
  close: () => void;
  returnDetail: IReturnFormDetailRequest;
  setReturnFormDetails: Dispatch<
    SetStateAction<IReturnFormDetailRequest[] | undefined>
  >;
};

export const ReturnAPartModal: React.FC<ReturnAPartModalProps> = ({
  modalProps,
  returnDetail,
  close,
  setReturnFormDetails,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();

  const { formProps, formLoading } = useForm<IReturnFormDetailRequest>();

  const handleOnFinish = (values: any) => {
    const returnQuantity = formProps.form?.getFieldValue("returnQuantity");

    if (returnDetail && returnQuantity !== undefined) {
      const newReturnDetail: IReturnFormDetailRequest = {
        ...returnDetail,
        returnQuantity: returnQuantity,
        id: returnDetail.id + "-splited-" + returnQuantity,
      };

      console.log("newReturnDetail", newReturnDetail);

      setReturnFormDetails((prevState) => {
        if (prevState) {
          return prevState.concat(newReturnDetail).map((detail) => {
            if (detail.orderDetail === returnDetail.orderDetail) {
              return {
                ...detail,
                returnQuantity: detail.returnQuantity - returnQuantity,
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
          loading={formLoading}
          type="primary"
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

                if (value >= returnDetail.returnQuantity) {
                  return Promise.reject(
                    new Error(t("return-forms.message.invalidReturnQuantity"))
                  );
                }

                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber min={1} className="w-100" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
