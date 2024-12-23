import moment from "moment";
import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function MeetingDateField({
  selected,
  setStartDate,
}: {
  selected: moment.Moment;
  setStartDate: React.Dispatch<React.SetStateAction<moment.Moment>>;
}) {
  return (
    <div className="form-group flex items-center space-x-4">
  <label className="block font-medium text-gray-700">Set Meeting Date</label>
  <DatePicker
    selected={selected.toDate()}
    onChange={(date) => setStartDate(moment(date!))}
    className="border border-gray-300 rounded-md p-2"
    dateFormat="MM/dd/yyyy"
  />
</div>

  );
}

export default MeetingDateField;
