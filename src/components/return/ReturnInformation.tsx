import {
  IResourceComponentsProps,
  useGetIdentity,
  useTranslate,
} from "@refinedev/core";

import { App } from "antd";
import { useContext, useEffect } from "react";
import { ReturnFormContext } from "../../contexts/return";
import { showWarningConfirmDialog } from "../../helpers/confirm";
import { returnFormDetailsToPayloadFormat } from "../../helpers/mapper";
import { IEmployeeResponse } from "../../interfaces";
import { ReturnForm } from "./ReturnForm";

export const ReturnInformation: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();
  const { message } = App.useApp();

  const {
    formProps,
    onFinish,
    selectedOrder,
    returnFormDetails,
    setReturnFormDetails,
  } = useContext(ReturnFormContext);

  const { data } = useGetIdentity<IEmployeeResponse>();

  useEffect(() => {
    const calculateTotalMoney = () => {
      if (!returnFormDetails) {
        return 0;
      }

      let calculatedTotalMoney = 0;

      returnFormDetails.forEach(({ returnQuantity, unitPrice }) => {
        calculatedTotalMoney += returnQuantity * unitPrice;
      });

      return calculatedTotalMoney;
    };

    const totalMoney = formProps.form?.getFieldValue("amountToBePaid");
    const newTotalMoney = calculateTotalMoney();

    if (newTotalMoney !== totalMoney) {
      formProps.form?.setFieldValue("amountToBePaid", newTotalMoney);
    }
  }, [returnFormDetails]);

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
    if (data) {
      formProps.form?.setFieldsValue({
        employee: {
          fullName: data.fullName,
        },
      });
    }
  }, [data]);

  const handleOnFinish = (values: any) => {
    const isValid = returnFormDetails?.every((returnFormDetail) =>
      Object.values(returnFormDetail).every((value) => {
        if (!(value !== "" && value !== undefined)) {
          console.log("returnFormDetail", returnFormDetail);
        }
        return value !== "" && value !== undefined;
      })
    );

    if (!isValid) {
      message.warning(t("return-forms.message.emptyReturnDetails"));
      return;
    }

    const returnFormDetailsPayload =
      returnFormDetailsToPayloadFormat(returnFormDetails);

    const submitData = {
      order: selectedOrder?.id,
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
      {returnFormDetails && (
        <ReturnForm
          action="create"
          formProps={formProps}
          handleOnFinish={handleOnFinish}
          returnFormDetails={returnFormDetails}
          setReturnFormDetails={setReturnFormDetails}
        />
      )}
    </>
  );
};
