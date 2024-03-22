import { useModal } from "@refinedev/antd";
import { HttpError, useOne, useTranslate } from "@refinedev/core";
import {
  List as AntdList,
  ConfigProvider,
  Timeline,
  Tooltip,
  Typography,
  theme,
} from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { IOrderAuditResponse, RevisionType } from "../../interfaces";
import ChangeDetail from "./ChangeDetail";
import { CreatedAt, TimelineContent, TimelineItem } from "./style";
import { getRandomId } from "../../helpers/random";

dayjs.extend(relativeTime);

type TimeLineProps = {
  id?: string;
  shouldRefetch: boolean;
  setShouldRefetch: Dispatch<SetStateAction<boolean>>;
};

export const TimeLine: React.FC<TimeLineProps> = ({
  id,
  shouldRefetch,
  setShouldRefetch,
}) => {
  const t = useTranslate();

  const { data, isLoading, isError, refetch } = useOne<
    IOrderAuditResponse[],
    HttpError
  >({
    resource: "orders/revisions",
    id,
  });

  useEffect(() => {
    if (shouldRefetch) {
      refetch();
      setShouldRefetch(false);
    }
  }, [shouldRefetch]);

  const audits = data?.data ?? [];

  const [selectedChanges, setSelectedChanges] = useState<{
    [key: string]: {
      oldValue: any;
      newValue: any;
    };
  }>();

  const { Text, Link } = Typography;

  const getStatusColor = (
    type: RevisionType
  ):
    | { indicatorColor: string; backgroundColor: string; text: string }
    | undefined => {
    switch (type) {
      case "DELETE":
        return {
          indicatorColor: "orange",
          backgroundColor: "#fff7e6",
          text: "delete",
        };
      case "UPDATE":
        return {
          indicatorColor: "cyan",
          backgroundColor: "#e6fffb",
          text: "update",
        };
      case "INSERT":
        return {
          indicatorColor: "green",
          backgroundColor: "#e6f7ff",
          text: "insert",
        };
      case "UNKNOWN":
        return {
          indicatorColor: "blue",
          backgroundColor: "#e6fffb",
          text: "unknown",
        };
      default:
        break;
    }
  };

  const {
    show,
    modalProps: { visible: vi, ...restProps },
    close,
  } = useModal();

  return (
    <AntdList
    // {...listProps}
    // pagination={{
    //   ...listProps.pagination,
    //   simple: true,
    //   hideOnSinglePage: true,
    // }}
    >
      <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }}>
        <Timeline>
          {audits.length > 0 &&
            audits.map(({ entity, revisionType, changes, creator, at }) => {
              return (
                <TimelineItem
                  key={entity.id}
                  color={getStatusColor(revisionType)?.indicatorColor}
                >
                  <TimelineContent
                    backgroundColor={
                      getStatusColor(revisionType)?.backgroundColor ||
                      "transparent"
                    }
                  >
                    <Tooltip
                      overlayInnerStyle={{ color: "#626262" }}
                      color="rgba(255, 255, 255, 0.3)"
                      placement="topLeft"
                      title={dayjs(at).format("lll")}
                    >
                      <CreatedAt italic>{dayjs(at).fromNow()}</CreatedAt>
                    </Tooltip>
                    <Text key={getRandomId(10)}>
                      {t(
                        `dashboard.timeline.type.${
                          getStatusColor(revisionType)?.text
                        }`
                      )}

                      {revisionType === "UPDATE" &&
                        Object.keys(changes).length > 0 && (
                          <>
                            {" "}
                            -{" "}
                            {Object.keys(changes).map(
                              (key, index, array) =>
                                key !== "versionUpdate" && (
                                  <Text key={getRandomId(10)} strong>
                                    {t(`dashboard.timeline.changes.${key}`)}
                                    {index < array.length - 1 && ", "}
                                  </Text>
                                )
                            )}
                          </>
                        )}
                    </Text>

                    <Text key={getRandomId(10)} strong>
                      Bởi: {creator}
                    </Text>
                    {changes && (
                      <Link
                        target="_blank"
                        onClick={() => {
                          setSelectedChanges(changes);
                          show();
                        }}
                      >
                        {">>"} Xem chi tiết
                      </Link>
                    )}
                  </TimelineContent>
                </TimelineItem>
              );
            })}
        </Timeline>
        <ChangeDetail
          changes={selectedChanges}
          restModalProps={restProps}
          callBack={undefined}
          close={close}
        />
      </ConfigProvider>
    </AntdList>
  );
};
