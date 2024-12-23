import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import axios from "axios";
import { Document, Packer, Paragraph } from "docx";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, getDocs, query, where } from "firebase/firestore";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useToast from "../hooks/useToast";
import { firebaseAuth, meetingsRef, notesRef } from "../utils/firebaseConfig";
import { generateMeetingID } from "../utils/generateMeetingId";

export default function JoinMeeting() {
  const params = useParams(); // Access URL parameters
  const navigate = useNavigate(); // Navigation hook
  const [createToast] = useToast(); // Custom toast hook for notifications
  const [isAllowed, setIsAllowed] = useState(false); // Meeting access state
  const [user, setUser] = useState<any>(undefined); // Current user data
  const [userLoaded, setUserLoaded] = useState(false); // User loading state

  // Speech recognition state
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null); // Reference to SpeechRecognition
  const [isRecording, setIsRecording] = useState(false); // Recording state

  // Monitor authentication state
  useEffect(() => {
    onAuthStateChanged(firebaseAuth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      }
      setUserLoaded(true);
    });
  }, []);

  // Initialize Web Speech API for transcription
  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setTranscript((prev) => prev + event.results[i][0].transcript + " ");
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
      };

      recognitionRef.current = recognition;
    } else {
      createToast("Speech Recognition is not supported in this browser.", "error");
    }
  }, [createToast]);

  // Fetch meeting data and determine if the user is allowed to join
  useEffect(() => {
    const getMeetingData = async () => {
      if (params.id && userLoaded) {
        const firestoreQuery = query(meetingsRef, where("meetingId", "==", params.id));
        const fetchedMeetings = await getDocs(firestoreQuery);

        if (fetchedMeetings.docs.length) {
          const meeting = fetchedMeetings.docs[0].data();
          const isCreator = meeting.createdBy === user?.uid;

          if (meeting.meetingType === "1-on-1") {
            if (meeting.invitedUsers[0] === user?.uid || isCreator) {
              if (meeting.meetingDate === moment().format("L")) {
                setIsAllowed(true);
              } else {
                navigate(user ? "/" : "/login");
              }
            } else {
              navigate(user ? "/" : "/login");
            }
          } else if (meeting.meetingType === "video-conference") {
            const isInvited = meeting.invitedUsers.includes(user?.uid) || isCreator;
            if (isInvited) {
              if (meeting.meetingDate === moment().format("L")) {
                setIsAllowed(true);
              } else {
                navigate(user ? "/" : "/login");
              }
            } else {
              navigate(user ? "/" : "/login");
            }
          } else {
            setIsAllowed(true);
          }
        }
      }
    };

    getMeetingData();
  }, [params.id, user, userLoaded, navigate]);
  

  // Downloading Summarise Data ....
  const downloadSummarizedDataDocx = async (summarizedData: string) => {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: "Summarized Meeting Notes",
              heading: "Heading1",
            }),
            new Paragraph(summarizedData),
          ],
        },
      ],
    });
  
    // Generate the document
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
  
    const link = document.createElement("a");
    link.href = url;
    link.download = `Summarized_Meeting_${params.id}.docx`; // File name
    document.body.appendChild(link);
    link.click();
  
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  // Summarize data and provide download option
  const summarizeData = async (meetingId: string) => {
    try {
      // Fetch and summarize transcripts (as before)
      const firestoreQuery = query(notesRef, where("meetingId", "==", meetingId));
      const fetchedNotes = await getDocs(firestoreQuery);
  
      if (!fetchedNotes.empty) {
        let combinedTranscript = "";
        fetchedNotes.forEach((doc) => {
          combinedTranscript += doc.data().transcript + " ";
        });
  
        const cohereApiKey = "h9pG72HmmT531kc4wOiLedg95jSKF3yn7jFtrmzf"; // Replace with Cohere API key
  
        // Check if combinedTranscript is long enough for summarization
        if (combinedTranscript.trim().length >= 250) {
          const response = await axios.post(
            "https://api.cohere.ai/summarize",
            {
              text: combinedTranscript.trim(),
              length: "medium",  // Adjust based on Cohere's expected values
            },
            {
              headers: {
                Authorization: `Bearer ${cohereApiKey}`,
              },
            }
          );
  
          if (response.data && response.data.summary) {
            const summarizedData = response.data.summary;
            console.log("Summarized Data:", summarizedData);
  
            // Download summarized data
            downloadSummarizedDataDocx(summarizedData);
          } else {
            console.log("No summary returned from the API.");
          }
        } else {
          console.log("Transcript is too short to summarize.");
        }
      } else {
        console.log("No transcripts found for this meeting.");
      }
    } catch (error) {
      console.error("Error summarizing data:", error.response ? error.response.data : error.message);
    }
  };
  

  // Start speech recognition
  const startRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  // Stop speech recognition and save transcript
  const stopRecording = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);

      if (transcript.trim() && params.id) {
        await addDoc(notesRef, {
          meetingId: params.id,
          userId: user?.uid,
          transcript: transcript.trim(),
          timestamp: new Date(),
        });

        // Summarize the transcripts after saving
        summarizeData(params.id);
      }
    }
  };


  // ZegoCloud App ID and server secret
  const appId = 630642950;
  const serverSecret = "220b631681ff671f6b9842fb9a999814";

  // Initialize ZegoUIKitPrebuilt meeting
  const myMeeting = async (element: any) => {
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appId,
      serverSecret,
      params.id as string,
      user?.uid || generateMeetingID(),
      user?.displayName || generateMeetingID()
    );

    const zp = ZegoUIKitPrebuilt.create(kitToken);

    zp.joinRoom({
      container: element,
      maxUsers: 50,
      sharedLinks: [
        {
          name: "Personal link",
          url: `${window.location.origin}/meeting/${params.id}`,
        },
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.VideoConference,
      },
    });
  };

  return isAllowed ? (
    <div
      style={{
        display: "flex",
        height: "100vh",
        flexDirection: "column",
      }}
    >
      {/* Meeting Container */}
      <div
        className="myCallContainer"
        ref={myMeeting}
        style={{ width: "100%", height: "100vh" }}
      ></div>

      {/* Recording Buttons */}
      <div style={{ position: "fixed", bottom: "10px", right: "10px" }}>
        {isRecording ? (
          <button
            onClick={stopRecording}
            style={{ padding: "10px", backgroundColor: "red", color: "white" }}
          >
            Stop Recording
          </button>
        ) : (
          <button
            onClick={startRecording}
            style={{ padding: "10px", backgroundColor: "green", color: "white" }}
          >
            Start Recording
          </button>
        )}
      </div>
    </div>
  ) : (
    <></>
  );
}

