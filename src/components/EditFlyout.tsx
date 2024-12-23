import { doc, updateDoc } from "firebase/firestore";
import moment from "moment";
import { useEffect, useState } from "react";
import useFetchUsers from "../hooks/useFetchUsers";
import useToast from "../hooks/useToast";
import { firebaseDB } from "../utils/firebaseConfig";
import { FieldErrorType, MeetingType, UserType } from "../utils/types";
import CreateMeetingButtons from "./FormComponents/CreateMeetingButtons";
import MeetingDateField from "./FormComponents/MeetingDateField";
import MeetingMaximumUsersField from "./FormComponents/MeetingMaximumUsersField";
import MeetingNameField from "./FormComponents/MeetingNameFIeld";
import MeetingUserField from "./FormComponents/MeetingUserField";

export default function EditFlyout({
  closeFlyout,
  meeting,
}: {
  closeFlyout: any;
  meeting: MeetingType;
}) {
  const [users] = useFetchUsers();
  const [createToast] = useToast();
  const [meetingName, setMeetingName] = useState(meeting.meetingName);
  const [meetingType] = useState(meeting.meetingType);
  const [selectedUser, setSelectedUser] = useState<Array<UserType>>([]);
  const [startDate, setStartDate] = useState(moment(meeting.meetingDate));
  const [size, setSize] = useState(1);
  const [status, setStatus] = useState(meeting.status || false);
  
  const [showErrors, setShowErrors] = useState<{
    meetingName: FieldErrorType;
    meetingUsers: FieldErrorType;
  }>({
    meetingName: {
      show: false,
      message: [],
    },
    meetingUsers: {
      show: false,
      message: [],
    },
  });

  const onUserChange = (selectedOptions: Array<UserType>) => {
    setSelectedUser(selectedOptions);
  };

  useEffect(() => {
    if (users) {
      const foundUsers: Array<UserType> = [];
      meeting.invitedUsers.forEach((user: string) => {
        const findUser = users.find(
          (tempUser: UserType) => tempUser.uid === user
        );
        if (findUser) foundUsers.push(findUser);
      });
      setSelectedUser(foundUsers);
    }
  }, [users, meeting]);

  const editMeeting = async () => {
    if (!meetingName) {
      setShowErrors({
        meetingName: { show: true, message: ["Meeting name is required"] },
        meetingUsers: { show: false, message: [] },
      });
      return;
    }

    if (selectedUser.length === 0) {
      setShowErrors({
        meetingUsers: { show: true, message: ["At least one user is required"] },
        meetingName: { show: false, message: [] },
      });
      return;
    }

    const editedMeeting = {
      ...meeting,
      meetingName,
      meetingType,
      invitedUsers: selectedUser.map((user: UserType) => user.uid),
      maxUsers: size,
      meetingDate: startDate.format("L"),
      status,
    };

    if (!editedMeeting.docId) {
      createToast({ title: "Meeting not found", type: "error" });
      return;
    }

    const docRef = doc(firebaseDB, "meetings", meeting.docId!);
    try {
      await updateDoc(docRef, editedMeeting);
      createToast({ title: "Meeting updated successfully.", type: "success" });
      closeFlyout(true);
    } catch (error) {
      createToast({ title: "Failed to update meeting.", type: "error" });
      console.error("Error updating meeting:", error);
    }
  };

  return (
    <div className="flyout" tabIndex={-1}>
      <div className="flyout-header">
        <h2>{meeting.meetingName}</h2>
      </div>
      <div className="flyout-body">
        <form>
          <MeetingNameField
            label="Meeting name"
            isInvalid={showErrors.meetingName.show}
            error={showErrors.meetingName.message}
            placeholder="Meeting name"
            value={meetingName}
            setMeetingName={setMeetingName}
          />
          {meetingType === "anyone-can-join" ? (
            <MeetingMaximumUsersField value={size} setSize={setSize} />
          ) : (
            <MeetingUserField
              label="Invite Users"
              isInvalid={showErrors.meetingUsers.show}
              error={showErrors.meetingUsers.message}
              options={users}
              onChange={onUserChange}
              selectedOptions={selectedUser}
              singleSelection={meetingType === "1-on-1" ? { asPlainText: true } : false}
              isClearable={false}
              placeholder="Select Users"
            />
          )}
          <MeetingDateField selected={startDate} setStartDate={setStartDate} />
          <div className="form-row">
            <label htmlFor="cancel-meeting">Cancel Meeting</label>
            <input
              type="checkbox"
              id="cancel-meeting"
              checked={status}
              onChange={(e) => setStatus(e.target.checked)}
            />
          </div>
          <div className="spacer" />
          <CreateMeetingButtons
            createMeeting={editMeeting}
            isEdit
            closeFlyout={closeFlyout}
          />
        </form>
      </div>
    </div>
  );
}
