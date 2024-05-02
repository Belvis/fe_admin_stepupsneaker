import { getValueFromEvent } from "@refinedev/antd";
import { useTranslate } from "@refinedev/core";
import {
  App,
  Avatar,
  Form,
  FormProps,
  Input,
  Space,
  Spin,
  Typography,
  Upload,
  Image,
} from "antd";
import {
  RcFile,
  UploadChangeParam,
  UploadFile,
  UploadProps,
} from "antd/es/upload/interface";
import React, { ReactNode, useEffect, useState } from "react";
import { getBase64Image } from "../../helpers/image";
import { styles } from "./style";
import { InboxOutlined, PlusOutlined } from "@ant-design/icons";
import { LabelTooltipType } from "antd/es/form/FormItemLabel";

const { Text } = Typography;

interface IImageUploadProps {
  formProps: FormProps;
  label?: ReactNode;
  tooltip?: LabelTooltipType;
  required?: boolean;
  hidden?: boolean;
  raw?: boolean;
  disabled?: boolean;
}

const ImageUpload: React.FC<IImageUploadProps> = ({
  formProps,
  label,
  tooltip,
  required = false,
  hidden = false,
  raw = false,
  disabled,
}) => {
  const t = useTranslate();
  const { message } = App.useApp();
  const [loadingImage, setLoadingImage] = useState(false);
  const imageUrl = Form.useWatch("image", formProps.form);

  const handleChange: UploadProps["onChange"] = (
    info: UploadChangeParam<UploadFile>
  ) => {
    if (info.file.status === "uploading") {
      setLoadingImage(true);
      return;
    }
    if (info.file.status === "done") {
      getBase64Image(info.file.originFileObj as RcFile, (url) => {
        setLoadingImage(false);
        formProps.form?.setFieldValue("image", url);

        let newFileList = [...info.fileList];

        newFileList = newFileList.slice(-2);

        newFileList = newFileList.map((file) => {
          if (file.response) {
            file.url = file.response.url;
          }
          return file;
        });

        formProps.form?.setFieldValue("fileList", newFileList);
      });
    }
  };

  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error(t("image.error.invalid"));
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error(t("image.error.exceed"));
    }
    return isJpgOrPng && isLt2M;
  };

  return (
    <Spin spinning={loadingImage}>
      <Form.Item
        name="image"
        valuePropName="file"
        getValueFromEvent={getValueFromEvent}
        label={label}
        tooltip={tooltip}
        noStyle={!label}
        required={required}
        hidden={hidden}
        rules={[
          {
            required: required,
          },
        ]}
      >
        <Upload.Dragger
          name="file"
          disabled={disabled}
          beforeUpload={beforeUpload}
          onChange={handleChange}
          showUploadList={false}
          customRequest={({ onSuccess, onError, file }) => {
            if (onSuccess) {
              try {
                onSuccess("ok");
              } catch (error) {}
            }
          }}
          maxCount={1}
          style={!raw ? styles.imageUpload : undefined}
        >
          {raw ? (
            <div>
              {imageUrl ? (
                <Image width={200} src={imageUrl} preview={false} />
              ) : (
                <>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">{t("image.dragger.text")}</p>
                  <p className="ant-upload-hint">{t("image.dragger.hint")}</p>
                </>
              )}
            </div>
          ) : (
            <Space direction="vertical" size={2}>
              {imageUrl ? (
                <Avatar
                  style={styles.avatar}
                  src={imageUrl}
                  alt="User avatar"
                />
              ) : (
                <Avatar
                  style={styles.avatar}
                  src="/images/user-default-img.png"
                  alt="Default avatar"
                />
              )}
              <Text style={styles.imageDescription}>
                {t(`image.description.${imageUrl ? "edit" : "add"}`)}
              </Text>
              <Text style={styles.imageValidation}>
                {t("image.validation", { size: 1080 })}
              </Text>
            </Space>
          )}
        </Upload.Dragger>
      </Form.Item>
      <Form.Item name="fileList" hidden>
        <Upload />
      </Form.Item>
    </Spin>
  );
};

export default ImageUpload;
