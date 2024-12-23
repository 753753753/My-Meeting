import { EuiCard, EuiFlexGroup, EuiFlexItem, EuiImage } from "@elastic/eui";
import { useNavigate } from "react-router-dom";
import dashboard1 from "../assets/dashboard1.png"; // Ensure these paths are correct
import dashboard2 from "../assets/dashboard2.png"; // Ensure these paths are correct
import dashboard3 from "../assets/dashboard3.png"; // Ensure these paths are correct
import Header from "../components/Header";
import useAuth from "../hooks/useAuth";
function Dashboard() {
  useAuth();
  const navigate = useNavigate();

  return (
    <>
      <div
        style={{
          display: "flex",
          height: "100vh",
          flexDirection: "column",
        }}
      >
        <Header />
        <EuiFlexGroup
          justifyContent="center"
          alignItems="center"
          style={{ margin: "5vh 10vw" }}
        >
          <EuiFlexItem>
            <EuiCard
              icon={<EuiImage src={dashboard1} alt="Create Meeting" size="5rem" />}
              title="Create Meeting"
              description="Create a new meeting and invite people."
              onClick={() => navigate("/create")}
              paddingSize="xl"
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiCard
              icon={<EuiImage src={dashboard2} alt="My Meetings" size="100%" />}
              title="My Meetings"
              description="View your created meetings."
              onClick={() => navigate("/mymeetings")}
              paddingSize="xl"
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiCard
              icon={<EuiImage src={dashboard3} alt="Meetings" size="5rem" />}
              title="Meetings"
              description="View the meetings that you are invited to."
              onClick={() => navigate("/meetings")}
              paddingSize="xl"
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    </>
  );
}

export default Dashboard;
