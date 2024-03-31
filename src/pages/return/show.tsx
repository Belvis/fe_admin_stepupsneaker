import { SaveButton, Show, useForm } from "@refinedev/antd";
import { IResourceComponentsProps, useTranslate } from "@refinedev/core";
import { App, Button } from "antd";
import { useEffect, useState } from "react";
import { ReturnForm } from "../../components/return/ReturnForm";
import { showWarningConfirmDialog } from "../../helpers/confirm";
import {
  returnFormDetailResponseToRequestList,
  returnFormDetailsToPayloadFormat,
} from "../../helpers/mapper";
import {
  IOrderResponse,
  IReturnFormDetailRequest,
  IReturnFormDetailResponse,
  IReturnFormResponse,
} from "../../interfaces";
import { ReturnSteps } from "../../components/return/ReturnSteps";

export const ReturnShow: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();
  const { message } = App.useApp();

  const { onFinish, formProps, saveButtonProps, formLoading } =
    useForm<IReturnFormResponse>({
      action: "edit",
    });

  const [returnFormDetails, setReturnFormDetails] =
    useState<IReturnFormDetailRequest[]>();
  const [selectedOrder, setSelectedOrder] = useState<IOrderResponse>();
  const [returnForm, setReturnForm] = useState<IReturnFormResponse>();

  useEffect(() => {
    if (selectedOrder) {
      const customer =
        selectedOrder?.fullName ??
        selectedOrder?.customer?.fullName ??
        t("invoices.retailCustomer");

      formProps.form?.setFieldsValue({
        customer: {
          name: customer,
        },
        code: selectedOrder.code,
      });
    }
  }, [selectedOrder]);

  useEffect(() => {
    if (formProps.initialValues) {
      const returnFormDetailsResponse: IReturnFormDetailResponse[] =
        formProps.initialValues.returnFormDetails;
      const orderResponse: IOrderResponse = formProps.initialValues.order;
      const returnForm: IReturnFormResponse =
        formProps.initialValues as IReturnFormResponse;

      const returnFormDetailsRequest = returnFormDetailResponseToRequestList(
        returnFormDetailsResponse,
        orderResponse.code
      );
      setReturnFormDetails(returnFormDetailsRequest);
      setSelectedOrder(orderResponse);
      setReturnForm(returnForm);
    }
  }, [formProps.initialValues]);

  const handleOnFinish = (values: any) => {
    const isValid = returnFormDetails?.every((returnFormDetail) =>
      Object.values(returnFormDetail).every(
        (value) => value !== "" && value !== undefined
      )
    );

    if (!isValid) {
      message.warning(t("return-forms.message.emptyReturnDetails"));
      return;
    }

    const returnFormDetailsPayload =
      returnFormDetailsToPayloadFormat(returnFormDetails);

    const submitData = {
      address: {
        phoneNumber: formProps.form?.getFieldValue("phoneNumber"),
        districtId: formProps.form?.getFieldValue("districtId"),
        districtName: formProps.form?.getFieldValue("districtName"),
        provinceId: formProps.form?.getFieldValue("provinceId"),
        provinceName: formProps.form?.getFieldValue("provinceName"),
        wardCode: formProps.form?.getFieldValue("wardCode"),
        wardName: formProps.form?.getFieldValue("wardName"),
        more: formProps.form?.getFieldValue("line"),
      },
      order: selectedOrder?.id,
      paymentType: formProps.form?.getFieldValue("paymentType"),
      refundStatus: formProps.form?.getFieldValue("refundStatus"),
      deliveryStatus: formProps.form?.getFieldValue("deliveryStatus"),
      paymentInfo: formProps.form?.getFieldValue("paymentInfo") ?? "Cash",
      type: formProps.form?.getFieldValue("type"),
      amountToBePaid: formProps.form?.getFieldValue("amountToBePaid"),
      returnFormDetails: returnFormDetailsPayload,
    };
    showWarningConfirmDialog({
      options: {
        accept: () => {
          onFinish(submitData);
        },
        reject: () => {},
      },
      t: t,
    });
  };

  return (
    <>
      <Show
        canEdit={false}
        footerButtonProps={{
          style: {
            width: "100%",
            padding: "0 24px",
            justifyContent: "end",
          },
        }}
        headerButtons={({ defaultButtons }) => (
          <>
            {defaultButtons}
            <Button type="primary">Xem lịch sử</Button>
          </>
        )}
        footerButtons={
          <>
            {returnForm?.refundStatus === "PENDING" && (
              <SaveButton {...saveButtonProps} />
            )}
          </>
        }
      >
        <ReturnSteps record={returnForm} callBack={null} />
        {returnFormDetails && (
          <ReturnForm
            action="edit"
            formProps={formProps}
            handleOnFinish={handleOnFinish}
            returnFormDetails={returnFormDetails}
            setReturnFormDetails={setReturnFormDetails}
          />
        )}
      </Show>
    </>
  );
};
