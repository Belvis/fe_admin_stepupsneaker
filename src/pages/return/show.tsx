import { SaveButton, Show, useForm } from "@refinedev/antd";
import {
  IResourceComponentsProps,
  useParsed,
  useShow,
  useTranslate,
} from "@refinedev/core";
import { App } from "antd";
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

export const ReturnShow: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();
  const { message } = App.useApp();
  const { id } = useParsed();

  const {
    queryResult: { refetch, data, isLoading },
  } = useShow<IReturnFormResponse>();

  const record = data?.data;

  const { onFinish, formProps, saveButtonProps, formLoading } =
    useForm<IReturnFormResponse>({ action: "edit", id });

  const [returnFormDetails, setReturnFormDetails] =
    useState<IReturnFormDetailRequest[]>();

  useEffect(() => {
    if (record?.order) {
      const customer =
        record.order?.fullName ??
        record.order?.customer?.fullName ??
        t("invoices.retailCustomer");

      formProps.form?.setFieldsValue({
        customer: {
          name: customer,
        },
        code: record.order.code,
      });
    }
  }, [record]);

  useEffect(() => {
    if (record) {
      const returnFormDetailsResponse: IReturnFormDetailResponse[] =
        record.returnFormDetails;
      const orderResponse: IOrderResponse = record.order;
      const defaultAddress = orderResponse?.customer?.addressList.find(
        (address) => address.isDefault
      );

      const returnFormDetailsRequest = returnFormDetailResponseToRequestList(
        returnFormDetailsResponse,
        orderResponse.code
      );

      if (defaultAddress) {
        formProps.form?.setFieldsValue({
          phoneNumber: defaultAddress.phoneNumber,
          provinceId: Number(defaultAddress.provinceId),
          districtId: Number(defaultAddress.districtId),
          wardCode: defaultAddress.wardCode,
          line: defaultAddress.more,
        });
      }

      setReturnFormDetails(returnFormDetailsRequest);
    }
  }, [record]);

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
      order: record?.order?.id,
      paymentType: formProps.form?.getFieldValue("paymentType"),
      paymentInfo: formProps.form?.getFieldValue("paymentInfo") ?? "Cash",
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
        isLoading={formLoading}
        footerButtonProps={{
          style: {
            width: "100%",
            padding: "0 24px",
            justifyContent: "end",
          },
        }}
        footerButtons={<></>}
      >
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
