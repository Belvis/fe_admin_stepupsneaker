import { SaveButton, Show, useForm, useModal } from "@refinedev/antd";
import {
  IResourceComponentsProps,
  useParsed,
  useShow,
  useTranslate,
  useUpdate,
} from "@refinedev/core";
import { App, Button } from "antd";
import { useEffect, useState } from "react";
import { ReturnForm } from "../../components/return/ReturnForm";
import { showWarningConfirmDialog } from "../../helpers/confirm";
import {
  returnFormDetailResponseToRequestList,
  returnFormDetailsToPayloadFormat,
} from "../../helpers/mapper";
import {
  DeliveryStatus,
  IOrderResponse,
  IReturnFormDetailRequest,
  IReturnFormDetailResponse,
  IReturnFormResponse,
} from "../../interfaces";
import { ReturnSteps } from "../../components/return/ReturnSteps";
import { ReturnHistoryTimeLine } from "../../components/return/ReturnHistoryTimeLine";
import { TbStatusChange } from "react-icons/tb";
import { AiOutlineFileDone } from "react-icons/ai";
import UpdateStatusModal from "../../components/return/UpdateStatusModal";
import { MdHistoryEdu } from "react-icons/md";

export const ReturnShow: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();
  const { message } = App.useApp();
  const { id } = useParsed();

  const {
    queryResult: { refetch, data, isLoading },
  } = useShow<IReturnFormResponse>();

  const { onFinish, formProps, saveButtonProps, formLoading } =
    useForm<IReturnFormResponse>({});

  const {
    show: showReason,
    close: closeReason,
    modalProps: { visible: vi2, ...restPropsReason },
  } = useModal();

  const [returnFormDetails, setReturnFormDetails] =
    useState<IReturnFormDetailRequest[]>();

  const [selectedOrder, setSelectedOrder] = useState<IOrderResponse>();
  const [returnForm, setReturnForm] = useState<IReturnFormResponse>();

  const [status, setStatus] = useState<DeliveryStatus>("PENDING");

  const defaultAddress = selectedOrder?.customer?.addressList.find(
    (address) => address.isDefault
  );

  useEffect(() => {
    if (defaultAddress) {
      formProps.form?.setFieldsValue({
        phoneNumber: defaultAddress.phoneNumber,
        provinceId: Number(defaultAddress.provinceId),
        districtId: Number(defaultAddress.districtId),
        wardCode: defaultAddress.wardCode,
        line: defaultAddress.more,
      });
    }
  }, [defaultAddress]);

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
      returnDeliveryStatus: formProps.form?.getFieldValue(
        "returnDeliveryStatus"
      ),
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

  const {
    show,
    close,
    modalProps: { visible: vi, ...restProps },
  } = useModal();

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
        headerButtons={({ defaultButtons }) => (
          <>
            {defaultButtons}
            <Button icon={<MdHistoryEdu />} type="primary" onClick={show}>
              Xem lịch sử
            </Button>
            <Button
              icon={<TbStatusChange />}
              type="primary"
              disabled={returnForm?.returnDeliveryStatus === "COMPLETED"}
              onClick={() => {
                const status = getNextStatus(
                  returnForm?.returnDeliveryStatus ?? "PENDING"
                );
                setStatus(status ?? "PENDING");
                showReason();
              }}
            >
              Cập nhật trạng thái
            </Button>
            <Button
              icon={<AiOutlineFileDone />}
              disabled={returnForm?.returnDeliveryStatus === "COMPLETED"}
              type="primary"
              onClick={() => {
                setStatus("COMPLETED");
                showReason();
              }}
            >
              Xác nhận hoàn thành
            </Button>
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
      {restProps.open && (
        <ReturnHistoryTimeLine id={id} modalProps={restProps} close={close} />
      )}

      {restPropsReason.open && (
        <UpdateStatusModal
          restModalProps={restPropsReason}
          close={closeReason}
          returnForm={returnForm ?? ({} as IReturnFormResponse)}
          callBack={refetch}
          status={status}
        />
      )}
    </>
  );
};

const getNextStatus = (
  currentStatus: DeliveryStatus
): DeliveryStatus | null => {
  const statusList: DeliveryStatus[] = [
    "PENDING",
    "RETURNING",
    "RECEIVED",
    "COMPLETED",
  ];
  const currentIndex = statusList.indexOf(currentStatus);

  if (currentIndex !== -1) {
    let nextIndex = currentIndex + 1;

    // Check if current status is COMPLETED
    if (currentStatus === "COMPLETED") {
      // If current status is COMPLETED, return to PENDING (statusList[0])
      return statusList[0];
    }

    // Otherwise, proceed normally
    if (nextIndex < statusList.length) {
      return statusList[nextIndex];
    }
  }

  return null;
};
