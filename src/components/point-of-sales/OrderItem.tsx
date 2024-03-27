import { DeleteOutlined } from "@ant-design/icons";
import { useDelete, useTranslate, useUpdate } from "@refinedev/core";
import {
  App,
  Avatar,
  Button,
  Card,
  Col,
  Flex,
  InputNumber,
  Row,
  Typography,
  message,
  theme,
} from "antd";
import { NumberField } from "@refinedev/antd";
import { debounce, isNumber } from "lodash";
import { IOrderDetailResponse } from "../../interfaces";
import { orderDetailToRequest } from "../../helpers/mapper";
import { POSContext } from "../../contexts/point-of-sales";
import { useContext } from "react";
import { getDiscountPrice } from "../../helpers/money";
import { Variants, motion } from "framer-motion";
const { useToken } = theme;
const { Text } = Typography;

type OrderItemProps = {
  orderDetail: IOrderDetailResponse;
  count: number;
};

export const OrderItem: React.FC<OrderItemProps> = ({ orderDetail, count }) => {
  const t = useTranslate();
  const { token } = useToken();

  const { message } = App.useApp();

  const { mutate } = useDelete();
  const { mutate: updateQuantity } = useUpdate();

  const { refetchOrder, activeKey } = useContext(POSContext);

  function handleDelete() {
    mutate(
      {
        resource: "order-details",
        id: orderDetail.id,
        successNotification: () => {
          return false;
        },
        errorNotification: () => {
          return false;
        },
      },
      {
        onError: (error, variables, context) => {
          message.error(
            t("orders.notification.orderDetail.remove.error") +
              " " +
              error.message
          );
        },
        onSuccess: (data, variables, context) => {
          refetchOrder();
          message.success(t("orders.notification.orderDetail.remove.success"));
        },
      }
    );
  }

  const { quantity, productDetail, price, totalPrice } = orderDetail;
  const { product, color, size } = productDetail;

  const handleQuantityChange = (value: number | null) => {
    if (isNumber(value) && value > 0) {
      if (value > orderDetail.productDetail.quantity) {
        return message.info(t("products.messages.limitReached"));
      }

      if (value > 5) {
        return message.info(t("products.messages.purchaseLimit"));
      }

      if (value !== orderDetail.quantity) {
        const payLoad = orderDetailToRequest([orderDetail], activeKey)[0];
        updateQuantity(
          {
            resource: "order-details",
            values: {
              ...payLoad,
              quantity: value,
            },
            id: orderDetail.id,
            errorNotification: false,
            successNotification: false,
          },
          {
            onError: (error, variables, context) => {
              message.error(t("common.error") + error.message);
            },
            onSuccess: (data, variables, context) => {
              message.success(t("common.update.success"));
              refetchOrder();
            },
          }
        );
      }
    }
  };

  const promotionProductDetailsActive = (
    productDetail.promotionProductDetails ?? []
  ).filter((productDetail) => productDetail.promotion.status == "ACTIVE");

  const maxPromotionProductDetail = promotionProductDetailsActive.reduce(
    (maxProduct, currentProduct) => {
      return currentProduct.promotion.value > maxProduct.promotion.value
        ? currentProduct
        : maxProduct;
    },
    promotionProductDetailsActive[0]
  );

  const discount =
    promotionProductDetailsActive.length > 0
      ? maxPromotionProductDetail.promotion.value
      : 0;

  const discountedPrice = getDiscountPrice(productDetail.price, discount);
  const finalProductPrice = +(productDetail.price * 1);
  const finalDiscountedPrice = +((discountedPrice ?? discount) * 1);

  return (
    <Card
      style={{
        background: token.colorPrimaryBg,
        boxShadow: "0 4px 4px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
      }}
      className="order-items"
    >
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        key={orderDetail.id}
      >
        <Row align="middle" justify="center" style={{ overflow: "hidden" }}>
          <Col span={1}>
            <Text>{count + 1}</Text>
          </Col>
          <Col span={9}>
            <Flex gap={15}>
              <Avatar
                shape="square"
                size={64}
                src={orderDetail.productDetail.image}
              />
              <Flex vertical>
                <Text strong>{product.name}</Text>
                <Text>
                  {t("products.fields.size")}: {size.name}
                </Text>
                <Text>
                  {t("products.fields.color")}: {color.name}
                </Text>
              </Flex>
            </Flex>
          </Col>
          <Col span={3}>
            <InputNumber
              min={1}
              className="order-tab-quantity text-center"
              variant="borderless"
              style={{
                width: "100%",
                borderBottom: `1px solid ${token.colorPrimary}`,
                borderRadius: 0,
              }}
              value={quantity}
              onChange={debounce(
                (value) => handleQuantityChange(value as number),
                300
              )}
            />
          </Col>
          <Col span={4} className="text-end">
            <Text>
              <NumberField
                options={{
                  currency: "VND",
                  style: "currency",
                }}
                value={
                  discountedPrice !== null
                    ? finalDiscountedPrice
                    : finalProductPrice
                }
                locale={"vi"}
              />
            </Text>
          </Col>
          <Col span={4} className="text-end">
            <Text>
              <NumberField
                options={{
                  currency: "VND",
                  style: "currency",
                }}
                value={totalPrice}
                locale={"vi"}
              />
            </Text>
          </Col>
          <Col span={3} className="text-end">
            <Button
              shape="circle"
              type="text"
              onClick={handleDelete}
              icon={<DeleteOutlined />}
            />
          </Col>
        </Row>
      </motion.div>
    </Card>
  );
};
