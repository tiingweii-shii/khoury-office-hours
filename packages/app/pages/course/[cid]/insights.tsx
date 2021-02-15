import React, { ReactElement, useState } from "react";
import { API } from "@koh/api-client";
import useSWR from "swr";
import { Tooltip, Card, Space, Drawer, Button, DatePicker } from "antd";
import { CardSize } from "antd/lib/card";
import { InfoCircleOutlined, MinusSquareOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import { StandardPageContainer } from "../../../components/common/PageContainer";
import { DateRangeType, InsightDisplay } from "@koh/common";
import NavBar from "../../../components/Nav/NavBar";
import BarChartComponent from "../../../components/Insights/components/BarChartComponent";
import SimpleDisplayComponent from "../../../components/Insights/components/SimpleDisplayComponent";
import InsightsDisplayOptions from "../../../components/Insights/components/InsightsDisplayOptions";

export default function Insights(): ReactElement {
  const router = useRouter();
  const { cid } = router.query;
  const { data: profile, mutate: mutateProfile } = useSWR(
    `api/v1/profile`,
    async () => API.profile.index()
  );

  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const { data: allInsights } = useSWR(`api/v1/insights/listAll`, async () =>
    API.insights.list()
  );
  const [settingsVisible, setSettingsVisible] = useState(false);

  const toggleInsightOn = async (insightName) => {
    await API.insights.toggleOn(insightName);
    mutateProfile();
  };

  const toggleInsightOff = async (insightName) => {
    await API.insights.toggleOff(insightName);
    mutateProfile();
  };

  if (!allInsights || !profile?.insights) {
    return null;
  }
  // Group users insights by size (small | default) so they can be rendered correctly
  const [smallInsights, defaultInsights] = profile.insights.reduce(
    ([smallInsights, defaultInsights], insight) =>
      allInsights[insight].size === "small"
        ? [[...smallInsights, insight], defaultInsights]
        : [smallInsights, [...defaultInsights, insight]],
    [[], []]
  );

  const { RangePicker } = DatePicker;

  return (
    <>
      <StandardPageContainer>
        <NavBar courseId={Number(cid)} />
        <h1 style={{ margin: "12px" }}>Insights Dashboard</h1>

        <div style={{ maxWidth: "200 px", marginLeft: "12px" }}>
          <b style={{ display: "inline-block", marginRight: "12px" }}>
            Date Range
          </b>
          <RangePicker
            onChange={(_, dateString) =>
              setDateRange({ start: dateString[0], end: dateString[1] })
            }
          />
        </div>

        <Drawer
          title="Display Options"
          placement="left"
          closable={true}
          destroyOnClose={true}
          onClose={() => setSettingsVisible(false)}
          visible={settingsVisible}
          width={400}
        >
          <InsightsDisplayOptions
            toggleInsightOn={toggleInsightOn}
            toggleInsightOff={toggleInsightOff}
          />
        </Drawer>

        <div style={{ display: "flex", direction: "ltr" }}>
          {smallInsights?.map((insightName: string) => {
            return (
              <RenderInsight
                key={insightName}
                insightName={insightName}
                dateRange={dateRange}
                toggleInsightOff={toggleInsightOff}
              />
            );
          })}
        </div>
        <div style={{ display: "flex", direction: "ltr" }}>
          {defaultInsights?.map((insightName: string) => {
            return (
              <RenderInsight
                key={insightName}
                insightName={insightName}
                dateRange={dateRange}
                toggleInsightOff={toggleInsightOff}
              />
            );
          })}
        </div>
        <Button
          style={{ marginLeft: "24px", width: "256px" }}
          onClick={() => setSettingsVisible(true)}
        >
          Open Insights Display Options
        </Button>
      </StandardPageContainer>
    </>
  );
}

interface RenderInsightProps {
  insightName: string;
  dateRange: DateRangeType;
  toggleInsightOff: (insightName: string) => void;
}

function RenderInsight({
  insightName,
  dateRange,
  toggleInsightOff,
}: RenderInsightProps): ReactElement {
  const router = useRouter();
  const { cid } = router.query;

  const { data: insight, error, mutate } = useSWR(
    cid &&
      `api/v1/insights/${cid}/${insightName}?start=${dateRange.start}&end=${dateRange.end}`,
    async () => await API.insights.get(Number(cid), insightName, dateRange)
  );

  if (!insight) {
    // TODO: Create loading shell
    return null;
  }

  let InsightComponent;
  switch (insight.component) {
    case InsightDisplay.SimpleDisplay:
      InsightComponent = SimpleDisplayComponent;
      break;
    case InsightDisplay.BarChart:
      InsightComponent = BarChartComponent;
      break;
    default:
      // Line below will show error if switch is not exhaustive of all enum values
      componentDoesNotExist(insight.component);
  }

  return (
    <Card
      size={insight.size as CardSize}
      title={insight.displayName}
      style={{
        margin: "8px",
        width: insight.size === "default" ? "50%" : "20%",
        maxWidth: insight.size === "default" ? "" : "200px",
      }}
      extra={
        <Space>
          <Tooltip placement="topRight" title="Hide">
            <MinusSquareOutlined
              onClick={() => toggleInsightOff(insightName)}
            />
          </Tooltip>
          <Tooltip placement="topRight" title={insight.description}>
            <InfoCircleOutlined />
          </Tooltip>
        </Space>
      }
    >
      <InsightComponent key={insight.name} {...insight} />
    </Card>
  );
}

function componentDoesNotExist(componentName: never): never {
  throw new Error(`Component ${componentName} was unable to be rendered`);
}
