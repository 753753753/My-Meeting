import {
  EuiBadge,
  EuiBasicTable,
  EuiCopy,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel
} from "@elastic/eui";
import { doc, getDocs, query, updateDoc } from "firebase/firestore";
import moment from "moment";
import { useEffect, useState } from "react";
import { FiCopy } from "react-icons/fi"; // Cancel icon
import { Link } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import Header from "../components/Header";
import useAuth from "../hooks/useAuth";
import { firebaseDB, meetingsRef } from "../utils/firebaseConfig";
import { MeetingType } from "../utils/types";

export default function Meeting() {
  useAuth();
  const userInfo = useAppSelector((zoom) => zoom.auth.userInfo);
  const [meetings, setMeetings] = useState<Array<MeetingType>>([]);

  // Function to get meetings and filter based on userInfo or meetingType
  useEffect(() => {
    const getMyMeetings = async () => {
      const firestoreQuery = query(meetingsRef);
      const fetchedMeetings = await getDocs(firestoreQuery);
      if (fetchedMeetings.docs.length) {
        const myMeetings: Array<MeetingType> = [];
        fetchedMeetings.forEach((meeting) => {
          const data = meeting.data() as MeetingType;
          if (data.createdBy === userInfo?.uid)
            myMeetings.push(meeting.data() as MeetingType);
          else if (data.meetingType === "anyone-can-join")
            myMeetings.push(meeting.data() as MeetingType);
          else {
            const index = data.invitedUsers.findIndex(
              (user: string) => user === userInfo?.uid
            );
            if (index !== -1) {
              myMeetings.push(meeting.data() as MeetingType);
            }
          }
        });

        setMeetings(myMeetings);
      }
    };
    if (userInfo) getMyMeetings();
  }, [userInfo]);

  // Function to cancel a meeting
  const cancelMeeting = async (meetingId: string) => {
    const meetingDocRef = doc(firebaseDB, "meetings", meetingId);
    try {
      await updateDoc(meetingDocRef, { status: false }); // Update the status to "Cancelled"
      getMyMeetings(); // Refresh the meetings list after cancellation
    } catch (error) {
      console.error("Error canceling meeting:", error);
    }
  };

  const meetingColumns = [
    {
      field: "meetingName",
      name: "Meeting Name",
    },
    {
      field: "meetingType",
      name: "Meeting Type",
    },
    {
      field: "meetingDate",
      name: "Meeting Date",
    },
    {
      field: "",
      name: "Status",
      render: (meeting: MeetingType) => {
        if (meeting.status) {
          if (meeting.meetingDate === moment().format("L")) {
            return (
              <EuiBadge color="success">
                <Link
                  to={`/join/${meeting.meetingId}`}
                  style={{ color: "black" }}
                >
                  Join Now
                </Link>
              </EuiBadge>
            );
          } else if (
            moment(meeting.meetingDate).isBefore(moment().format("L"))
          ) {
            return <EuiBadge color="default">Ended</EuiBadge>;
          } else if (moment(meeting.meetingDate).isAfter()) {
            return <EuiBadge color="primary">Upcoming</EuiBadge>;
          }
        } else return <EuiBadge color="danger">Cancelled</EuiBadge>;
      },
    },
    {
      field: "meetingId",
      name: "Copy Link",
      width: "5%",
      render: (meetingId: string) => {
        const host = import.meta.env.VITE_APP_HOST || "https://default-host.com";
        return (
          <EuiCopy textToCopy={`${host}/join/${meetingId}`}>
            {(copy: any) => (
              <FiCopy
                style={{ cursor: "pointer" }}
                onClick={copy}
              />
            )}
          </EuiCopy>
        );
      },
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        flexDirection: "column",
      }}
    >
      <Header />
      <EuiFlexGroup justifyContent="center" style={{ margin: "1rem" }}>
        <EuiFlexItem>
          <EuiPanel>
            <EuiBasicTable items={meetings} columns={meetingColumns} />
          </EuiPanel>
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  );
}
