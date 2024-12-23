import {
  EuiBadge,
  EuiBasicTable,
  EuiCopy,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
} from "@elastic/eui";
import { doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { FiCopy, FiX } from "react-icons/fi"; // Use FiX for cancel icon
import { Link } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import EditFlyout from "../components/EditFlyout";
import Header from "../components/Header";
import useAuth from "../hooks/useAuth";
import { firebaseDB, meetingsRef } from "../utils/firebaseConfig";
import { MeetingType } from "../utils/types";

export default function MyMeetings() {
  useAuth();
  const userInfo = useAppSelector((zoom) => zoom.auth.userInfo);
  const [meetings, setMeetings] = useState<Array<MeetingType>>([]);
  const [showEditFlyout, setShowEditFlyout] = useState(false);
  const [editMeeting, setEditMeeting] = useState<MeetingType>();

  const getMyMeetings = useCallback(async () => {
    const firestoreQuery = query(
      meetingsRef,
      where("createdBy", "==", userInfo?.uid)
    );
    const fetchedMeetings = await getDocs(firestoreQuery);
    if (fetchedMeetings.docs.length) {
      const myMeetings: Array<MeetingType> = [];
      fetchedMeetings.forEach((meeting) => {
        myMeetings.push({
          docId: meeting.id,
          ...(meeting.data() as MeetingType),
        });
      });
      setMeetings(myMeetings);
    }
  }, [userInfo?.uid]);

  useEffect(() => {
    if (userInfo) getMyMeetings();
  }, [userInfo, getMyMeetings]);

  const openEditFlyout = (meeting: MeetingType) => {
    setShowEditFlyout(true);
    setEditMeeting(meeting);
  };

  const closeEditFlyout = (dataChanged = false) => {
    setShowEditFlyout(false);
    setEditMeeting(undefined);
    if (dataChanged) getMyMeetings();
  };

  const cancelMeeting = async (meetingId: string) => {
    // Update the status of the meeting to "Cancelled"
    const meetingDocRef = doc(firebaseDB, "meetings", meetingId);
    try {
      await updateDoc(meetingDocRef, { status: false }); // Set status to "Cancelled"
      getMyMeetings(); // Refresh the meetings list
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
      field: "",
      name: "Cancel",
      width: "5%",
      render: (meeting: MeetingType) => {
        // Check if the meeting is "Upcoming" and has a valid date
        const isUpcoming = meeting.status && moment(meeting.meetingDate).isAfter(moment().format("L"));

        return (
          <FiX
            style={{
              cursor: isUpcoming ? "pointer" : "gray", // Disable the cursor if the meeting cannot be canceled
              color: isUpcoming ? "black" : "gray", // Adjust color when it's not cancellable
            }}
            onClick={() => 
              isUpcoming && cancelMeeting(meeting.docId) // Only cancel if the meeting is upcoming
            }
          />
        );
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
      {showEditFlyout && (
        <EditFlyout closeFlyout={closeEditFlyout} meeting={editMeeting!} />
      )}
    </div>
  );
}
