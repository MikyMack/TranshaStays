const PremiumApartment = require("../models/PremiumApartment");
const PremiumApartmentBooking = require("../models/PremiumApartmentBooking");

// ✅ Helper: calculate nights
const calculateNights = (checkIn, checkOut) => {
  const diff = new Date(checkOut) - new Date(checkIn);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// ✅ CREATE BOOKING with date overlap check
const nodemailer = require("nodemailer");

exports.createBooking = async (req, res) => {
  try {
    const {
      apartmentId,
      bookingType,
      fullApartmentId,
      roomIds = [],
      guestDetails,
      checkInDate,
      checkOutDate,
      totalGuests,
      specialRequests,
    } = req.body;

    // Basic validation
    if (!apartmentId || !bookingType)
      return res.status(400).json({ message: "Missing required fields" });

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkOut <= checkIn) {
      return res.status(400).json({ message: "Invalid check-in/check-out dates" });
    }

    const apartment = await PremiumApartment.findById(apartmentId);
    if (!apartment)
      return res.status(404).json({ message: "Apartment not found" });

    // ✅ Construct safe query based on type
    let conflictQuery = {
      apartment: apartmentId,
      bookingStatus: { $in: ["Confirmed", "Pending"] },
      $or: [{ checkInDate: { $lt: checkOut }, checkOutDate: { $gt: checkIn } }],
    };

    if (bookingType === "Full Apartment" && fullApartmentId) {
      conflictQuery.fullApartmentId = fullApartmentId;
    } else if (bookingType === "Room" && roomIds.length > 0) {
      conflictQuery.roomIds = { $in: roomIds };
    }

    const conflict = await PremiumApartmentBooking.findOne(conflictQuery);

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: "Selected apartment or room is already booked for these dates",
      });
    }

    // ✅ Calculate total nights & price
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    let totalPrice = 0;

    if (bookingType === "Full Apartment") {
      const fullApt = apartment.apartments.id(fullApartmentId);
      if (!fullApt)
        return res.status(400).json({ message: "Invalid full apartment ID" });

      totalPrice = fullApt.pricePerNight * nights;
    } else {
      for (const id of roomIds) {
        const room = apartment.rooms.id(id);
        if (room) totalPrice += room.pricePerNight * nights;
      }
    }

    // ✅ Build booking object safely
    const bookingData = {
      apartment: apartmentId,
      bookingType,
      guestDetails,
      checkInDate,
      checkOutDate,
      totalGuests,
      totalNights: nights,
      totalPrice,
      specialRequests,
    };

    if (bookingType === "Full Apartment" && fullApartmentId) {
      bookingData.fullApartmentId = fullApartmentId;
    } else if (bookingType === "Room" && roomIds.length > 0) {
      bookingData.roomIds = roomIds;
    }

    const booking = new PremiumApartmentBooking(bookingData);
    await booking.save();

    // --- Email notifications ---
    // We assume guestDetails.email is provided
    let guestEmail = guestDetails && guestDetails.email ? guestDetails.email : null;
    let guestName = guestDetails && guestDetails.name ? guestDetails.name : "Guest";
    let apartmentName = apartment.propertyTitle || apartment.name || "Apartment";
    let adminEmail = "ashif.india91@gmail.com";

    // Setup nodemailer transporter (uses .env values for admin send)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_PASS
      }
    });

    // Admin notification
    const adminMailOptions = {
      from: `"Transha Stays" <${process.env.ADMIN_EMAIL}>`,
      to: adminEmail,
      subject: `New Booking for ${apartmentName}`,
      html: `
        <h2>New Premium Apartment Booking!</h2>
        <p>A new booking has been received:</p>
        <ul>
          <li><strong>Guest:</strong> ${guestName}</li>
          <li><strong>Email:</strong> ${guestEmail}</li>
          <li><strong>Apartment:</strong> ${apartmentName}</li>
          <li><strong>Booking Type:</strong> ${bookingType}</li>
          <li><strong>Check-in:</strong> ${checkInDate}</li>
          <li><strong>Check-out:</strong> ${checkOutDate}</li>
          <li><strong>Nights:</strong> ${nights}</li>
          <li><strong>Total Guests:</strong> ${totalGuests}</li>
          <li><strong>Total:</strong> ₹${totalPrice.toLocaleString()}</li>
          <li><strong>Special Requests:</strong> ${specialRequests || "None"}</li>
        </ul>
        <p>View booking in dashboard for more details.</p>
      `
    };

    // Guest email (catchy/appealing booking confirmation)
    const guestMailOptions = guestEmail ? {
      from: `"Transha Stays" <${process.env.ADMIN_EMAIL}>`,
      to: guestEmail,
      subject: `Your Booking at Transha Stays is Confirmed!`,
      html: `
        <div style="font-family:sans-serif; background:#f8f8fb; padding:24px;">
          <h2 style="color:#306691">You've Locked In Your Dream Stay!</h2>
          <p>Dear ${guestName},</p>
          <p>
            Thank you for choosing <strong>${apartmentName}</strong>! <br>
            Your booking is <b>confirmed</b>, and our doors await your arrival.
          </p>
          <ul style="background:#fff; border-radius:8px; box-shadow:0 2px 6px rgba(100,100,100,.09); padding:18px; margin:16px 0;">
            <li><strong>Check-in:</strong> ${checkInDate}</li>
            <li><strong>Check-out:</strong> ${checkOutDate}</li>
            <li><strong>Booking Type:</strong> ${bookingType}</li>
            <li><strong>Total Nights:</strong> ${nights}</li>
            <li><strong>Total Guests:</strong> ${totalGuests}</li>
            <li><strong>Total Price:</strong> ₹${totalPrice.toLocaleString()}</li>
          </ul>
          <p>
            <b>Special requests:</b> ${specialRequests || "None given"}<br>
            If you have more preferences, just reply to this email!
          </p>
          <p style="color:#6cb24b; font-weight:bold;">
            Get ready for comfort, style, and amazing hospitality at Transha Stays.<br>
            See you soon!
          </p>
          <hr style="border:none; border-top:1px solid #eee; margin:18px 0;">
          <p style="font-size:14px; color:#708090">
            For queries or assistance, call us at <a href="tel:+919605832333">+91 96058 32333</a><br>
            Or reply directly to this email.
          </p>
        </div>
      `
    } : null;

    // Send admin mail
    transporter.sendMail(adminMailOptions, (err, info) => {
      if (err) {
        console.error("Admin booking email error:", err);
      }
    });

    // Send guest mail (if email available)
    if (guestMailOptions) {
      transporter.sendMail(guestMailOptions, (err, info) => {
        if (err) {
          console.error("Guest booking email error:", err);
        }
      });
    }

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking,
    });

  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating booking",
      error: error.message,
    });
  }
};


// ✅ GET ALL BOOKINGS
exports.listBookings = async (req, res) => {
  try {
    const bookings = await PremiumApartmentBooking.find().populate("apartment");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching bookings", error: err.message });
  }
};

// ✅ GET SINGLE BOOKING
exports.getBooking = async (req, res) => {
  try {
    const booking = await PremiumApartmentBooking.findById(req.params.id).populate("apartment");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: "Error fetching booking", error: err.message });
  }
};

// ✅ CANCEL BOOKING (Restore availability)
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await PremiumApartmentBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const apartment = await PremiumApartment.findById(booking.apartment);
    if (!apartment) return res.status(404).json({ message: "Apartment not found" });

    // Restore availability
    if (booking.bookingType === "Full Apartment" && booking.fullApartmentId) {
      const apt = apartment.apartments.id(booking.fullApartmentId);
      if (apt) apt.isAvailable = true;
    } else if (booking.bookingType === "Room" && booking.roomIds.length) {
      booking.roomIds.forEach((id) => {
        const room = apartment.rooms.id(id);
        if (room) room.isAvailable = true;
      });
    }

    booking.bookingStatus = "Cancelled";
    booking.paymentStatus = "Cancelled";
    await apartment.save();
    await booking.save();

    res.json({ success: true, message: "Booking cancelled and availability restored" });
  } catch (err) {
    res.status(500).json({ message: "Error cancelling booking", error: err.message });
  }
};

// ✅ UPDATE BOOKING STATUS (Completed, Paid)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const booking = await PremiumApartmentBooking.findByIdAndUpdate(
      req.params.id,
      { bookingStatus: status, paymentStatus },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ message: "Error updating booking", error: err.message });
  }
};

// ✅ DELETE BOOKING (Admin only!)
exports.deletePremiumApartmentBooking = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ success: false, message: "Booking ID required" });

    const booking = await PremiumApartmentBooking.findById(id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    // Optionally: restore apartment/room availability if needed
    const apartment = await PremiumApartment.findById(booking.apartment);
    if (apartment) {
      if (booking.bookingType === "Full Apartment" && booking.fullApartmentId) {
        const apt = apartment.apartments.id(booking.fullApartmentId);
        if (apt) apt.isAvailable = true;
      } else if (booking.bookingType === "Room" && booking.roomIds.length) {
        booking.roomIds.forEach((id) => {
          const room = apartment.rooms.id(id);
          if (room) room.isAvailable = true;
        });
      }
      await apartment.save();
    }

    await PremiumApartmentBooking.findByIdAndDelete(id);

    res.json({ success: true, message: "Booking deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting booking", error: err.message });
  }
};

