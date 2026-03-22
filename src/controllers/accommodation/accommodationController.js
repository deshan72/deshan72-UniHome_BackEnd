import mongoose from "mongoose";
import Accommodation from '../../models/accommodation/Accommodation.js';
import ResponseHandler from '../../views/accommodation/responseHandler.js';

const SLIIT_LAT = 6.9147;
const SLIIT_LNG = 79.9729;

const toRad = (deg) => deg * (Math.PI / 180);

const calcDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ──────────────────────────────────────────────
// @desc    Create new listing (Owner)
// @route   POST /api/accommodations/create
// @access  Private (Owner)
// ──────────────────────────────────────────────


// export const createAccommodation = async (req, res, next) => {
//   try {
//     // req.body.owner = req.user.id;

//     // PENDING - Needs Admin Approval
//     req.body.status = 'Pending';

//     if (req.body.pricing?.monthlyRent) {
//       req.body.price = req.body.pricing.monthlyRent;
//     }

//     if (req.body.roomTypes) {
//       req.body.roomTypes = req.body.roomTypes.map((room) => ({
//         ...room,
//         availableRooms: room.availableRooms ?? room.totalRooms,
//       }));
//     }

//     const accommodation = await Accommodation.create(req.body);

//     return ResponseHandler.created(res, {
//       message: 'Listing created! Pending admin approval.',
//       data: accommodation,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

export const createAccommodation = async (req, res) => {
  try {
    // ❌ old (auth needed)
    // const ownerId = req.user.id;

    // ✅ temporary sample owner id (until auth is implemented)
    const ownerId = 1; // DB එකේ තියෙන valid user id එකක් දාන්න

    const {
      title,
      description,
      address,
      city,
      pricePerMonth,
      roomType,
      availableFrom
    } = req.body;

    // basic validation
    if (!title || !address || !city || !pricePerMonth) {
      return res.status(400).json({
        message: "title, address, city, pricePerMonth are required",
      });
    }

    // model/service call (ඔයාගේ existing logic එකට match කරගන්න)
    const newAccommodation = await Accommodation.create({
      ownerId,
      title,
      description,
      address,
      city,
      pricePerMonth,
      roomType,
      availableFrom,
    });

    return res.status(201).json({
      message: "Accommodation created successfully",
      data: newAccommodation,
    });
  } catch (error) {
    console.error("createAccommodation error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ──────────────────────────────────────────────
// @desc    Get all listings (Public - Active ONLY)
// @route   GET /api/accommodations
// @access  Public
// ──────────────────────────────────────────────
export const getAccommodations = async (req, res, next) => {
  try {
    const {
      type, minPrice, maxPrice, city, area,
      genderPreference, roomType, minimumPeriod,
      amenities, search,
      sortBy, page = 1, limit = 12,
    } = req.query;

    // ONLY Active listings shown to students
    const filter = {
      status: 'Active',
      isAvailable: true,
      isDeactivated: false,
    };

    if (type) filter.type = type;
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (area) filter['location.area'] = new RegExp(area, 'i');
    if (genderPreference && genderPreference !== 'Any') filter.genderPreference = genderPreference;
    if (minimumPeriod) filter.minimumPeriod = minimumPeriod;
    if (roomType) filter['roomTypes.type'] = roomType;

    if (amenities) {
      const amenityList = amenities.split(',').map((a) => a.trim());
      filter.amenities = { $all: amenityList };
    }

    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { 'location.address': new RegExp(search, 'i') },
      ];
    }

    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) priceFilter.$gte = parseInt(minPrice);
      if (maxPrice) priceFilter.$lte = parseInt(maxPrice);
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { 'pricing.monthlyRent': priceFilter },
          { price: priceFilter },
          { 'roomTypes.pricePerMonth': priceFilter },
        ],
      });
    }

    let sort = { createdAt: -1 };
    if (sortBy === 'price_asc') sort = { price: 1 };
    if (sortBy === 'price_desc') sort = { price: -1 };
    if (sortBy === 'rating') sort = { rating: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Accommodation.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    const accommodations = await Accommodation.find(filter)
      .populate('owner', 'name email phone isVerified avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const data = accommodations.map((acc) => {
      const obj = acc.toObject();
      obj.distanceToSLIIT = parseFloat(
        calcDistance(obj.location.lat, obj.location.lng, SLIIT_LAT, SLIIT_LNG).toFixed(2)
      );
      return obj;
    });

    if (sortBy === 'distance') {
      data.sort((a, b) => a.distanceToSLIIT - b.distanceToSLIIT);
    }

    return res.json({
      success: true,
      data,
      meta: { total, totalPages, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// @desc    Get single accommodation
// @route   GET /api/accommodations/:id
// @access  Public
// ──────────────────────────────────────────────
// export const getAccommodation = async (req, res, next) => {
//   try {
//     const accommodation = await Accommodation.findById(req.params.id)
//       .populate('owner', 'name email phone isVerified avatar');

//     if (!accommodation) {
//       return ResponseHandler.notFound(res, 'Accommodation not found');
//     }

//     const data = accommodation.toObject();
//     data.distanceToSLIIT = parseFloat(
//       calcDistance(data.location.lat, data.location.lng, SLIIT_LAT, SLIIT_LNG).toFixed(2)
//     );

//     return ResponseHandler.success(res, { data });
//   } catch (error) {
//     next(error);
//   }
// };

export const getAccommodation = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return ResponseHandler.badRequest(res, "Invalid accommodation id");
    }

    const accommodation = await Accommodation.findById(id)
      .populate("owner", "name email phone isVerified avatar");

    if (!accommodation) {
      return ResponseHandler.notFound(res, "Accommodation not found");
    }

    const data = accommodation.toObject();

    if (data.location?.lat != null && data.location?.lng != null) {
      data.distanceToSLIIT = parseFloat(
        calcDistance(data.location.lat, data.location.lng, SLIIT_LAT, SLIIT_LNG).toFixed(2)
      );
    } else {
      data.distanceToSLIIT = null;
    }

    return ResponseHandler.success(res, { data });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// @desc    Get owner's listings
// @route   GET /api/accommodations/my/listings
// @access  Private (Owner)
// ──────────────────────────────────────────────
// export const getMyListings = async (req, res, next) => {
//   try {
//     const { status, page = 1, limit = 10 } = req.query;
//     const filter = { owner: req.user.id };
//     if (status) filter.status = status;

//     const skip = (parseInt(page) - 1) * parseInt(limit);
//     const total = await Accommodation.countDocuments(filter);
//     const totalPages = Math.ceil(total / parseInt(limit));

//     const listings = await Accommodation.find(filter)
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     return res.json({
//       success: true,
//       data: listings,
//       meta: { total, totalPages, page: parseInt(page), limit: parseInt(limit) },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

export const getMyListings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    // temp owner id (must be valid Mongo ObjectId string)
    const sampleOwnerId = "69be914cd46f87a2a260d7d0";

    if (!mongoose.Types.ObjectId.isValid(sampleOwnerId)) {
      return res.status(400).json({ message: "Invalid owner id" });
    }

    const filter = { owner: new mongoose.Types.ObjectId(sampleOwnerId) };
    if (status) filter.status = status;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Accommodation.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum);

    const listings = await Accommodation.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return res.json({
      success: true,
      data: listings,
      meta: { total, totalPages, page: pageNum, limit: limitNum },
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// @desc    Update accommodation
// @route   PUT /api/accommodations/:id
// @access  Private (Owner)
// ──────────────────────────────────────────────
// export const updateAccommodation = async (req, res, next) => {
//   try {
//     let accommodation = await Accommodation.findById(req.params.id);
//     if (!accommodation) return ResponseHandler.notFound(res, 'Not found');
//     if (accommodation.owner.toString() !== req.user.id && req.user.role !== 'admin') {
//       return ResponseHandler.forbidden(res, 'Not authorized');
//     }

//     if (req.body.pricing?.monthlyRent) req.body.price = req.body.pricing.monthlyRent;

//     accommodation = await Accommodation.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
//     return ResponseHandler.success(res, { message: 'Updated!', data: accommodation });
//   } catch (error) {
//     next(error);
//   }
// };
export const updateAccommodation = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return ResponseHandler.badRequest(res, "Invalid accommodation id");
    }

    let accommodation = await Accommodation.findById(id);
    if (!accommodation) {
      return ResponseHandler.notFound(res, "Not found");
    }

    // ✅ Auth නැති temporary mode:
    // req.user check remove කරලා owner check skip කරනවා
    // (later auth හදද්දී මේ authorization block එක නැවත add කරන්න)

    if (req.body.pricing?.monthlyRent) {
      req.body.price = req.body.pricing.monthlyRent;
    }

    accommodation = await Accommodation.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return ResponseHandler.success(res, {
      message: "Updated!",
      data: accommodation,
    });
  } catch (error) {
    next(error);
  }
};



// ──────────────────────────────────────────────
// @desc    Delete accommodation
// @route   DELETE /api/accommodations/:id
// @access  Private (Owner/Admin)
// ──────────────────────────────────────────────
// export const deleteAccommodation = async (req, res, next) => {
//   try {
//     const accommodation = await Accommodation.findById(req.params.id);
//     if (!accommodation) return ResponseHandler.notFound(res, 'Not found');
//     if (accommodation.owner.toString() !== req.user.id && req.user.role !== 'admin') {
//       return ResponseHandler.forbidden(res, 'Not authorized');
//     }

//     const activeBookings = await Booking.countDocuments({
//       accommodation: req.params.id,
//       status: { $in: ['Pending', 'Accepted', 'Active'] },
//     });
//     if (activeBookings > 0) {
//       return ResponseHandler.error(res, { statusCode: 400, message: activeBookings + ' active booking(s) exist.' });
//     }

//     await accommodation.deleteOne();
//     return ResponseHandler.success(res, { message: 'Deleted!' });
//   } catch (error) {
//     next(error);
//   }
// };
export const deleteAccommodation = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return ResponseHandler.badRequest(res, "Invalid accommodation id");
    }

    const accommodation = await Accommodation.findById(id);
    if (!accommodation) {
      return ResponseHandler.notFound(res, "Not found");
    }

    // ✅ Auth නැති temporary mode:
    // owner / admin authorization check removed
    // (production එකට යනකොට req.user checks නැවත add කරන්න)

    const activeBookings = await Booking.countDocuments({
      accommodation: id,
      status: { $in: ["Pending", "Accepted", "Active"] },
    });

    if (activeBookings > 0) {
      return ResponseHandler.error(res, {
        statusCode: 400,
        message: `${activeBookings} active booking(s) exist.`,
      });
    }

    await accommodation.deleteOne();
    return ResponseHandler.success(res, { message: "Deleted!" });
  } catch (error) {
    next(error);
  }
};











// ──────────────────────────────────────────────
// Toggle Availability
// ──────────────────────────────────────────────
export const toggleAvailability = async (req, res, next) => {
  try {
    const accommodation = await Accommodation.findById(req.params.id);
    if (!accommodation) return ResponseHandler.notFound(res, 'Not found');
    if (accommodation.owner.toString() !== req.user.id) return ResponseHandler.forbidden(res, 'Not authorized');

    accommodation.isAvailable = !accommodation.isAvailable;
    await accommodation.save();
    return ResponseHandler.success(res, {
      message: accommodation.isAvailable ? 'Available' : 'Not Available',
      data: { isAvailable: accommodation.isAvailable },
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// Toggle Deactivate
// ──────────────────────────────────────────────
export const toggleDeactivate = async (req, res, next) => {
  try {
    const accommodation = await Accommodation.findById(req.params.id);
    if (!accommodation) return ResponseHandler.notFound(res, 'Not found');
    if (accommodation.owner.toString() !== req.user.id) return ResponseHandler.forbidden(res, 'Not authorized');

    accommodation.isDeactivated = !accommodation.isDeactivated;
    await accommodation.save();
    return ResponseHandler.success(res, {
      message: accommodation.isDeactivated ? 'Hidden' : 'Visible',
      data: { isDeactivated: accommodation.isDeactivated },
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// Update Room Availability
// ──────────────────────────────────────────────
export const updateRoomAvailability = async (req, res, next) => {
  try {
    const { id, roomTypeId } = req.params;
    const { availableRooms } = req.body;

    const accommodation = await Accommodation.findById(id);
    if (!accommodation) return ResponseHandler.notFound(res, 'Not found');
    if (accommodation.owner.toString() !== req.user.id) return ResponseHandler.forbidden(res, 'Not authorized');

    const roomType = accommodation.roomTypes.id(roomTypeId);
    if (!roomType) return ResponseHandler.notFound(res, 'Room type not found');
    if (availableRooms > roomType.totalRooms) {
      return ResponseHandler.error(res, { statusCode: 400, message: 'Cannot exceed total rooms' });
    }

    roomType.availableRooms = Math.max(0, availableRooms);
    await accommodation.save();
    return ResponseHandler.success(res, { message: 'Updated!', data: accommodation });
  } catch (error) {
    next(error);
  }
};












// ──────────────────────────────────────────────
// @desc    Get ALL pending listings (Admin)
// @route   GET /api/accommodations/admin/pending
// @access  Private (Admin)
// ──────────────────────────────────────────────
export const getPendingListings = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const filter = { status: 'Pending' };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Accommodation.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    const listings = await Accommodation.find(filter)
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.json({
      success: true,
      data: listings,
      meta: { total, totalPages, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// @desc    Get ALL listings (Admin - any status)
// @route   GET /api/accommodations/admin/all
// @access  Private (Admin)
// ──────────────────────────────────────────────
export const getAllListingsAdmin = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Accommodation.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    const listings = await Accommodation.find(filter)
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.json({
      success: true,
      data: listings,
      meta: { total, totalPages, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// @desc    Approve / Reject listing (Admin)
// @route   PATCH /api/accommodations/:id/approve
// @access  Private (Admin)
// ──────────────────────────────────────────────
export const approveAccommodation = async (req, res, next) => {
  try {
    const { action, rejectionReason } = req.body;
    const accommodation = await Accommodation.findById(req.params.id);

    if (!accommodation) return ResponseHandler.notFound(res, 'Not found');

    if (action === 'approve') {
      accommodation.status = 'Active';
      accommodation.approvedBy = req.user.id;
      accommodation.approvedAt = new Date();
    } else if (action === 'reject') {
      accommodation.status = 'Rejected';
      accommodation.rejectionReason = rejectionReason || 'Does not meet requirements';
    } else {
      return ResponseHandler.error(res, { statusCode: 400, message: "Action must be 'approve' or 'reject'" });
    }

    await accommodation.save();
    return ResponseHandler.success(res, {
      message: 'Listing ' + action + 'd successfully!',
      data: accommodation,
    });
  } catch (error) {
    next(error);
  }
};