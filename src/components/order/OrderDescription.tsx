import { DateField, NumberField } from "@refinedev/antd";
import { useTranslate } from "@refinedev/core";
import { Badge, Descriptions, DescriptionsProps, Empty } from "antd";
import { IOrderResponse } from "../../interfaces";
import { ReactChild } from "react";
import dayjs from "dayjs";

type OrderDescriptionProps = {
  record: IOrderResponse;
};

export const OrderDescription: React.FC<OrderDescriptionProps> = ({
  record,
}) => {
  const t = useTranslate();

  const items: DescriptionsProps["items"] = [
    {
      key: "1",
      label: t("orders.deliverables.fields.items"),
      span: 2,
      children: (
        <ul>
          {record.orderDetails.map((orderDetail) => (
            <li key={orderDetail.id}>
              {orderDetail.productDetail.product.name} -{" "}
              {orderDetail.productDetail.color.name} -{" "}
              {orderDetail.productDetail.size.name} - x{orderDetail.quantity}
            </li>
          ))}
        </ul>
      ),
    },
    {
      key: "2",
      label: t("orders.fields.status"),
      span: 1,
      children: (
        <Badge
          status="processing"
          text={t(`enum.orderStatuses.${record.status}`)}
        />
      ),
    },
    {
      key: "3",
      label: t("orders.fields.type.title"),
      span: 1,
      children: t(`orders.fields.type.${record.type}`),
    },
    {
      key: "4",
      label: t("orders.fields.createdAt"),
      children: (
        <DateField
          value={dayjs(new Date(record.createdAt || 0))}
          format="LLL"
        />
      ),
    },
    {
      key: "5",
      label: t("orders.fields.code"),
      span: 1,
      children: record.code,
    },
    {
      key: "6",
      label: t("orders.fields.note"),
      span: 2,
      children: record.note ?? "Đơn hàng không có ghi chú",
    },
    {
      key: "7",
      label: t("orders.deliverables.fields.total"),
      children: (
        <NumberField
          options={{
            currency: "VND",
            style: "currency",
          }}
          value={record.originMoney ?? 0}
          locale={"vi"}
        />
      ),
    },
    {
      key: "8",
      label: t("orders.tab.discount"),
      children: (
        <NumberField
          options={{
            currency: "VND",
            style: "currency",
          }}
          value={record.reduceMoney ?? 0}
          locale={"vi"}
        />
      ),
    },
    {
      key: "9",
      label: t("orders.tab.shippingMoney"),
      children: (
        <NumberField
          options={{
            currency: "VND",
            style: "currency",
          }}
          value={record.shippingMoney as ReactChild}
          locale={"vi"}
        />
      ),
    },
    {
      key: "10",
      label: t("orders.deliverables.receipt"),
      children: (
        <NumberField
          options={{
            currency: "VND",
            style: "currency",
          }}
          value={record.totalMoney as ReactChild}
          locale={"vi"}
        />
      ),
    },
    {
      key: "11",
      label: t("orders.deliverables.fields.payment"),
      span: 3,
      children: (
        <>
          {record.payments &&
            record.payments.map((payment) => (
              <div key={payment.id}>
                {payment.paymentStatus === "PENDING" ? (
                  <>
                    <NumberField
                      options={{
                        currency: "VND",
                        style: "currency",
                      }}
                      value={payment.totalMoney}
                      locale={"vi"}
                    />
                    {" - "}
                    <span>Chưa thanh toán</span>
                  </>
                ) : (
                  <>
                    <NumberField
                      options={{
                        currency: "VND",
                        style: "currency",
                      }}
                      value={payment.totalMoney}
                      locale={"vi"}
                    />
                    {" - "}
                    <DateField
                      value={dayjs(new Date(payment.updatedAt))}
                      format="LLL"
                    />
                    {payment.transactionCode !== "CASH" && (
                      <>
                        {" - "}
                        {t("payments.fields.transactionCode")}
                        {`: ${payment.transactionCode}`}
                      </>
                    )}
                  </>
                )}
              </div>
            ))}
        </>
      ),
    },
    {
      key: "12",
      label: t("orders.deliverables.fields.paymentMethod"),
      children: (
        <>
          {record.payments &&
            record.payments
              .map((payment, index) =>
                t(`paymentMethods.options.${payment.paymentMethod.name}`)
              )
              .join(", ")}
        </>
      ),
    },
    {
      key: "13",
      label: t("orders.fields.address"),
      span: 4,
      children: (
        <>
          {record.address ? (
            <>
              <div>
                <strong>{t("customers.fields.phone.label")}</strong>:{" "}
                {record.address.phoneNumber}
              </div>
              <div>
                <strong>{t("customers.fields.province.label")}</strong>:{" "}
                {record.address.provinceName}
              </div>
              <div>
                <strong>{t("customers.fields.district.label")}</strong>:{" "}
                {record.address.districtName}
              </div>
              <div>
                <strong>{t("customers.fields.ward.label")}</strong>:{" "}
                {record.address.wardName}
              </div>
              <div>
                <strong>{t("customers.fields.more")}</strong>:{" "}
                {record.address.more}
              </div>
            </>
          ) : (
            <div>
              <Empty />
            </div>
          )}
        </>
      ),
    },
    {
      key: "14",
      label: t("orders.fields.customer"),
      span: 2,
      children: (
        <>
          {record.customer ? (
            <>
              <div>
                <strong>{t("customers.fields.fullName")}</strong>:{" "}
                {record.customer.fullName}
              </div>
              <div>
                <strong>{t("customers.fields.email")}</strong>:{" "}
                {record.customer.email}
              </div>
              <div>
                <strong>{t("customers.fields.dateOfBirth")}</strong>:{" "}
                <DateField
                  value={dayjs(new Date(record.customer.dateOfBirth))}
                  format="LL"
                />
              </div>
              <div>
                <strong>{t("customers.fields.gender.label")}</strong>:{" "}
                {t(`customers.fields.gender.options.${record.customer.gender}`)}
              </div>
              <div>
                {record.customer.addressList.length > 0 ? (
                  <>
                    <strong>{t("customers.fields.address")}</strong>:{" "}
                    {record.customer.addressList.map((address) => (
                      <span key={address.id}>
                        {address.isDefault && (
                          <>
                            {address.more}, {address.wardName},{" "}
                            {address.districtName}, {address.provinceName}
                          </>
                        )}
                      </span>
                    ))}
                  </>
                ) : (
                  "N/A"
                )}
              </div>
            </>
          ) : (
            <div>
              <Empty />
            </div>
          )}
        </>
      ),
    },
    {
      key: "15",
      label: t("orders.fields.employee"),
      span: 2,
      children: (
        <>
          {record.employee ? (
            <>
              <div>
                <strong>{t("employees.fields.fullName")}</strong>:{" "}
                {record.employee.fullName}
              </div>
              <div>
                <strong>{t("employees.fields.email")}</strong>:{" "}
                {record.employee.email}
              </div>
              <div>
                <strong>{t("employees.fields.phoneNumber")}</strong>:{" "}
                {record.employee.phoneNumber}
              </div>
              <div>
                <strong>{t("employees.fields.gender.label")}</strong>:{" "}
                {t(`employees.fields.gender.options.${record.employee.gender}`)}
              </div>
              <div>
                <strong>{t("employees.fields.address")}</strong>:{" "}
                {record.employee.address}
              </div>
            </>
          ) : (
            <div>
              <Empty />
            </div>
          )}
        </>
      ),
    },
  ];

  return (
    <Descriptions
      title="Thông tin đơn hàng"
      bordered
      column={4}
      layout="vertical"
      items={items}
    />
  );
};
