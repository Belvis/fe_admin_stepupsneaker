import { useTranslate } from "@refinedev/core";
import { AppIcon } from "../components/app-icon";
import { IOrderResponse } from "../interfaces";
import dayjs from "dayjs";
import { APP_TITLE, STORE_ADDRESS } from "../constants/common";
import { NumberField } from "@refinedev/antd";
import React from "react";

interface InvoiceTemplateProps {
  order: IOrderResponse;
}

export const InvoiceTemplate = React.forwardRef<
  HTMLDivElement,
  InvoiceTemplateProps
>(({ order }, ref) => {
  const t = useTranslate();

  const formattedDate = dayjs(order.createdAt).format("LLLL");
  const defaultAddress = order.customer?.addressList.find(
    (address) => address.isDefault
  );

  return (
    <div className="d-flex flex-column" ref={ref}>
      <div className="mb-4 p-4 ">
        <div className="invoice-header d-flex justify-content-between align-items-end pb-4 mb-8">
          <div>
            <h1 className="h2 font-weight-bold">
              {t("invoices.title")} #{order.code}
            </h1>
            <p className="text-muted fs-6">{formattedDate}</p>
          </div>
          <AppIcon width="25%" height="25%" />
        </div>

        <div className="text-end">
          <p className="m-0">
            <strong>{t("storeName", { APP_TITLE })}</strong>
          </p>
          <p className="m-0">{STORE_ADDRESS.line},</p>
          <p className="m-0">{STORE_ADDRESS.city},</p>
          <p className="m-0">{STORE_ADDRESS.province},</p>
          <p className="m-0">{STORE_ADDRESS.district}</p>
        </div>

        <hr className="my-4" />

        <div>
          <p className="m-0">
            <strong>{t("invoices.recipient")}:</strong>
          </p>
          {order.customer ? (
            <>
              <p className="m-0">{order.customer.fullName}</p>
              {defaultAddress ? (
                <div>
                  <p className="m-0">{defaultAddress.phoneNumber}</p>
                  <p className="m-0">{defaultAddress.more}</p>
                  <p className="m-0">{defaultAddress.provinceName},</p>
                  <p className="m-0">{defaultAddress.districtName},</p>
                  <p className="m-0">{defaultAddress.wardName},</p>
                </div>
              ) : (
                <p className="m-0">{t("invoices.noAddress")}</p>
              )}
            </>
          ) : (
            <p className="m-0">{t("invoices.retailCustomer")}</p>
          )}
        </div>

        <hr className="my-4" />

        <table className="table my-5">
          <thead>
            <tr className="border-bottom">
              <th className="text-left font-weight-bold py-2">#</th>
              <th className="text-left font-weight-bold py-2">
                {t("invoices.fields.description")}
              </th>
              <th className="text-left font-weight-bold py-2">
                {t("invoices.fields.unitPrice")}
              </th>
              <th className="text-left font-weight-bold py-2">
                {t("invoices.fields.quantity")}
              </th>
              <th className="text-left font-weight-bold py-2">
                {t("invoices.fields.totalPrice")}
              </th>
            </tr>
          </thead>
          <tbody>
            {order.orderDetails &&
              order.orderDetails.map((item, index) => (
                <tr className="border-b border-gray-300">
                  <td className="py-2">{index}</td>
                  <td className="py-2">
                    {item.productDetail.product.name} |{" "}
                    {item.productDetail.color.name} -{" "}
                    {item.productDetail.size.name}
                  </td>
                  <td className="py-2">
                    <NumberField
                      options={{
                        currency: "VND",
                        style: "currency",
                      }}
                      value={item.price}
                      locale={"vi"}
                    />
                  </td>
                  <td className="py-2">{item.quantity}</td>
                  <td className="py-2">
                    <NumberField
                      options={{
                        currency: "VND",
                        style: "currency",
                      }}
                      value={item.totalPrice}
                      locale={"vi"}
                    />
                  </td>
                </tr>
              ))}

            <tr className="border-b border-gray-300">
              <th className="text-left font-bold py-2"></th>
              <th className="text-left font-bold py-2">
                {t("invoices.fields.total")}
              </th>
              <th className="text-left font-bold py-2"></th>
              <th className="text-left font-bold py-2"></th>
              <th className="text-left font-bold py-2">
                <NumberField
                  options={{
                    currency: "VND",
                    style: "currency",
                  }}
                  value={order.originMoney}
                  locale={"vi"}
                />
              </th>
            </tr>
            <tr className="border-b border-gray-300">
              <th className="text-left font-bold py-2"></th>
              <th className="text-left font-bold py-2">
                {t("invoices.fields.reduceMoney")}
              </th>
              <th className="text-left font-bold py-2"></th>
              <th className="text-left font-bold py-2"></th>
              <th className="text-left font-bold py-2">
                <NumberField
                  options={{
                    currency: "VND",
                    style: "currency",
                  }}
                  value={order.reduceMoney}
                  locale={"vi"}
                />
              </th>
            </tr>
            <tr className="border-b border-gray-300">
              <th className="text-left font-bold py-2"></th>
              <th className="text-left font-bold py-2">
                {t("invoices.fields.totalMoney")}
              </th>
              <th className="text-left font-bold py-2"></th>
              <th className="text-left font-bold py-2"></th>
              <th className="text-left font-bold py-2">
                <NumberField
                  options={{
                    currency: "VND",
                    style: "currency",
                  }}
                  value={order.totalMoney}
                  locale={"vi"}
                />
              </th>
            </tr>
          </tbody>
        </table>
        <div className="invoice-footer ">
          <hr className="my-4 " />
          <div className=" d-flex justify-content-between align-items-start ">
            <div>
              <h6 className="text-secondary fw-light">
                {t("invoices.title")} #{order.code}
              </h6>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
