import { QuestionType, Role } from "@template/common";
import { Button, Row, Card, Col, Grid } from "antd";
import styled from "styled-components";
import QueueCard from "./QueueCard";
import Link from "next/link";
import { useState } from "react";
import GroupQuestions from "./GroupQuestions";
import StudentInfoCard from "./StudentInfoCard";

const { useBreakpoint } = Grid;

const StatusText = styled.div`
  font-size: 14px;
  line-height: 22px;
  font-weight: 600;
  color: #bfbfbf;
  font-variant: small-caps;
  width: 96px;
  float: right;
  margin-right: 0;
`;

const TAHeaderCard = styled(Card)`
  height: 64px;
  background: inherit;
`;

const StudentHeaderCard = styled(Card)`
  height: 64px;
  padding-left: 8px;
  padding-right: 8px;
  background: inherit;
`;

const HeaderText = styled.div`
  font-size: 14px;
  line-height: 22px;
  font-weight: 600;
  color: #bfbfbf;
  font-variant: small-caps;
`;

const QueueTitle = styled.h1`
  font-weight: 600;
  font-size: 30px;
  line-height: 38px;
  color: #262626;
`;

const CenterRow = styled(Row)`
  align-items: center;
  justify-content: space-between;
`;

const Placeholder = styled.div`
  width: 14px;
`;

const AlertButton = styled(Button)`
  margin-right: 12px;
`;

const HeaderRow = styled(Row)`
  margin-bottom: 64px;
`;

interface QueueListProps {
  role: Role;
  onOpenClick: (name: string) => void;
}

export default function QueueList({ role, onOpenClick }: QueueListProps) {
  const [helping, setHelping] = useState<boolean>(true);
  const screens = useBreakpoint();

  /**
   * Renders the card headers for a TA who is not yet helping someone.
   */
  const renderTAHeader = () => {
    return (
      <TAHeaderCard bordered={false}>
        <CenterRow justify="space-between">
          <Col xs={2} lg={1}>
            <HeaderText>#</HeaderText>
          </Col>
          <Col xs={14} sm={11} lg={5}>
            <HeaderText>name</HeaderText>
          </Col>
          <Col xs={0} lg={2}>
            <HeaderText>type</HeaderText>
          </Col>
          <Col xs={0} lg={7}>
            <HeaderText>question</HeaderText>
          </Col>
          <Col xs={0} lg={2}>
            <HeaderText>wait</HeaderText>
          </Col>
          <Col span={2}>
            <StatusText>status</StatusText>
          </Col>
          <Col>
            <Placeholder />
          </Col>
        </CenterRow>
      </TAHeaderCard>
    );
  };

  /**
   * Renders the card headers for a TA who is currently helping someone.
   */
  const renderHelpingHeader = () => {
    return (
      <TAHeaderCard bordered={false}>
        <CenterRow justify="space-between">
          <Col xs={2} lg={1}>
            <HeaderText>#</HeaderText>
          </Col>
          <Col xs={14} sm={9} lg={11} xl={9} xxl={4}>
            <HeaderText>name</HeaderText>
          </Col>
          <Col xs={0} xxl={7}>
            <HeaderText>question</HeaderText>
          </Col>
          <Col xs={0} xl={3}>
            <HeaderText>wait</HeaderText>
          </Col>
          <Col span={2}>
            <StatusText>status</StatusText>
          </Col>
          <Col>
            <Placeholder />
          </Col>
        </CenterRow>
      </TAHeaderCard>
    );
  };

  /**
   * Renders the card headers for a student viewing the queue.
   */
  const renderStudentHeader = () => {
    <StudentHeaderCard bordered={false}>
      <CenterRow justify="space-between">
        <Col span={1}>
          <HeaderText>#</HeaderText>
        </Col>
        <Col xs={16} sm={11} lg={6}>
          <HeaderText>name</HeaderText>
        </Col>
        <Col xs={0} lg={2}>
          <HeaderText>type</HeaderText>
        </Col>
        <Col span={2}>
          <HeaderText>wait</HeaderText>
        </Col>
        <Col xs={0} lg={2}>
          <StatusText>status</StatusText>
        </Col>
      </CenterRow>
    </StudentHeaderCard>;
  };

  /**
   * Renders the title and aggregate buttons for the helping column.
   */
  const renderHelpingTitle = () => {
    return (
      <Col xs={24} lg={10} xxl={6} order={screens.lg === false ? 1 : 2}>
        <HeaderRow justify="space-between">
          <QueueTitle>Helping</QueueTitle>
          <div>
            <AlertButton danger size="large">
              Alert All
            </AlertButton>
            <Button type="primary" size="large">
              Finish All
            </Button>
          </div>
        </HeaderRow>
        <StudentInfoCard />
        <GroupQuestions />
      </Col>
    );
  };

  return (
    <div>
      <Row gutter={[64, 64]}>
        <Col flex="auto" order={screens.lg === false ? 2 : 1}>
          <Row justify="space-between">
            <QueueTitle>Queue 1</QueueTitle>
            {role === "student" && (
              <Link href="/queue/join">
                <Button type="primary" size="large">
                  Join Queue
                </Button>
              </Link>
            )}
          </Row>
          {role === "ta" && !helping && renderTAHeader()}
          {role === "ta" && helping && renderHelpingHeader()}
          {role === "student" && renderStudentHeader()}

          <QueueCard
            helping={helping}
            role={role}
            rank={99}
            name="Alex Takayama"
            questionType={QuestionType.Bug}
            waitTime={30}
            status="WAITING"
            onOpen={onOpenClick}
          />
          <QueueCard
            helping={helping}
            role={role}
            rank={2}
            name="Supercalifragilistic"
            questionType={QuestionType.Concept}
            waitTime={30}
            status="WAITING"
            onOpen={onOpenClick}
          />
          <QueueCard
            helping={helping}
            role={role}
            rank={1}
            name="Stanley Liu"
            questionType={QuestionType.Setup}
            waitTime={100}
            status="IN PROGRESS"
            onOpen={onOpenClick}
          />
          <QueueCard
            helping={helping}
            role={role}
            rank={1}
            name="Alex Takayama"
            questionType={QuestionType.Other}
            waitTime={30}
            status="WAITING"
            onOpen={onOpenClick}
          />
          <QueueCard
            helping={helping}
            role={role}
            rank={1}
            name="Alex Takayama"
            questionType={QuestionType.Testing}
            waitTime={30}
            status="WAITING"
            onOpen={onOpenClick}
          />
        </Col>
        {role === "ta" && helping && renderHelpingTitle()}
      </Row>
    </div>
  );
}
