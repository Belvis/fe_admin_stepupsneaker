import { useTranslate } from "@refinedev/core";
import {
  Button,
  Col,
  Drawer,
  Flex,
  Grid,
  Radio,
  RadioChangeEvent,
  Row,
  Select,
  Space,
  Switch,
  Typography,
} from "antd";
import _ from "lodash";
import { ReactNode, useContext, useEffect, useState } from "react";
import {
  DirectSalesContext,
  SorterType,
  initialSorters,
} from "../../../contexts/point-of-sales/direct-sales";
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { AnimatePresence, motion } from "framer-motion";

const { Title, Text } = Typography;

type POSSorterProps = {
  open: boolean;
  onClose: () => void;
};

export const POSSorter: React.FC<POSSorterProps> = ({ open, onClose }) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();

  const { sorters: initialSorter, setSorters } = useContext(DirectSalesContext);

  const [tempSorter, setTempSorter] = useState<SorterType>(initialSorter);

  useEffect(() => {
    if (initialSorter) {
      setTempSorter(_.cloneDeep(initialSorter));
    }
  }, [initialSorter, open]);

  const onRadioChange = ({ target: { value } }: RadioChangeEvent) => {
    setTempSorter((prevSorter) => ({
      ...prevSorter,
      field: value,
    }));
  };

  const handleFieldSelectChange = (value: string) => {
    setTempSorter((prevSorter) => ({
      ...prevSorter,
      field: value,
    }));
  };

  const handleOrderSelectChange = (value: "asc" | "desc") => {
    setTempSorter((prevSorter) => ({
      ...prevSorter,
      order: value,
    }));
  };

  const handleOk = () => {
    setSorters(tempSorter);
    onClose();
  };

  const [isSuccess, setIsSuccess] = useState(false);

  const handleReset = () => {
    setTempSorter(initialSorters);

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
    }, 2000);
  };

  return (
    <Drawer
      width={breakpoint.sm ? "500px" : "100%"}
      zIndex={1001}
      onClose={onClose}
      open={open}
      style={{ borderTopLeftRadius: "1rem", borderBottomLeftRadius: "1rem" }}
      closable={false}
      footer={
        <Flex align="center" justify="space-between">
          <Button
            type="primary"
            ghost
            icon={
              <AnimatePresence mode="wait">
                <motion.span
                  key={isSuccess ? "check" : "delete"}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                >
                  {isSuccess ? <CheckOutlined /> : <DeleteOutlined />}
                </motion.span>
              </AnimatePresence>
            }
            onClick={handleReset}
          >
            {t("actions.reset")}
          </Button>
          <Space>
            <Button type="default" onClick={onClose}>
              {t("actions.skip")}
            </Button>
            <Button type="primary" onClick={handleOk}>
              {t("actions.ok")}
            </Button>
          </Space>
        </Flex>
      }
    >
      <Row>
        <Col span={20}>
          <Title level={4}>{t("products.sorters.attribute")}</Title>
        </Col>
        <Col span={4} style={{ textAlign: "end" }}>
          <Button type="text" onClick={onClose} icon={<CloseOutlined />} />
        </Col>
        <Col span={16}>
          <Select
            showSearch
            className="mt-3 w-100"
            placeholder="Tìm kiếm để chọn"
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.label ?? "").includes(input)
            }
            filterSort={(optionA, optionB) =>
              (optionA?.label ?? "")
                .toLowerCase()
                .localeCompare((optionB?.label ?? "").toLowerCase())
            }
            value={tempSorter.field}
            onChange={handleFieldSelectChange}
            options={[
              {
                label: "Mới nhất",
                value: "updatedAt",
              },
              {
                label: "Bán chạy",
                value: "saleCount",
              },
            ]}
          />
        </Col>
        <Col span={8} className="text-end">
          <Select
            className="mt-3 w-75"
            optionFilterProp="children"
            onChange={handleOrderSelectChange}
            value={tempSorter.order}
            options={[
              {
                label: "Tăng dần",
                value: "asc",
              },
              {
                label: "Giảm dần",
                value: "desc",
              },
            ]}
          />
        </Col>
      </Row>
    </Drawer>
  );
};
