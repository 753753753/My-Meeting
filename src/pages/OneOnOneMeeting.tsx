import { EuiFlexGroup, EuiForm, EuiSpacer } from "@elastic/eui";
import { addDoc } from "firebase/firestore";
import moment from "moment";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import CreateMeetingButtons from "../components/FormComponents/CreateMeetingButtons";
import MeetingDateField from "../components/FormComponents/MeetingDateField";
import MeetingNameField from "../components/FormComponents/MeetingNameFIeld";
import MeetingUserField from "../components/FormComponents/MeetingUserField";
import Header from "../components/Header";
import useAuth from "../hooks/useAuth";
import useFetchUsers from "../hooks/useFetchUsers";
import { meetingsRef } from "../utils/firebaseConfig";
import { generateMeetingID } from "../utils/generateMeetingId";
import { FieldErrorType, UserType } from "../utils/types";

// Import react-toastify
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Ensure you import the CSS file

export default function OneOnOneMeeting() {
  useAuth();
  const [users] = useFetchUsers();
  const uid = useAppSelector((zoomApp) => zoomApp.auth.userInfo?.uid);
  const navigate = useNavigate();

  const [meetingName, setMeetingName] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [startDate, setStartDate] = useState(moment());
  const [showErrors, setShowErrors] = useState<{
    meetingName: FieldErrorType;
    meetingUser: FieldErrorType;
  }>({
    meetingName: { show: false, message: [] },
    meetingUser: { show: false, message: [] },
  });

  const onUserChange = (selectedOption: UserType | null) => {
    setSelectedUser(selectedOption);
  };

  const validateForm = () => {
    const showErrorsClone = { ...showErrors };
    let errors = false;

    if (!meetingName.trim()) {
      showErrorsClone.meetingName.show = true;
      showErrorsClone.meetingName.message = ["Please Enter Meeting Name"];
      errors = true;
    } else {
      showErrorsClone.meetingName.show = false;
      showErrorsClone.meetingName.message = [];
    }

    if (!selectedUser || !selectedUser.uid) {
      showErrorsClone.meetingUser.show = true;
      showErrorsClone.meetingUser.message = ["Please Select a User"];
      errors = true;
    } else {
      showErrorsClone.meetingUser.show = false;
      showErrorsClone.meetingUser.message = [];
    }

    setShowErrors(showErrorsClone);
    return errors;
  };

  const createMeeting = async () => {
    if (!validateForm()) {
      const meetingId = generateMeetingID();
      try {
        await addDoc(meetingsRef, {
          createdBy: uid,
          meetingId,
          meetingName,
          meetingType: "1-on-1",
          invitedUsers: [selectedUser?.uid],
          meetingDate: startDate.format("L"),
          maxUsers: 1,
          status: true,
        });

        toast.success("Your meeting has been successfully created!");

        // Add a slight delay before navigating
        setTimeout(() => {
          navigate("/");
        }, 3000); // Navigate after 1 second delay
      } catch (error) {
        console.error("Error creating meeting:", error);
        toast.error("There was an error creating your meeting.");
      }
    }
  };


  return (
    <div style={{ display: "flex", height: "100vh", flexDirection: "column" }}>
      <Header />
      <EuiFlexGroup justifyContent="center" alignItems="center">
        <EuiForm>
          <MeetingNameField
            label="Meeting name"
            isInvalid={showErrors.meetingName.show}
            error={showErrors.meetingName.message}
            placeholder="Meeting name"
            value={meetingName}
            setMeetingName={setMeetingName}
          />
          <EuiSpacer />
          <MeetingUserField
            label="Invite User"
            isInvalid={showErrors.meetingUser.show}
            error={showErrors.meetingUser.message}
            options={users.map((user) => ({
              label: user.name,
              value: user,
            }))}
            onChange={(option) => onUserChange(option?.value || null)}
            selectedOptions={
              selectedUser ? [{ label: selectedUser.name, value: selectedUser }] : []
            }
            singleSelection={{ asPlainText: true }}
            isClearable={false}
            placeholder="Select a User"
          />
          <EuiSpacer />
          <MeetingDateField selected={startDate} setStartDate={setStartDate} />
          <EuiSpacer />
          <CreateMeetingButtons createMeeting={createMeeting} />
        </EuiForm>
      </EuiFlexGroup>

      {/* react-toastify container to manage toast notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000} // Toast will close after 5 seconds
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}
