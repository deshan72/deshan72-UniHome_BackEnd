import express from 'express';
import {
  createAccommodation,
  getAccommodations,
  getAccommodation,
  updateAccommodation,
  deleteAccommodation,
  getMyListings,
  getPendingListings,
  getAllListingsAdmin,
  toggleAvailability,
  toggleDeactivate,
  updateRoomAvailability,
  approveAccommodation,
} from '../controllers/accommodationController.js';


const router = express.Router();

// ── Public ──
router.get('/', getAccommodations);

// ── Owner ──
router.get('/my/listings', protect, authorize('owner', 'admin'), getMyListings);
router.post('/', protect, authorize('owner', 'admin'), createAccommodation);

// ── Owner Actions ──
router.put('/:id', protect, authorize('owner', 'admin'), updateAccommodation);
router.delete('/:id', protect, authorize('owner', 'admin'), deleteAccommodation);
router.patch('/:id/availability', protect, authorize('owner', 'admin'), toggleAvailability);
router.patch('/:id/deactivate', protect, authorize('owner', 'admin'), toggleDeactivate);
router.patch('/:id/rooms/:roomTypeId', protect, authorize('owner', 'admin'), updateRoomAvailability);

// ── Public Single ──
router.get('/:id', getAccommodation);

// ── Admin ──
router.get('/admin/pending', protect, authorize('admin'), getPendingListings);
router.get('/admin/all', protect, authorize('admin'), getAllListingsAdmin);
router.patch('/:id/approve', protect, authorize('admin'), approveAccommodation);


export default router;