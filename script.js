init = ZOHO.CREATOR.DATA;
let StartDate = "25-Jun-2025 06:00";
let EndDate = "25-Jun-2025 23:59";
let Category = "";
let userRole = "";
let userID = "";
let userList = "";
async function getUser() {
  const config = {
    report_name: "Users_Widget",
    criteria: `Status =="Active"&&User_Type == "Internal"`
  };
  try {
    const getUser = await init.getRecords(config);
    console.log(getUser);
    userList = getUser.data;
    let getSelection = document.getElementById("allUser");
    for (const user of userList) {
      const option = document.createElement("option");
      option.setAttribute("userID", user.ID);
      option.setAttribute("userCompany", user.Company.ID);
      option.setAttribute("userPhone", user.Phone_Number);
      option.textContent = `${user.Employee_ID}-${user.Name}`;
      if (user.ID === userID) {
        option.selected = true;
      }
      getSelection.appendChild(option);
    }


  } catch (error) {

  }
}
async function roomCategory() {
  showLoader();
  try {
    const getParam = await ZOHO.CREATOR.UTIL.getQueryParams();
    console.log(getParam);

    StartDate = getParam.StartDate;
    EndDate = getParam.EndDate;
    Category = getParam.category;
    userRole = getParam.role;
    userID = getParam.userLogID;
    getUser();
    const config = {
      report_name: "Room_Category_Widget",
      criteria: `${Category == "null" ? "ID!=null" : "ID==" + Category}`
    };

    let roomContainer = document.getElementById("roomDetails");
    const getCategory = await init.getRecords(config);

    let cateTitle = ``;

    for (const category of getCategory.data) {
      cateTitle += `<div class="category-row">${category.Room_Category}</div>`;
      let roomList = await getRooms(category.ID);
      cateTitle += roomList;
    }

    cateTitle += `<div class="timeline" style="left:0;"><div class="jsCurrentTime"></div></div>`;
    roomContainer.innerHTML = cateTitle;
    initializeSlotSelection();
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
  } catch (e) {
    console.log(e);
  }
  hideLoader();
}
roomCategory();

async function getRooms(cateID) {
  const config = {
    report_name: "Room",
    criteria: `Room_Category==${cateID}`
  };
  try {
    const getRoom = await init.getRecords(config);
    let roomList = ``;

    for (const room of getRoom.data) {
      const bookingsByRoom = await getBookings(room.ID);

      roomList += `
  <div class="room-row" data-room="${room.ID}" data-roomName="${room.Room_Name}" data-category="${room.Room_Category.ID},${room.Room_Category.zc_display_value}" data-capacity="${room.Capacity}" data-floor="${room.Floor.zc_display_value}">
    <div class="room-label">${room.Room_Name}</div>
    <div class="time-blocks" data-room-id="${room.ID}">
        <div class="time-cell">${slotDetails(bookingsByRoom, 6, 7.59)}</div>
        <div class="time-cell">${slotDetails(bookingsByRoom, 8, 9.59)}</div>
        <div class="time-cell">${slotDetails(bookingsByRoom, 10, 11.59)}</div>
        <div class="time-cell">${slotDetails(bookingsByRoom, 12, 13.59)}</div>
        <div class="time-cell">${slotDetails(bookingsByRoom, 14, 15.59)}</div>
        <div class="time-cell">${slotDetails(bookingsByRoom, 16, 17.59)}</div>
        <div class="time-cell">${slotDetails(bookingsByRoom, 18, 19.59)}</div>
        <div class="time-cell">${slotDetails(bookingsByRoom, 20, 21.59)}</div>
        <div class="time-cell">${slotDetails(bookingsByRoom, 22, 23.59)}</div>
    </div>
  </div>`;
    }
    // Wait for DOM rendering before attaching hover behavior
    setTimeout(setupHoverPopups, 100);
    return roomList;
  } catch (e) {
    console.log(e);
  }
}

function slotDetails(data, start_time, end_time) {
  if (data != null) {
    let slotBooking = ``;
    for (const slot_Data of data.data) {
      let get_Start_Date = slot_Data.Start_Time;
      let get_End_Date = slot_Data.End_Time;
      let date = new Date(get_Start_Date);
      let date1 = new Date(get_End_Date);
      let hours = date.getHours();
      let minutes = date.getMinutes();
      let hours1 = date1.getHours();
      let minutes1 = date1.getMinutes();
      let toNumber = parseFloat(`${hours}.${minutes}`);

      let options = {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      };
      let formatted = date.toLocaleString("en-US", options);
      let requestedFor = slot_Data["Reservation_ID.Requested_For"];

      let leftValue = (hours - start_time) * 60 + minutes;
      let LeftValue_V2 = leftValue / 120 * 100;
      let RightValue = (hours1 - start_time) * 60 + minutes1;
      let rightValue_V2 = RightValue / 120 * 100;

      if (toNumber >= start_time && toNumber <= end_time) {
        console.log("slot_Data == ", slot_Data);

        slotBooking += `
        <div class="booking booking_${slot_Data.Booking_ID}" start_Time="${hours}.${minutes}" end_Time="${hours1}.${minutes1}" style="left:${LeftValue_V2}%;width:${rightValue_V2 - LeftValue_V2}%;"><div>
            <div class="name">${slot_Data["Reservation_ID.Purpose"]}</div>
            <div class="time"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path d="M4 10.6471V12.5882V17.8235C4 19.6235 5.12 21 6.58462 21H17.4154C18.88 21 20 19.6235 20 17.8235V11.9412V10"
                  stroke="black" />
                <path d="M20 10.375V8C20 6.89543 19.1046 6 18 6H6.00002C4.89544 6 4.00001 6.89544 4.00002 8.00002L4.00005 11"
                  stroke="black" />
                <path d="M8 4V7" stroke="black" stroke-linecap="round" />
                <path d="M16 4V7" stroke="black" stroke-linecap="round" />
                <path d="M6 10H18" stroke="black" stroke-linecap="round" />
              </svg>
              <div></div>${formatted}
            </div>
          </div>
          <div style="position: relative;">
          <div class="svg-wrapper">
            <svg width="6" height="24" viewBox="0 0 6 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="3" cy="6" r="1" stroke="black"/>
            <circle cx="3" cy="12" r="1" stroke="black"/>
            <circle cx="3" cy="18" r="1" stroke="black"/>
            </svg>
            <div class="jsPopup">
              <strong>Requested for:</strong>${requestedFor.zc_display_value}<br>
              <strong>Purpose:</strong> ${slot_Data["Reservation_ID.Purpose"]}<br>
              <strong>No. of Participants:</strong> ${slot_Data["Reservation_ID.Number_Of_participants"]}
            </div>
          </div>
        </div></div>
        <div class="jsPopup jsPopup_${slot_Data.Booking_ID}">
          <strong>Requested for:</strong>${requestedFor.zc_display_value}<br>
          <strong>Purpose:</strong> ${slot_Data["Reservation_ID.Purpose"]}<br>
          <strong>No. of Participants:</strong> ${slot_Data["Reservation_ID.Number_Of_participants"]}
        </div>
        `;


      }
    }
    return slotBooking;
  } else {
    return "";
  }
}

function setupHoverPopups() {
  document.querySelectorAll(".booking").forEach(wrapper => {
    const popup = wrapper.querySelector(".jsPopup");
    if (!popup) return;

    wrapper.addEventListener("mouseenter", () => {
      popup.style.display = "block";
    });

    wrapper.addEventListener("mouseleave", () => {
      popup.style.display = "none";
    });
  });
}
function updateCurrentTime() {
  const timelineEl = document.querySelector(".timeline");
  const timeTextEl = document.querySelector(".jsCurrentTime");

  if (!timelineEl || !timeTextEl) return;

  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  const startHour = 6;
  const endHour = 22;
  const totalMinutes = (endHour - startHour) * 60;
  const currentMinutes = (hours - startHour) * 60 + minutes;

  const clampedMinutes = Math.max(0, Math.min(currentMinutes, totalMinutes));
  const percent = clampedMinutes / totalMinutes;
  timelineEl.style.left = `calc(${percent * 100}% + 80px)`;
  timeTextEl.textContent = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

async function getBookings(room) {
  const config = {
    report_name: "Room_Widget",
    criteria: `(Booking_Status == "Upcoming Booking"&&Reservation_ID.Room==${room} && (
      (Start_Time >= "${StartDate}" && Start_Time <= "${EndDate}") || 
      (End_Time >= "${StartDate}" && End_Time <= "${EndDate}") || 
      (Start_Time <= "${StartDate}" && End_Time >= "${EndDate}")
    ))`
  };

  try {
    const booking = await init.getRecords(config);
    return booking;
  } catch (error) {
    console.log("Error fetching bookings:", error);
  }
}

function initializeSlotSelection() {
  // showLoader();
  const totalHours = 18;
  const totalMinutes = totalHours * 60;
  const snapMinutes = 15;

  const selectedDate = new Date(StartDate);
  const now = new Date();
  const isToday = selectedDate.toDateString() === now.toDateString();
  const currentMinutes = (now.getHours() - 6) * 60 + now.getMinutes();

  const bookingsMap = {};
  document.querySelectorAll('.room-row').forEach(row => {
    const roomId = row.getAttribute('data-room');
    bookingsMap[roomId] = [];

    row.querySelectorAll('.booking').forEach(booking => {
      const [SRawHour, SRawMin] = booking.getAttribute("start_time").split(".");
      const [ERawHour, ERawMin] = booking.getAttribute("end_time").split(".");

      const SHour = parseFloat(SRawHour);
      const SMin = parseFloat(SRawMin);
      const EHour = parseFloat(ERawHour);
      const EMin = parseFloat(ERawMin);


      let startMin = (SHour - 6) * 60 + SMin;
      let endMin = (EHour - 6) * 60 + EMin;
      bookingsMap[roomId].push([startMin, endMin]);
    });
  });

  function formatTime(mins) {
    const h = Math.floor(mins / 60) + 6;
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  function getSnappedMinutes(x, container) {
    const rect = container.getBoundingClientRect();
    const offsetX = x - rect.left;
    const percent = offsetX / rect.width;
    const raw = percent * totalMinutes;
    return Math.min(totalMinutes, Math.max(0, Math.round(raw / snapMinutes) * snapMinutes));
  }

  let isDragging = false;
  let startX = 0;
  let selectedRoom = null;
  let currentSelection = null;
  let currentContainer = null;

  document.querySelectorAll('.time-blocks').forEach(timeBlocks => {
    const roomId = timeBlocks.closest('.room-row').getAttribute('data-room');
    const roomName = timeBlocks.closest('.room-row').getAttribute('data-roomName');
    const [roomCatID, roomCategory] = timeBlocks.closest('.room-row').getAttribute('data-category').split(",");
    const roomCapacity = timeBlocks.closest('.room-row').getAttribute('data-capacity');
    const roomFloor = timeBlocks.closest('.room-row').getAttribute('data-floor');
    timeBlocks.addEventListener('mousedown', (e) => {
      const minutes = getSnappedMinutes(e.clientX, timeBlocks);
      if (isToday && minutes < currentMinutes) {
        alert("You cannot select past time slots.");
        return;
      }

      isDragging = true;
      startX = e.clientX;
      selectedRoom = roomId;
      currentContainer = timeBlocks;

      document.querySelectorAll('.selection').forEach(sel => sel.remove());

      const left = (minutes / totalMinutes) * timeBlocks.clientWidth;

      currentSelection = document.createElement('div');
      currentSelection.className = 'selection';
      currentSelection.style.left = `${left}px`;
      currentSelection.style.width = `0px`;
      timeBlocks.appendChild(currentSelection);

      function onMouseMove(eMove) {
        if (!isDragging || !currentSelection) return;
        const start = getSnappedMinutes(startX, timeBlocks);
        const end = getSnappedMinutes(eMove.clientX, timeBlocks);

        let leftMin = Math.min(start, end);
        let rightMin = Math.max(start, end);
        let widthMin = rightMin - leftMin;

        if (isToday && leftMin < currentMinutes) {
          leftMin = currentMinutes;
          widthMin = Math.max(0, rightMin - leftMin);
        }

        const pxLeft = (leftMin / totalMinutes) * timeBlocks.clientWidth;
        const pxWidth = (widthMin / totalMinutes) * timeBlocks.clientWidth;

        currentSelection.style.left = `${pxLeft}px`;
        currentSelection.style.width = `${pxWidth}px`;
      }

      function onMouseUp() {
        if (!isDragging || !currentSelection) return;
        isDragging = false;

        const left = parseFloat(currentSelection.style.left);
        let width = parseFloat(currentSelection.style.width);

        const minWidth = (15 / totalMinutes) * currentContainer.clientWidth;
        if (width < minWidth) {
          width = minWidth;
          currentSelection.style.width = `${minWidth}px`;
        }

        const startMin = (left / currentContainer.clientWidth) * totalMinutes;
        const endMin = startMin + (width / currentContainer.clientWidth) * totalMinutes;

        const selectedBookings = bookingsMap[selectedRoom] || [];
        const isOverlapping = selectedBookings.some(([bookedStart, bookedEnd]) => {
          return startMin < bookedEnd && endMin > bookedStart;
        });


        if (isOverlapping) {
          alert("You cannot select a time slot that overlaps with an existing booking.");
          currentSelection.remove();
        } else {
          const formattedStart = formatTime(Math.floor(startMin));
          const formattedEnd = formatTime(Math.floor(endMin));
          showBookingModal(StartDate, formattedStart, formattedEnd, roomId, roomName, roomCatID, roomCategory, roomCapacity, roomFloor);
        }

        currentSelection = null;
        currentContainer = null;

        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      }

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  });
  // hideLoader();
}
function formatDateString(dateStr) {
  const [day, monthAbbr, yearAndTime] = dateStr.split('-');
  const [year, time] = yearAndTime.split(' ');
  const dateObj = new Date(`${monthAbbr} ${day}, ${year} ${time}`);

  if (isNaN(dateObj)) {
    console.error("Invalid date format");
    return "";
  }
  // Format into YYYY-MM-DD
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const dd = String(dateObj.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
function showBookingModal(startDate, startTime, endTime, roomId, roomName, roomCatID, roomCategory, roomCapacity, roomFloor) {
  let filterDate = formatDateString(startDate);
  let endfilterDate = formatDateString(EndDate);
  document.getElementById('modalOverlay').style.display = 'block';
  document.getElementById('bookingModal').style.display = 'block';
  document.getElementById('bookPurpose').value = "";
  document.getElementById('bookingCapacity').value = null;
  document.getElementById('booking-date').value = filterDate;
  document.getElementById('booking-EndDate').value = endfilterDate;
  document.getElementById('booking-start').value = startTime;
  document.getElementById('booking-end').value = endTime;
  document.getElementById('bookingCategory').innerHTML = roomCategory;
  document.getElementById('bookingRoom').innerHTML = roomName;
  document.getElementById('bookingMaxCap').innerHTML = roomCapacity;
  document.getElementById('bookingFloor').innerHTML = roomFloor;
  document.getElementById('bookingCategory').setAttribute("catID", roomCatID);
  document.getElementById('bookingRoom').setAttribute("roomId", roomId);
}

function closeBookingModal() {

  document.getElementById('modalOverlay').style.display = 'none';
  document.getElementById('bookingModal').style.display = 'none';
  roomCategory();

}

function formValidate() {
  showLoader();
  console.log("show loader");
  const fromTime = document.getElementById('booking-start').value;
  const toTime = document.getElementById('booking-end').value;
  const bookCatEl = document.getElementById('bookingCategory');
  const bookRoomEl = document.getElementById('bookingRoom');
  const bookPurpose = document.getElementById('bookPurpose').value.trim();
  const bookParticipant = document.getElementById('bookingCapacity').value;
  const bookUser = document.getElementById('allUser');
  const selectedOption = bookUser.options[bookUser.selectedIndex];
  const selectedUserID = selectedOption ? selectedOption.getAttribute("userID") : null;
  const selectedUsercompany = selectedOption ? selectedOption.getAttribute("userCompany") : null;
  const selectedUserphone = selectedOption ? selectedOption.getAttribute("userPhone") : null;

  // Validate each field
  if (!fromTime) {
    alert("Please select a valid Start Time.");
    hideLoader();
    return false;
  }

  if (!toTime) {
    alert("Please select a valid End Time.");
    hideLoader();
    return false;
  }

  const bookCatID = bookCatEl ? bookCatEl.getAttribute("catID") : null;
  if (!bookCatID) {
    alert("Booking Category is missing.");
    hideLoader();
    return false;
  }

  const bookRoomID = bookRoomEl ? bookRoomEl.getAttribute("roomID") : null;
  if (!bookRoomID) {
    alert("Booking Room is missing.");
    hideLoader();
    return false;
  }

  if (!bookPurpose) {
    alert("Please enter the purpose of booking.");
    hideLoader();
    return false;
  }

  if (!bookParticipant || isNaN(bookParticipant) || parseInt(bookParticipant) <= 0) {
    alert("Please enter a valid number of participants.");
    hideLoader();
    return false;
  }

  if (!selectedUserID) {
    alert("Please select a user.");
    hideLoader();
    return false;
  }
  const bookingData = new Map();
  bookingData.set("Reservation_Type", "Room");
  bookingData.set("Requested_By", userID);
  bookingData.set("Reserving_for_Someone_else", userID == selectedUserID ? false : true);
  bookingData.set("Requested_For", selectedUserID);
  bookingData.set("Company", selectedUsercompany);
  bookingData.set("Telephone", selectedUsercompany);
  bookingData.set("Start_Time", formatDateToDayMonYear(StartDate) + " " + fromTime + ":00");
  bookingData.set("End_Time", formatDateToDayMonYear(EndDate) + " " + toTime + ":00");
  bookingData.set("Room_Category", bookCatID);
  bookingData.set("Room", bookRoomID);
  bookingData.set("Purpose", bookPurpose);
  bookingData.set("Number_Of_participants", bookParticipant);
  bookingData.set("Reservation_Status", "Pending Approval");
  const bookingObject = Object.fromEntries(bookingData);
  addReservation(bookingObject);
  console.log("hide loader");

  // setTimeout(() => {

  // }, 10000);
}

async function addReservation(booking) {
  console.log("add rec show loader");
  const config = {
    form_name: "Reservation_Form",
    payload: {
      "data": booking
    }
  };
  console.log(config);

  try {
    const addRec = await init.addRecords(config);
    console.log(addRec);
    if (addRec.code == 3001) {
      alert(addRec.error[0].alert_message[0]);
      closeBookingModal();
    }
    else {
      closeBookingModal();
    }
  } catch (error) {
    console.log(error);
  }
}
function formatDateToDayMonYear(dateStr) {
  const dateObj = new Date(dateStr);

  if (isNaN(dateObj)) {
    console.error("Invalid date format");
    return "";
  }

  const day = String(dateObj.getDate()).padStart(2, '0');
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[dateObj.getMonth()];
  const year = dateObj.getFullYear();

  return `${day}-${month}-${year}`;
}
function showLoader() {
  document.getElementById("loader").style.display = "flex";
}

function hideLoader() {
  document.getElementById("loader").style.display = "none";
}

// function validFromTime(event) {
//   console.log(event.target.value);

//   const getStartDate = new Date(document.getElementById("booking-date").value + " " + event.target.value + ":00");
//   const initStart_Date = new Date();
//   if (initStart_Date > getStartDate) {
//     alert("");
//   }
// }
function validFromTime(event) {
  const timeValue = event.target.value;
  const dateValue = document.getElementById("booking-date").value;
  const endDateInput = document.getElementById("booking-EndDate");
  const endTimeInput = document.getElementById("booking-end");

  if (!timeValue || !dateValue) {
    alert("Please select both start date and time.");
    return;
  }

  let startDateTime = new Date(`${dateValue}T${timeValue}`);
  const now = new Date();

  if (isNaN(startDateTime.getTime())) {
    alert("Invalid start date or time.");
    return;
  }

  if (startDateTime < now) {
    startDateTime = new Date(now.getTime() + 15 * 60 * 1000);
    document.getElementById("booking-start").value = startDateTime.toTimeString().slice(0, 5);
    document.getElementById("booking-date").value = startDateTime.toISOString().slice(0, 10);
    alert("Start time was in the past. Adjusted to current time + 15 minutes.");
  }

  const endDateValue = endDateInput.value;
  const endTimeValue = endTimeInput.value;

  if (endDateValue && endTimeValue) {
    let endDateTime = new Date(`${endDateValue}T${endTimeValue}`);
    if (!isNaN(endDateTime.getTime())) {
      let diffMinutes = (endDateTime - startDateTime) / (1000 * 60);

      if (diffMinutes < 15) {
        const newEnd = new Date(startDateTime.getTime() + 15 * 60 * 1000);
        endDateInput.value = newEnd.toISOString().slice(0, 10);
        endTimeInput.value = newEnd.toTimeString().slice(0, 5);
        alert("Minimum booking duration is 15 minutes. End time has been adjusted.");
        diffMinutes = 15;
      }

      // 48-hour limit
      const maxMinutes = 48 * 60;
      if (diffMinutes > maxMinutes) {
        const maxEnd = new Date(startDateTime.getTime() + maxMinutes * 60 * 1000);
        endDateInput.value = maxEnd.toISOString().slice(0, 10);
        endTimeInput.value = maxEnd.toTimeString().slice(0, 5);
        alert("Maximum booking duration is 48 hours. End time has been adjusted.");
      }
    }
  }
  validBooking("FromTime");
}
function validToTime() {
  const toTimeInput = document.getElementById("booking-end");
  const toDateInput = document.getElementById("booking-EndDate");
  const fromTimeInput = document.getElementById("booking-start");
  const fromDateInput = document.getElementById("booking-date");

  const toDateValue = toDateInput.value;
  const fromDateValue = fromDateInput.value;
  const toTimeValue = toTimeInput.value;
  const fromTimeValue = fromTimeInput.value;

  if (!toDateValue || !fromDateValue || !toTimeValue || !fromTimeValue) {
    alert("Please select both start and end date & time.");
    return;
  }

  const startDateTime = new Date(`${fromDateValue}T${fromTimeValue}`);
  let endDateTime = new Date(`${toDateValue}T${toTimeValue}`);
  const now = new Date();

  if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
    alert("Invalid date or time format.");
    return;
  }

  // Case 1: End time in the past
  // if (endDateTime < now) {
  //   const newEnd = new Date(now.getTime() + 15 * 60 * 1000);
  //   toDateInput.value = newEnd.toISOString().slice(0, 10);
  //   toTimeInput.value = newEnd.toTimeString().slice(0, 5);
  //   alert("End time was in the past. Adjusted to current time + 15 minutes.");
  //   return;
  // }

  let diffMinutes = (endDateTime - startDateTime) / (1000 * 60);

  // Case 2: End before start
  if (diffMinutes < 0) {
    const newEnd = new Date(startDateTime.getTime() + 15 * 60 * 1000);
    toDateInput.value = newEnd.toISOString().slice(0, 10);
    toTimeInput.value = newEnd.toTimeString().slice(0, 5);
    alert("End time must be after start time. It has been adjusted to 15 minutes after start.");
    // return;
  }

  // Case 3: Duration < 15 minutes
  else if (diffMinutes < 15) {
    const newEnd = new Date(startDateTime.getTime() + 15 * 60 * 1000);
    toDateInput.value = newEnd.toISOString().slice(0, 10);
    toTimeInput.value = newEnd.toTimeString().slice(0, 5);
    alert("Minimum booking duration is 15 minutes. End time has been adjusted.");
    diffMinutes = 15;
  }

  // Case 4: Duration > 48 hours
  const maxMinutes = 48 * 60;
  if (diffMinutes > maxMinutes) {
    const newEnd = new Date(startDateTime.getTime() + maxMinutes * 60 * 1000);
    toDateInput.value = newEnd.toISOString().slice(0, 10);
    toTimeInput.value = newEnd.toTimeString().slice(0, 5);
    alert("Maximum booking duration is 48 hours. End time has been adjusted.");
  }
  validBooking("ToTime");
}
async function validBooking(type) {
  const toTimeInput = document.getElementById("booking-end");
  const toDateInput = document.getElementById("booking-EndDate");
  const fromTimeInput = document.getElementById("booking-start");
  const fromDateInput = document.getElementById("booking-date");
  const roomID = document.getElementById("bookingRoom").getAttribute("roomid");

  const toDateValue = toDateInput.value;
  const fromDateValue = fromDateInput.value;
  const toTimeValue = toTimeInput.value;
  const fromTimeValue = fromTimeInput.value;

  const startDate = formatDateTime(fromDateValue, fromTimeValue);
  const endDate = formatDateTime(toDateValue, toTimeValue);

  const config = {
    report_name: "Room_Widget",
    criteria: `(Booking_Status == "Upcoming Booking" && Reservation_ID.Room == ${roomID} && (
      (Start_Time >= "${startDate}" && Start_Time <= "${endDate}") || 
      (End_Time >= "${startDate}" && End_Time <= "${endDate}") || 
      (Start_Time <= "${startDate}" && End_Time >= "${endDate}")
    ))`
  };

  try {
    const booking = await init.getRecords(config);
    console.log("booking == ", booking);
    if (booking.code == 3000) {
      const data = booking.data;

      if (type == "FromTime") {
        const maxEndTime = data.reduce((max, item) => {
          const endTime = new Date(item.End_Time);
          return endTime > max ? endTime : max;
        }, new Date(0));

        const newFromTime = new Date(maxEndTime.getTime() + 15 * 60000); // +15 min

        // Update date & time inputs
        fromDateInput.value = formatInputDate(newFromTime);
        fromTimeInput.value = formatInputTime(newFromTime);
        alert(`From Time has been adjusted to ${fromDateInput.value} ${fromTimeInput.value} due to overlapping booking.`);
        console.log("Updated From Date/Time:", fromDateInput.value, fromTimeInput.value);
      } else if (type == "ToTime") {
        const minStartTime = data.reduce((min, item) => {
          const startTime = new Date(item.Start_Time);
          return startTime < min ? startTime : min;
        }, new Date(8640000000000000));

        const newToTime = new Date(minStartTime.getTime() - 15 * 60000); // -15 min

        // Update date & time inputs
        toDateInput.value = formatInputDate(newToTime);
        toTimeInput.value = formatInputTime(newToTime);
        alert(`To Time has been adjusted to ${toDateInput.value} ${toTimeInput.value} due to overlapping booking.`);
        console.log("Updated To Date/Time:", toDateInput.value, toTimeInput.value);
      }
    }
  } catch (error) {
    console.log("Error fetching bookings:", error);
  }
}
function formatInputDate(dateObj) {
  // Returns YYYY-MM-DD
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatInputTime(dateObj) {
  // Returns HH:MM (24-hour)
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function formatDateTime(dateValue, timeValue) {
  const dateObj = new Date(`${dateValue}T${timeValue}`);
  if (isNaN(dateObj.getTime())) return "";

  const day = String(dateObj.getDate()).padStart(2, '0');
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');

  return `${day}-${month}-${year} ${hours}:${minutes}`;
}
function validParticipants(event) {
  console.log(event.target.value);
  if (event.target.value < 0) {
    document.getElementById("bookingCapacity").value = 0;
  }
}